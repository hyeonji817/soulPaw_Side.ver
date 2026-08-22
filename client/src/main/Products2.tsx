import "./Products2.css"; 
import Header from "./Header";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import dograngImg from "../assets/food/2-1. dograng/dograngClassic.png";
import mojjineImg from "../assets/food/2-2. mojjine/mojjine.png";
import rorenchImg from "../assets/food/2-3. rorench/3. petChurr1.png";

const Products2 = () => {

  return (
    <div id="products_Food_wrap">
      <div className="Header">
        <Header />  
      </div>      {/** Header end */}

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
                    <Link to="/dograng_classic">
                      <img 
                        src={dograngImg}
                        alt="도그랑"
                        width="240"
                        height="320"
                      />
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  

                <div className="info">
                  <p className="name">
                    <Link to="/">[대주산업] 도그랑 클래식</Link>  
                  </p>    {/** name end */}  
                  <div className="price">
                    <p className="sell sellY">
                      KRW 8,640<span>원</span> 
                    </p>      {/** sell sellY end */}  
                    <div className="discount_section">
                      <p className="per">20%</p>  
                      <p className="discount discountY">6,912원</p>    {/** discount discountY end */} 
                    </div>      {/** discount discountY end */}
                  </div>     {/** price end */}
                </div>      {/** info end */}
              </div>      {/** box  end */}  
            </li>  

            <li>
              <div className="box ">
                <div className="img">
                  <div className="prdimg">
                    <Link to="/mojjine_food">
                      <img 
                        src={mojjineImg}
                        alt="모찌네 고양이 사료"
                        width="240"
                        height="320"
                      />
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  

                <div className="info">
                  <p className="name">
                    <Link to="/">모찌네 사조 고양이 사료</Link>  
                  </p>    {/** name end */}  
                  <div className="price">
                    <p className="sell sellY">
                      KRW  16,900<span>원</span> 
                    </p>      {/** sell sellY end */}  
                    <div className="discount_section">
                      <p className="per">10%</p>  
                      <p className="discount discountY">15,210원</p>    {/** discount discountY end */} 
                    </div>      {/** discount discountY end */}
                  </div>     {/** price end */}
                </div>      {/** info end */}
              </div>      {/** box  end */}  
            </li>  

            <li>
              <div className="box ">
                <div className="img">
                  <div className="prdimg">
                    <Link to="/rorench_petChurr">
                      <img 
                        src={rorenchImg}
                        alt="반려동물 츄르"
                        width="240"
                        height="320"
                      />
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  

                <div className="info">
                  <p className="name">
                    <Link to="/">[지구샵Pick] 로렌츠 반려동물 츄르 (8개입)</Link>  
                  </p>    {/** name end */}  
                  <div className="price">
                    <p className="sell sellY">
                      KRW  8,500<span>원</span> 
                    </p>      {/** sell sellY end */}  
                    <div className="discount_section">
                      <p className="per">10%</p>  
                      <p className="discount discountY">7,650원</p>    {/** discount discountY end */} 
                    </div>      {/** discount discountY end */}
                  </div>     {/** price end */}
                </div>      {/** info end */}
              </div>      {/** box  end */}  
            </li>  
          </ul>      {/** prd_basic col3 end */}  

          <ul className="paging">
            
          </ul>      {/** paging end */}
        </div>      {/** big_section end */}

        <div className="Footer">
          <Footer />
        </div>      {/** Footer end */}
      </div>     /** products_Food_wrap end */
  );
};

export default Products2;