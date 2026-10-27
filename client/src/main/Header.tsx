import "./Header.css"; 
import { Link } from "react-router-dom"; 

const Header = () => {
  return (
    <header className="common_top header-guest">
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
          <li><Link className="link" to="/cart">장바구니</Link></li><li><Link className="link" to="/login">로그인</Link></li>
        </ul>     {/** nav-right end */}
      </div>    {/** header_nav end */}
    </header>      /** common_top end */
  );
};

export default Header;

