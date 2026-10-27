import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { displayOrderNumber } from './orderNumber';
import './OrderDetail.css';

type Item = {id:string;product_name:string;option_label:string;unit_price:number;quantity:number;total_price:number;image:string|null};
type Order = {id:string;created_at:string;status:string;orderer_name:string;orderer_telephone:string;orderer_phone:string;receiver_name:string;receiver_telephone:string;receiver_phone:string;postal_code:string;address1:string;address2:string;delivery_memo:string;total_product_amount:number;shipping_fee:number;total_payment_amount:number;items:Item[]};
const assets=import.meta.glob('../assets/**/*.{png,jpg,jpeg,svg}',{eager:true,query:'?url',import:'default'});
const asset=(path:string)=>(assets['../assets/'+path] as string) || path;
const won=(n:number)=>Number(n).toLocaleString('ko-KR')+' 원';
const status=(s:string)=>({pending:'결제대기',paid:'결제완료',cancelled:'주문취소',failed:'결제실패'}[s] || s);
function InfoTable({rows}:{rows:[string, string][]}){return <table className="detail-info"><tbody>{rows.map(([label,value])=><tr key={label}><th scope="row">{label}</th><td>{value || '-'}</td></tr>)}</tbody></table>;}
export default function OrderDetail({id}:{id:string}){
  const [order,setOrder]=useState<Order>();
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  useEffect(()=>{let active=true;setOrder(undefined);setError('');setNotice('');
    apiRequest<{order:Order}>(`/orders/${encodeURIComponent(id)}`).then(result=>{if(active)setOrder(result.order);}).catch(err=>{if(active)setError(err.message);});
    return ()=>{active=false;};
  },[id]);
  if(error)return <section className="order-detail"><p role="alert">{error}</p><Link to="/mypage">주문목록</Link></section>;
  if(!order)return <p role="status">주문 정보를 불러오고 있습니다.</p>;
  const unavailable=(label:string)=>setNotice(`${label} 기능은 준비 중입니다. 고객센터로 문의해 주세요.`);
  return <section className="order-detail" aria-label="주문 상세">
    <div className="detail-heading"><h2>주문번호 : {displayOrderNumber(order)}</h2><button onClick={()=>window.print()}>계산서출력</button></div>
    <div className="detail-scroll"><table className="detail-products"><colgroup><col style={{width:'26%'}}/><col style={{width:'15%'}}/>{[12,5,12,10,10,10].map((width,i)=><col key={i} style={{width:`${width}%`}}/>)}</colgroup><thead><tr>{['상품명','옵션','가격','수량','총 금액','적립금','상태','후기작성'].map(label=><th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{order.items.map(item=><tr key={item.id}><td><div className="detail-product">{item.image && <img src={asset(item.image)} alt={item.product_name}/>}<span>{item.product_name}</span></div></td><td>{item.option_label || '-'}</td><td>{won(item.unit_price)}</td><td>{item.quantity}</td><td>{won(item.total_price)}</td><td>—</td><td>{status(order.status)}<br/><button onClick={()=>unavailable('배송조회')}>배송조회</button></td><td><button className="detail-dark" onClick={()=>unavailable('후기작성')}>후기작성</button></td></tr>)}</tbody></table></div>
    <div className="detail-layout"><div><h3>주문자 정보</h3><InfoTable rows={[
      ['주문일자',new Date(order.created_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})],['주문하시는 분',order.orderer_name],['전화번호',order.orderer_telephone],['휴대전화번호',order.orderer_phone],
    ]}/><h3>배송지 정보</h3><InfoTable rows={[
      ['받으시는 분',order.receiver_name],['전화번호',order.receiver_telephone],['휴대전화번호',order.receiver_phone],['주소',`[${order.postal_code}]\n${order.address1} ${order.address2 || ''}`],['배송시요청사항',order.delivery_memo],
    ]}/></div><aside className="detail-payment"><h4>결제 정보</h4><dl><dt>상품합계금액</dt><dd>{won(order.total_product_amount)}</dd><dt>배송비</dt><dd>{won(order.shipping_fee)}</dd><dt>적립금 결제</dt><dd>—</dd><dt>쿠폰할인 금액</dt><dd>—</dd><dt><strong>총 결제금액</strong></dt><dd><strong>{won(order.total_payment_amount)}</strong></dd><dt>총 적립금</dt><dd>—</dd></dl><h3>결제수단 정보</h3><dl><dt>결제방법</dt><dd>—</dd><dt>거래정보</dt><dd>{status(order.status)}</dd><dt>입금일자</dt><dd>—</dd></dl></aside></div>
    <h3>주문 1:1 문의</h3><div className="detail-scroll"><table className="detail-inquiries"><thead><tr>{['번호','답변','분류','제목','작성일'].map(label=><th scope="col" key={label}>{label}</th>)}</tr></thead><tbody><tr><td colSpan={5}>주문 문의 서비스는 준비 중입니다.</td></tr></tbody></table></div>
    {notice && <p role="status">{notice}</p>}
    <div className="detail-actions">{['주문문의','주문변경','취소/환불신청'].map(label=><button key={label} onClick={()=>unavailable(label)}>{label}</button>)}<Link className="detail-dark" to="/mypage">주문목록</Link></div>
  </section>;
}


