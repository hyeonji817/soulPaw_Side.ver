import "./Header.css"; 
// import { useNavigate } from "react-router-dom"; 
// import { useEffect, useState } from "react"; 
import { Link } from "react-router-dom"; 
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import userIcon from "../assets/user.png";

const Header = () => {
  const [member, setMember] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [accountError, setAccountError] = useState("");
  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setAccountError("");
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
      window.location.assign('/login');
    } catch {
      setAccountError('로그아웃에 실패했습니다. 다시 시도해 주세요.');
      setLoggingOut(false);
    }
  };
  useEffect(() => { apiRequest('/auth/me').then(() => setMember(true)).catch(() => setMember(false)); }, []);
  return (
    <header className="common_top">
      <div className="header_nav">
        <Link className="logo" to="/">소울포우</Link>
        <ul className="nav-right">
          <li>
            <Link className="link" to="/">상품</Link>
            <ul className="submenu">
              <li>
                <Link className="link" to="/">리빙용품</Link>
              </li>
              <li>
                <Link className="link" to="/">사료간식</Link>  
              </li> 
              <li>
                <Link className="link" to="/">패션용품</Link>  
              </li> 
              <li>
                <Link className="link" to="/">의약용품</Link>  
              </li>   
            </ul>     {/** submenu end */}
          </li>
          <li>
          <Link className="link" to="/customer_main">고객센터</Link>
            <ul className="submenu">
              <li>
                <Link className="link" to="/customer_main">공지사항</Link>
              </li>
              <li>
                <Link className="link" to="/customer_policy">운영정책</Link>
              </li>
              <li>
                <Link className="link" to="/customer_question">Q&A</Link>
              </li>
            </ul>
          </li>
          {member ? <li className="HO_user" onMouseEnter={() => setAccountOpen(true)} onMouseLeave={() => setAccountOpen(false)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setAccountOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') { setAccountOpen(false); event.currentTarget.querySelector('button')?.focus(); } }}>
            <button type="button" className="account-toggle" aria-label="사용자 메뉴" aria-expanded={accountOpen} aria-controls="account-submenu" onClick={() => setAccountOpen(true)}>
              <img src={userIcon} alt="사용자" />
            </button>
            <ul id="account-submenu" className={`submenu account-submenu${accountOpen ? ' is-open' : ''}`}>
              <li><Link className="link" to="/cart" onClick={() => setAccountOpen(false)}>장바구니</Link></li>
              <li><Link className="link" to="/mypage" onClick={() => setAccountOpen(false)}>마이페이지</Link></li>
              <li><button type="button" className="link" disabled={loggingOut} onClick={logout}>{loggingOut ? '로그아웃 중…' : '로그아웃'}</button></li>
              {accountError && <li className="account-error" role="alert">{accountError}</li>}
            </ul>
          </li> : <><li><Link className="link" to="/cart">장바구니</Link></li><li><Link className="link" to="/login">로그인</Link></li></>}
        </ul>     {/** nav-right end */}
      </div>    {/** header_nav end */}
    </header>      /** common_top end */
  );
};

export default Header;

