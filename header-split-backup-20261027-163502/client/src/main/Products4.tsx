import "./Products4.css"; 
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import number8Img from "../assets/medicine/4-1. number8/petHousehold_Medicine.png";
import quickStopImg from "../assets/medicine/4-2. quickStop/miracleCare_QuickStop.png";

const Products4 = () => {

  return (
    <div id="products_Medicine_wrap">
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
                    <Link to="/doctorOne_8">
                      <img 
                        src={number8Img}
                        alt="반려동물 상비약"
                        width="240"
                        height="320"
                      />
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  

                <div className="info">
                  <p className="name">
                    <Link to="/doctorOne_8">닥터원 넘어8</Link>  
                  </p>    {/** name end */}  
                  <div className="price">
                    <p className="sell sellY">
                      KRW  39,000<span>원</span> 
                    </p>      {/** sell sellY end */}  
                    <div className="discount_section">
                      <p className="per">10%</p>  
                      <p className="discount discountY">35,100원</p>    {/** discount discountY end */} 
                    </div>      {/** discount discountY end */}
                  </div>     {/** price end */}
                </div>      {/** info end */}
              </div>      {/** box  end */}  
            </li>  

            <li>
              <div className="box ">
                <div className="img">
                  <div className="prdimg">
                    <Link to="/quickstock">
                      <img 
                        src={quickStopImg}
                        alt="강아지 발톱 지혈제"
                        width="240"
                        height="320"
                      />
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  

                <div className="info">
                  <p className="name">
                    <Link to="/quickstock">미라클케어 퀵스탑 지혈제</Link>  
                  </p>    {/** name end */}  
                  <div className="price">
                    <p className="sell sellY">
                      KRW  26,000<span>원</span> 
                    </p>      {/** sell sellY end */}  
                    <div className="discount_section">
                      <p className="per">10%</p>  
                      <p className="discount discountY">23,400원</p>    {/** discount discountY end */} 
                    </div>      {/** discount discountY end */}
                  </div>     {/** price end */}
                </div>      {/** info end */}
              </div>      {/** box  end */}  
            </li>  


          </ul>      {/** prd_basic col3 end */}  

          <ul className="paging">
            
          </ul>      {/** paging end */}
        </div>      {/** big_section end */}
      </div>    {/** products_body end */}

      <div className="Footer">
        <Footer />
      </div>      {/** Footer end */}
    </div>     /** products_Medicine end */
  );
};

export default Products4;