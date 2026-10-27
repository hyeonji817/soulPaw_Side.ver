import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../main/SiteHeader';
import './MyPage.css';
import { apiRequest } from '../lib/api';

type Order = {id:string; toss_order_id:string; product_name:string; total_product_amount:number; total_payment_amount:number; created_at:string; status:string};
const tabs = [['ORDER','주문내역'],['WISH LIST','관심상품'],['COUPON','쿠폰'],['MILEAGE','적립금'],['DEPOSITS','예치금'],['SECRET MILEAGE','스페셜 적립금'],['Q&A','내 상품문의'],['MYBOARD','내 상품평'],['WITHDRAW','회원 탈퇴']];
const won = (n:number) => Number(n).toLocaleString('ko-KR') + ' 원';
// Use the order's stable database ID, never the row number or payment UUID.
const displayOrderNumber = (order: Order) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(order.created_at));
  const part = (type: string) => parts.find(value => value.type === type)?.value || '';
  return `${part('year')}${part('month')}${part('day')}-${String(order.id).padStart(6, '0')}`;
};
export default function MyPage() {
  const [user,setUser] = useState<{name:string;email:string}>();
  const [orders,setOrders] = useState<Order[]>([]);
  const [error,setError] = useState('');
  const [orderError,setOrderError] = useState('');
  const [loading,setLoading] = useState(true);
  const [tab,setTab] = useState(0);
  const nav = useNavigate();
  useEffect(() => {
    let active = true;
    apiRequest<{user:{name:string;email:string}}>('/auth/me').then(result => {if(active) setUser(result.user);}).catch(err => {
      if(!active) return;
      if(err.message.includes('로그인')) nav('/login',{replace:true});
      else setError('회원정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    });
    apiRequest<{orders:Order[]}>('/orders').then(result => {if(active) setOrders(result.orders);}).catch(() => {if(active) setOrderError('주문내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');}).finally(() => {if(active) setLoading(false);});
    return () => {active=false;};
  },[nav]);
  return <><Header/><main className="account-page"><h1>MY PAGE</h1>
    <section className="account-profile" aria-label="회원 정보">{error ? <p role="alert">{error}</p> : user ? <><p><strong>{user.name}</strong>님은 MEMBER</p><small>{user.email || '이메일 미등록'}</small></> : <p role="status">회원정보를 불러오고 있습니다.</p>}
    <ul className="account-benefits"><li>쿠폰 — 장</li><li>적립금 — 원</li><li>포인트 — P</li></ul></section>
    <nav aria-label="마이페이지 메뉴"><ul className="account-tabs">{tabs.map(([en,ko],i)=><li key={en}><button type="button" aria-current={tab===i?'page':undefined} onClick={()=>setTab(i)}>{en}<strong>{ko}</strong></button></li>)}</ul></nav>
    {tab===0 ? <section aria-label="주문내역"><div className="account-table-scroll"><table className="account-table"><thead><tr>{['번호','주문번호','상품명','주문금액','실 결제금액','주문일자','상태'].map(title=><th key={title} scope="col">{title}</th>)}</tr></thead><tbody>
      {loading || orderError || !orders.length ? <tr><td colSpan={7} className="account-empty">{loading?'주문내역을 불러오고 있습니다.':orderError || '주문내역이 존재하지 않습니다.'}</td></tr> : orders.map((order,i)=><tr key={order.id}><td>{i+1}</td><td className="account-order-number">{displayOrderNumber(order)}</td><td>{order.product_name}</td><td>{won(order.total_product_amount)}</td><td>{won(order.total_payment_amount)}</td><td>{new Date(order.created_at).toLocaleDateString('ko-KR')}</td><td>{({pending:'결제대기',paid:'결제완료',cancelled:'주문취소'} as Record<string,string>)[order.status] || order.status}</td></tr>)}
    </tbody></table></div><p className="account-note">주문 관련 문의는 고객센터를 이용해 주세요. <Link to="/cart">장바구니 보기</Link></p></section> : <p role="status" style={{textAlign:'center',padding:'40px 0'}}>{tabs[tab][1]} 서비스는 준비 중입니다.</p>}
  </main></>;
}

