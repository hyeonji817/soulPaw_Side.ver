import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../main/SiteHeader';
import './Commerce.css';
import { apiRequest } from '../lib/api';

export default function MyPage() {
  const [user, setUser] = useState<{name:string;email:string}>();
  const [error, setError] = useState('');
  const nav = useNavigate();
  useEffect(() => {
    let active = true;
    apiRequest<{user:{name:string;email:string}}>('/auth/me').then(result => { if (active) setUser(result.user); }).catch(err => {
      if (!active) return;
      if (err.message.includes('로그인')) nav('/login', {replace:true});
      else setError('회원정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    });
    return () => { active = false; };
  }, [nav]);
  return <><Header/><main className="commerce"><h1>마이페이지</h1>{error ? <p role="alert">{error}</p> : user ? <><p>{user.name}님, 안녕하세요.</p><p>이메일: {user.email || '미등록'}</p><Link to="/cart">장바구니 보기</Link></> : <p role="status">회원정보를 불러오고 있습니다.</p>}</main></>;
}
