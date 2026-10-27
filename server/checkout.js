import crypto from 'node:crypto';
import { query, withTransaction } from './db.js';
import { requireMember } from './auth.js';
export function installCheckout(app,loadProduct,calculate) {
  app.use(['/api/cart','/api/orders','/api/payments'],requireMember,(req,res,next)=>{
    if(req.method!=='GET' && req.headers.origin!==(process.env.CLIENT_ORIGIN||'http://localhost:5173')) return res.status(403).json({message:'허용되지 않은 요청입니다.'});
    next();
  });
  const getItems = async(user,db={query}) => (await db.query(`SELECT ci.id,ci.quantity,ci.option_id AS "optionId",p.slug,p.name,p.discount_price+po.price_delta AS "unitPrice",po.label,p.stock,p.mileage,
    (SELECT asset_path FROM product_images WHERE product_id=p.id AND role='main' ORDER BY sort_order LIMIT 1) AS image
    FROM cart_items ci JOIN carts c ON c.id=ci.cart_id JOIN products p ON p.id=ci.product_id JOIN product_options po ON po.id=ci.option_id WHERE c.user_key=$1 ORDER BY ci.id`,[user])).rows;
  app.get('/api/cart',async(req,res)=>res.json({items:await getItems(req.member.id)}));
  app.post('/api/cart/items',async(req,res)=>{
    const p=await loadProduct(req.body.productSlug); if(!p) return res.status(404).json({message:'상품이 없습니다.'});
    const line=calculate(p,req.body.optionId,req.body.quantity);
    await withTransaction(async db=>{
      const cart=await db.query(`INSERT INTO carts(user_key) VALUES($1) ON CONFLICT(user_key) DO UPDATE SET updated_at=now() RETURNING id`,[req.member.id]);
      const id=cart.rows[0].id;
      const old=await db.query('SELECT * FROM cart_items WHERE cart_id=$1 AND product_id=$2 AND option_id=$3 FOR UPDATE',[id,p.id,line.option.id]);
      const qty=line.quantity+Number(old.rows[0]?.quantity||0); calculate(p,line.option.id,qty);
      if(old.rows[0]) await db.query('UPDATE cart_items SET quantity=$1,unit_price=$2,total_price=$3 WHERE id=$4',[qty,line.unitPrice,qty*line.unitPrice,old.rows[0].id]);
      else await db.query('INSERT INTO cart_items(cart_id,product_id,option_id,quantity,unit_price,total_price) VALUES($1,$2,$3,$4,$5,$6)',[id,p.id,line.option.id,qty,line.unitPrice,qty*line.unitPrice]);
    }); res.status(201).json({ok:true});
  });
  app.patch('/api/cart/items/:id',async(req,res)=>{
    const items=await getItems(req.member.id); const item=items.find(i=>String(i.id)===req.params.id); if(!item) return res.status(404).json({message:'장바구니 상품이 없습니다.'});
    const p=await loadProduct(item.slug); const line=calculate(p,item.optionId,req.body.quantity);
    await query('UPDATE cart_items SET quantity=$1,unit_price=$2,total_price=$3 WHERE id=$4',[line.quantity,line.unitPrice,line.totalPrice,item.id]); res.json({ok:true});
  });
  app.delete('/api/cart/items/:id',async(req,res)=>{await query('DELETE FROM cart_items WHERE id=$1 AND cart_id IN (SELECT id FROM carts WHERE user_key=$2)',[req.params.id,req.member.id]);res.json({ok:true});});
  app.get('/api/orders',async(req,res)=>{
    const result=await query(`SELECT o.id,o.toss_order_id,o.total_product_amount,o.total_payment_amount,o.created_at,o.status,
      (SELECT string_agg(oi.product_name, ', ' ORDER BY oi.id) FROM order_items oi WHERE oi.order_id=o.id) AS product_name
      FROM orders o WHERE o.user_key=$1 ORDER BY o.created_at DESC,o.id DESC`,[req.member.id]);
    res.json({orders:result.rows});
  });
  app.post('/api/orders',async(req,res)=>{
    const {cartIds,receiverName,receiverPhone,postalCode,address1,address2='',ordererName,ordererEmail,ordererPhone,ordererTelephone='',receiverTelephone='',deliveryMemo='',agreed}=req.body;
    if(!Array.isArray(cartIds)||!cartIds.length||!receiverName?.trim()||!/^[-+0-9 ]{9,20}$/.test(receiverPhone||'')||!/^\d{5}$/.test(postalCode||'')||!address1?.trim()||!ordererName?.trim()||!ordererEmail?.includes('@')||!/^[-+0-9 ]{9,20}$/.test(ordererPhone||'')||agreed!==true) return res.status(400).json({message:'주문자·배송지 정보와 구매 동의를 확인해 주세요.'});
    const order=await withTransaction(async db=>{
      await db.query('SELECT id FROM carts WHERE user_key=$1 FOR UPDATE',[req.member.id]);
      const items=(await getItems(req.member.id,db)).filter(i=>cartIds.map(String).includes(String(i.id)));
      if(items.length!==new Set(cartIds.map(String)).size) {const e=Error('주문할 장바구니 상품을 다시 확인해 주세요.');e.status=400;throw e;}
      const lines=[];
      for(const item of items) {
        await db.query('SELECT id FROM products WHERE slug=$1 FOR UPDATE',[item.slug]);
        const p=await loadProduct(item.slug,db); if(!p) {const e=Error('판매가 종료된 상품입니다.');e.status=400;throw e;}
        const line=calculate(p,item.optionId,item.quantity); lines.push({p,...line});
        await db.query('UPDATE products SET stock=stock-$1 WHERE id=$2',[line.quantity,p.id]);
      }
      const total=lines.reduce((sum,l)=>sum+l.totalPrice,0); const shipping=total>=50000?0:3000;
      const result=await db.query(`INSERT INTO orders(user_key,toss_order_id,receiver_name,receiver_phone,postal_code,address1,total_product_amount,shipping_fee,total_payment_amount,orderer_name,orderer_email,orderer_phone,address2,delivery_memo,orderer_telephone,receiver_telephone) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,[req.member.id,'soulpaw-'+crypto.randomUUID(),receiverName,receiverPhone,postalCode,address1,total,shipping,total+shipping,ordererName,ordererEmail,ordererPhone,address2,deliveryMemo,ordererTelephone,receiverTelephone]);
      for(const l of lines) await db.query('INSERT INTO order_items(order_id,product_id,option_id,product_name,option_label,unit_price,quantity,total_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[result.rows[0].id,l.p.id,l.option.id,l.p.pname,l.option.label,l.unitPrice,l.quantity,l.totalPrice]);
      await db.query('DELETE FROM cart_items WHERE id=ANY($1::bigint[]) AND cart_id IN (SELECT id FROM carts WHERE user_key=$2)',[cartIds,req.member.id]);
      return result.rows[0];
    }); res.status(201).json({order});
  });
  // Prevent legacy direct-purchase endpoints from bypassing the order form.
  app.post('/api/payments/prepare',(_req,res)=>res.status(400).json({message:'장바구니에서 주문서를 작성해 주세요.'}));
}

