import "./Header.css"; 
// import { useNavigate } from "react-router-dom"; 
// import { useEffect, useState } from "react"; 
import { Link } from "react-router-dom"; 
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const Header = () => {
  const [member, setMember] = useState(false);
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
        <li><Link className="link" to="/cart">장바구니</Link></li><li>{member ? <button className="link" onClick={async () => { await apiRequest('/auth/logout', {method:'POST'}); window.location.assign('/login'); }}>로그아웃</button> : <Link className="link" to="/login">로그인</Link>}</li></ul>     {/** nav-right end */}  
      </div>    {/** header_nav end */}
    </header>      /** common_top end */
  );
};

export default Header;
