import "./Header.css"; 
// import { useNavigate } from "react-router-dom"; 
// import { useEffect, useState } from "react"; 
import { Link } from "react-router-dom"; 

const Header = () => {
  return (
    <header className="common_top">
      <div className="header_nav">
        <Link className="logo" to="/home">소울포우</Link>
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
        </ul>     {/** nav-right end */}  
      </div>    {/** header_nav end */}
    </header>      /** common_top end */
  );
};

export default Header;