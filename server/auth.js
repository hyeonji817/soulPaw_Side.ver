import { validateRegistration } from "./registration.js";
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { query } from './db.js';
const scrypt = promisify(crypto.scrypt);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').filter(x => x.includes('=')).map(x => { const i=x.indexOf('='); return [x.slice(0,i).trim(), x.slice(i+1)]; }));
const secure = process.env.NODE_ENV === 'production';
const cookieOptions = { httpOnly:true, sameSite:'lax', secure, path:'/api' };
export const safeNext = value => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/cart';
export async function initializeAuth() {
  await query(`CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, login_id TEXT UNIQUE, password_hash TEXT, name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', provider TEXT, provider_id TEXT, UNIQUE(provider,provider_id));
    ALTER TABLE members ADD COLUMN IF NOT EXISTS profile JSONB NOT NULL DEFAULT '{}'::jsonb;
    CREATE TABLE IF NOT EXISTS member_sessions (token_hash TEXT PRIMARY KEY, member_id TEXT REFERENCES members(id), expires_at TIMESTAMPTZ NOT NULL);
    ALTER TABLE member_sessions ADD COLUMN IF NOT EXISTS page_started BOOLEAN NOT NULL DEFAULT true;
    CREATE TABLE IF NOT EXISTS oauth_states (state_hash TEXT PRIMARY KEY, provider TEXT NOT NULL, next_path TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL);`);
}
async function session(res, member, allowBootstrap = false) {
  const token=crypto.randomBytes(32).toString('hex');
  await query(`INSERT INTO member_sessions(token_hash,member_id,expires_at,page_started) VALUES ($1,$2,now()+interval '7 days',$3)`,[hash(token),member.id,!allowBootstrap]);
  res.cookie('soulpaw_session',token,cookieOptions);
}
// Only a freshly completed OAuth redirect may survive its first document load.
export async function bootstrapSession(db, tokenHash) {
  const fresh = await db.query('UPDATE member_sessions SET page_started=true WHERE token_hash=$1 AND page_started=false AND expires_at>now() RETURNING member_id',[tokenHash]);
  if(fresh.rowCount) return true;
  await db.query('DELETE FROM member_sessions WHERE token_hash=$1',[tokenHash]);
  return false;
}
export async function requireMember(req,res,next) {
  const token=cookies(req).soulpaw_session;
  const result=token ? await query(`SELECT m.id,m.name,m.email FROM members m JOIN member_sessions s ON s.member_id=m.id WHERE s.token_hash=$1 AND s.expires_at>now()`,[hash(token)]) : {rows:[]};
  if(!result.rows[0]) return res.status(401).json({message:'로그인 후 이용해 주세요.'});
  req.member=result.rows[0]; next();
}
export function installAuth(app, origin) {
  app.use('/api/auth', (req,res,next) => {
    if(req.method!=='GET' && req.headers.origin !== origin) return res.status(403).json({message:'허용되지 않은 요청입니다.'});
    next();
  });
  app.post('/api/auth/bootstrap',async(req,res)=>{
    res.set('Cache-Control','no-store');
    const token=cookies(req).soulpaw_session;
    const retained=token ? await bootstrapSession({query},hash(token)) : false;
    if(!retained) res.clearCookie('soulpaw_session',cookieOptions);
    res.json({authenticated:retained});
  });
  app.get('/api/auth/me',requireMember,(req,res)=>res.json({user:req.member}));
  app.post('/api/auth/logout',async(req,res)=>{ const token=cookies(req).soulpaw_session; if(token) await query('DELETE FROM member_sessions WHERE token_hash=$1',[hash(token)]); res.clearCookie('soulpaw_session',cookieOptions); res.json({ok:true}); });
  app.post('/api/auth/register',async(req,res)=>{
    const validation=validateRegistration(req.body);
    if(validation.error) return res.status(400).json({message:validation.error});
    const {id,password,name,email}=req.body;
    if(!/^[a-zA-Z0-9_-]{4,50}$/.test(id||'') || typeof password!=='string' || password.length<8 || password.length>128 || !name?.trim()) return res.status(400).json({message:'아이디는 영문·숫자 4~50자, 비밀번호는 8~128자, 이름을 입력해 주세요.'});
    const salt=crypto.randomBytes(16).toString('hex');
    const passwordHash=salt+':'+(await scrypt(password,salt,64)).toString('hex');
    const result=await query(`INSERT INTO members(id,login_id,password_hash,name,email,profile) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(login_id) DO NOTHING RETURNING id,name,email`,[crypto.randomUUID(),id,passwordHash,name.trim(),email,JSON.stringify(validation.profile)]);
    if(!result.rows[0]) return res.status(409).json({message:'이미 사용 중인 아이디입니다.'});
    await session(res,result.rows[0]); res.status(201).json({user:result.rows[0]});
  });
  const attempts=new Map();
  app.post('/api/auth/login',async(req,res)=>{
    const key=req.ip; const attempt=attempts.get(key); if(attempt && attempt.until>Date.now() && attempt.count>=10) return res.status(429).json({message:'잠시 후 다시 시도해 주세요.'});
    const {id,password}=req.body; if(typeof password!=='string'||password.length>128) return res.status(400).json({message:'입력값을 확인해 주세요.'});
    const {rows}=await query('SELECT * FROM members WHERE login_id=$1',[id]);
    const [salt,stored]=(rows[0]?.password_hash || 'invalid:'+ '00'.repeat(64)).split(':');
    const calculated=await scrypt(password,salt,64);
    if(!crypto.timingSafeEqual(calculated,Buffer.from(stored,'hex')) || !rows[0]) { attempts.set(key,{count:attempt?.until>Date.now()?attempt.count+1:1,until:Date.now()+900000}); return res.status(401).json({message:'아이디 또는 비밀번호를 확인해 주세요.'}); }
    attempts.delete(key); await session(res,rows[0]); res.json({user:{id:rows[0].id,name:rows[0].name,email:rows[0].email}});
  });
  const config = provider => provider==='kakao' ? {id:process.env.KAKAO_CLIENT_ID,secret:process.env.KAKAO_CLIENT_SECRET,redirect:process.env.KAKAO_REDIRECT_URI,authorize:'https://kauth.kakao.com/oauth/authorize',token:'https://kauth.kakao.com/oauth/token',profile:'https://kapi.kakao.com/v2/user/me'} : provider==='naver' ? {id:process.env.NAVER_CLIENT_ID,secret:process.env.NAVER_CLIENT_SECRET,redirect:process.env.NAVER_REDIRECT_URI,authorize:'https://nid.naver.com/oauth2.0/authorize',token:'https://nid.naver.com/oauth2.0/token',profile:'https://openapi.naver.com/v1/nid/me'} : null;
  app.get('/api/auth/:provider/start',async(req,res)=>{
    const c=config(req.params.provider); if(!c?.id||!c.redirect||!c.secret) return res.redirect(origin+'/login?error='+encodeURIComponent('소셜 로그인 API 설정이 필요합니다.'));
    const state=crypto.randomBytes(32).toString('hex');
    await query(`INSERT INTO oauth_states VALUES($1,$2,$3,now()+interval '10 minutes')`,[hash(state),req.params.provider,safeNext(req.query.next)]);
    res.cookie('soulpaw_oauth',state,{...cookieOptions,maxAge:600000});
    res.redirect(c.authorize+'?'+new URLSearchParams({response_type:'code',client_id:c.id,redirect_uri:c.redirect,state}));
  });
  app.get('/api/auth/:provider/callback',async(req,res)=>{
    try {
      const c=config(req.params.provider); const state=req.query.state;
      if(!c||typeof state!=='string'||cookies(req).soulpaw_oauth!==state) throw Error('로그인 인증 상태가 올바르지 않습니다.');
      const {rows}=await query('DELETE FROM oauth_states WHERE state_hash=$1 AND provider=$2 AND expires_at>now() RETURNING next_path',[hash(state),req.params.provider]);
      res.clearCookie('soulpaw_oauth',cookieOptions);
      if(!rows[0]||req.query.error||typeof req.query.code!=='string') throw Error('소셜 로그인이 취소되었거나 만료되었습니다.');
      const tokenResponse=await fetch(c.token,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',client_id:c.id,client_secret:c.secret,redirect_uri:c.redirect,code:req.query.code,state}),signal:AbortSignal.timeout(15000)});
      const token=await tokenResponse.json(); if(!tokenResponse.ok||!token.access_token) throw Error('소셜 로그인 토큰 발급에 실패했습니다.');
      const profileResponse=await fetch(c.profile,{headers:{Authorization:'Bearer '+token.access_token},signal:AbortSignal.timeout(15000)}); const raw=await profileResponse.json();
      const p=req.params.provider==='naver'?raw.response:{id:raw.id,name:raw.kakao_account?.profile?.nickname,email:raw.kakao_account?.email};
      if(!profileResponse.ok||!p?.id) throw Error('사용자 정보를 확인하지 못했습니다.');
      const member=await query(`INSERT INTO members(id,name,email,provider,provider_id) VALUES($1,$2,$3,$4,$5) ON CONFLICT(provider,provider_id) DO UPDATE SET name=EXCLUDED.name RETURNING id,name,email`,[crypto.randomUUID(),p.name||p.nickname||'회원',p.email||'',req.params.provider,String(p.id)]);
      await session(res,member.rows[0],true); res.redirect(origin+'/');
    } catch(error) { res.redirect(origin+'/login?error='+encodeURIComponent(error.message)); }
  });
}

