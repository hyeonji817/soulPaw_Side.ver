import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import './Login.css';
export default function Login({register=false}:{register?:boolean}) {
  const [params]=useSearchParams(); const nav=useNavigate();
  const next = '/';
  const [id,setId]=useState(localStorage.getItem('soulpaw:savedId')||''); const [password,setPassword]=useState('');
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [save,setSave]=useState(false);
  const [error,setError]=useState(params.get('error')||''); const [busy,setBusy]=useState(false);
  useEffect(()=>{apiRequest('/auth/me').then(()=>nav(next,{replace:true})).catch(()=>{});},[next,nav]);
  const base=import.meta.env.VITE_API_BASE_URL||'http://localhost:4000/api';
  return <div className="wrapper_login soulpaw-login"><h1 className="logo"><Link to="/">소울포우</Link></h1><div id="login" className="box_member login"><div className="login_wrap"><div className="login_box"><form onSubmit={async e=>{
    e.preventDefault();setBusy(true);setError('');try {await apiRequest('/auth/'+(register?'register':'login'),{method:'POST',body:{id,password,name,email}});if(save)localStorage.setItem('soulpaw:savedId',id);else localStorage.removeItem('soulpaw:savedId');nav(next,{replace:true});}catch(err){setError((err as Error).message);}finally{setBusy(false);}
  }}><fieldset><legend className="hidden">{register?'회원가입':'회원 로그인'}</legend>
    <div className="fld top"><label htmlFor="login_id" className={id?'hidden':''}>ID</label><input id="login_id" className="form_input member block" value={id} onChange={e=>setId(e.target.value)} autoComplete="username" required maxLength={50}/></div>
    <div className="fld"><label htmlFor="login_pwd" className={password?'hidden':''}>PASSWORD</label><input id="login_pwd" type="password" className="form_input member block" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete={register?'new-password':'current-password'} minLength={register?8:1} maxLength={128}/></div>
    {register&&<><div className="fld"><input aria-label="이름" placeholder="NAME" className="form_input member block" value={name} onChange={e=>setName(e.target.value)} required/></div><div className="fld"><input aria-label="이메일" placeholder="EMAIL" type="email" className="form_input member block" value={email} onChange={e=>setEmail(e.target.value)} required/></div></>}
    <div className="savessl"><input id="member_ssl" type="checkbox" checked readOnly/><label htmlFor="member_ssl">보안접속</label><input id="id_save" type="checkbox" checked={save} onChange={e=>setSave(e.target.checked)}/><label htmlFor="id_save">아이디저장</label></div>
    {error&&<p role="alert" style={{color:'#d33',fontSize:14}}>{error}</p>}
    <div className="login_btn_wrap"><span className="box_btn block black2"><input disabled={busy} type="submit" value={busy?'처리 중…':register?'CREATE ACCOUNT':'LOG IN'}/></span></div>
    <div className="joinfind"><p><Link to={(register?'/login':'/account/register')+'?next='+encodeURIComponent(next)}>{register?'LOG IN':'CREATE ACCOUNT'}</Link></p></div></fieldset></form>
    <div className="sns_wrap"><div className="simple"><a className="kakao" href={`${base}/auth/kakao/start?next=${encodeURIComponent(next)}`}>카카오로 시작하기</a><a className="naver" href={`${base}/auth/naver/start?next=${encodeURIComponent(next)}`}>네이버로 시작하기</a></div></div>
  </div></div></div></div>;
}

