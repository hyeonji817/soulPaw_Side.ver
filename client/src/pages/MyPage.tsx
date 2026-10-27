import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../main/SiteHeader';
import './MyPage.css';
import OrderDetail from './OrderDetail';
import { displayOrderNumber } from './orderNumber';
import { apiRequest } from '../lib/api';

type Order = {id:string; toss_order_id:string; product_name:string; total_product_amount:number; total_payment_amount:number; created_at:string; status:string};
const tabs = [['ORDER','주문내역'],['WISH LIST','관심상품'],['COUPON','쿠폰'],['MILEAGE','적립금'],['DEPOSITS','예치금'],['SECRET MILEAGE','스페셜 적립금'],['Q&A','내 상품문의'],['MYBOARD','내 상품평'],['WITHDRAW','회원 탈퇴']];
const won = (n:number) => Number(n).toLocaleString('ko-KR') + ' 원';
export default function MyPage() {
  const { orderId } = useParams();
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
    <nav aria-label="마이페이지 메뉴"><ul className="account-tabs">{tabs.map(([en,ko],i)=><li key={en}><button type="button" aria-current={tab===i?'page':undefined} onClick={()=>{setTab(i);if(orderId)nav('/mypage');}}>{en}<strong>{ko}</strong></button></li>)}</ul></nav>
    {orderId ? <OrderDetail key={orderId} id={orderId}/> : tab===0 ? <section aria-label="주문내역"><div className="account-table-scroll"><table className="account-table"><thead><tr>{['번호','주문번호','상품명','주문금액','실 결제금액','주문일자','상태'].map(title=><th key={title} scope="col">{title}</th>)}</tr></thead><tbody>
      {loading || orderError || !orders.length ? <tr><td colSpan={7} className="account-empty">{loading?'주문내역을 불러오고 있습니다.':orderError || '주문내역이 존재하지 않습니다.'}</td></tr> : orders.map((order,i)=><tr key={order.id}><td>{i+1}</td><td className="account-order-number"><Link to={`/mypage/orders/${order.id}`}>{displayOrderNumber(order)}</Link></td><td>{order.product_name}</td><td>{won(order.total_product_amount)}</td><td>{won(order.total_payment_amount)}</td><td>{new Date(order.created_at).toLocaleDateString('ko-KR')}</td><td>{({pending:'결제대기',paid:'결제완료',cancelled:'주문취소'} as Record<string,string>)[order.status] || order.status}</td></tr>)}
    </tbody></table></div><p className="account-note">* 주문번호를 클릭하시면 주문정보를 확인하실 수 있습니다. <Link to="/cart">장바구니 보기</Link></p></section> : <p role="status" style={{textAlign:'center',padding:'40px 0'}}>{tabs[tab][1]} 서비스는 준비 중입니다.</p>}
  </main></>;
}


