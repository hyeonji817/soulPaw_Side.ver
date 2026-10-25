// Run against an isolated, seeded database and API: node server/commerce.test.mjs
import assert from 'node:assert/strict';
const base=process.env.TEST_API||'http://127.0.0.1:4018/api';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5188';
let cookie='';
async function call(path,method='GET',body,expected=200,session=cookie){
 const r=await fetch(base+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...(session?{Cookie:session}:{})},body:body?JSON.stringify(body):undefined,redirect:'manual'});
 assert.equal(r.status,expected,path);if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return r.status===302?r:await r.json();
}
await call('/orders','POST',{},401,'');
await call('/payments/prepare','POST',{},401,'');
await call('/cart','GET',undefined,401,'');
const id='test_'+Date.now();
await call('/auth/register','POST',{id,password:'test-password-2026',name:'테스트 회원',email:'test@example.invalid'},201);
await call('/auth/me');
const products=await call('/products'); const product=await call('/products/'+products.products[0].slug); const p=product.product||product;
await call('/cart/items','POST',{productSlug:p.slug,optionId:p.options[0].id,quantity:1},201);
let cart=await call('/cart');assert.equal(cart.items.length,1);const item=cart.items[0];
await call('/cart/items/'+item.id,'PATCH',{quantity:2});
await call('/cart/items/'+item.id,'PATCH',{quantity:-1},400);
await call('/orders','POST',{cartIds:[item.id]},400);
const form={cartIds:[item.id],ordererName:'테스트',ordererEmail:'test@example.invalid',ordererPhone:'01000000000',receiverName:'수령인',receiverPhone:'01000000000',postalCode:'12345',address1:'테스트 주소',agreed:true,total_payment_amount:1};
const {order}=await call('/orders','POST',form,201);
const expected=2*Number(item.unitPrice);assert.equal(order.total_product_amount,expected);assert.equal(order.total_payment_amount,expected+(expected>=50000?0:3000));assert.equal((await call('/cart')).items.length,0);
await call('/orders','POST',form,400);
await call('/auth/logout','POST',{});
await call('/auth/me','GET',undefined,401);
await call('/auth/login','POST',{id,password:'wrong'},401);
await call('/auth/login','POST',{id,password:'test-password-2026'});
const firstCookie=cookie;
await call('/auth/register','POST',{id:'other_'+Date.now(),password:'test-password-2026',name:'다른 회원'},201);
await call('/cart/items/'+item.id,'PATCH',{quantity:1},404);
const oauth=await call('/auth/kakao/callback?state=invalid&code=fake','GET',undefined,302);assert.match(oauth.headers.get('location'),/login\?error=/);
await call('/auth/me','GET',undefined,200,firstCookie);
console.log('PASS: guest purchase guard, registration/login/logout, session validation, cart quantity and ownership, order validation, server pricing, duplicate order rejection, OAuth state rejection.');
console.log('Visual fixture login:',id,'/ test-password-2026');
