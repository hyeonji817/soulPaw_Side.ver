import "./Products3.css"; 
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import hanbokImg from "../assets/dress/3-1. hanbok/hanbok.png";
import aricatImg from "../assets/dress/3-2. aricat_nasi/catTshirt.png";
import cherryPolaImg from "../assets/dress/3-3. cherryPola/cherryPola.png";

const Products3 = () => {

  return (
    <div id="products_Dress_wrap">
      <div className="Header">
        <Header />  
      </div>      {/** Header end */}

      <div className="products_body">
        <div id="big_section">
          <ul className="sub_category">
            <li><Link to="/products_living">리빙용품</Link></li>
            <li><Link to="/products_food">사료간식</Link></li>
            <li><Link to="/products_dress">패션용품</Link></li>
            <li><Link to="/products_medicine">의약용품</Link></li>  
          </ul>        {/** sub_category end */}

          {/** 상품정렬 */}
          <ul className="prd_basic col3">
            <li>
              <div className="box ">
                <div className="img">
                  <div className="prdimg">
                    <Link to="/geumhwandan_hanbok">
                      <img 
                        src={hanbokImg}
                        alt="금화단 한복"
                        width="240"
                        height="320"
                      />
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  

                <div className="info">
                  <p className="name">
                    <Link to="/geumhwandan_hanbok">[티아라펫] 금화단 한복</Link>  
                  </p>    {/** name end */}  
                  <div className="price">
                    <p className="sell sellY">
                      KRW  32,000<span>원</span> 
                    </p>      {/** sell sellY end */}  
                    <div className="discount_section">
                      <p className="per">10%</p>  
                      <p className="discount discountY">28,800원</p>    {/** discount discountY end */} 
                    </div>      {/** discount discountY end */}
                  </div>     {/** price end */}
                </div>      {/** info end */}
              </div>      {/** box  end */}  
            </li>  

            <li>
              <div className="box ">
                <div className="img">
                  <div className="prdimg">
                    <Link to="/aricat_Tshirt">
                      <img 
                        src={aricatImg}
                        alt="아리캣 민소매"
                        width="240"
                        height="320"
                      />
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  

                <div className="info">
                  <p className="name">
                    <Link to="/aricat_Tshirt">아리캣 곰체크 나시티 민소매</Link>  
                  </p>    {/** name end */}  
                  <div className="price">
                    <p className="sell sellY">
                      KRW  18,500<span>원</span> 
                    </p>      {/** sell sellY end */}  
                    <div className="discount_section">
                      <p className="per">10%</p>  
                      <p className="discount discountY">16,650원</p>    {/** discount discountY end */} 
                    </div>      {/** discount discountY end */}
                  </div>     {/** price end */}
                </div>      {/** info end */}
              </div>      {/** box  end */}  
            </li>  

            <li>
              <div className="box ">
                <div className="img">
                  <div className="prdimg">
                    <Link to="/cherryPola_Tshirt">
                      <img 
                        src={cherryPolaImg}
                        alt="체리폴라 티셔츠"
                        width="240"
                        height="320"
                      />
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  

                <div className="info">
                  <p className="name">
                    <Link to="/cherryPola_Tshirt">[티아라펫] 체리폴라 티셔츠</Link>  
                  </p>    {/** name end */}  
                  <div className="price">
                    <p className="sell sellY">
                      KRW  12,000<span>원</span> 
                    </p>      {/** sell sellY end */}  
                    <div className="discount_section">
                      <p className="per">10%</p>  
                      <p className="discount discountY">10,800원</p>    {/** discount discountY end */} 
                    </div>      {/** discount discountY end */}
                  </div>     {/** price end */}
                </div>      {/** info end */}
              </div>      {/** box  end */}  
            </li>  
          </ul>      {/** prd_basic col3 end */}  

          <ul className="paging">
            
          </ul>      {/** paging end */}
        </div>      {/** big_section end */}      
      </div>     {/** products_body end */}

      <div className="Footer">
        <Footer />
      </div>      {/** Footer end */}
    </div>        /** products_Dress_wrap end */
  );
};

export default Products3;