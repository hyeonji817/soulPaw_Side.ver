import "./Product_List.css"; 
import { Link } from "react-router-dom";
import airMeshImg from "../assets/living/1-1. airMesh/airMesh.png";
import ironCatPoleImg from "../assets/living/1-2. ironCatpole/iron_CatPole.png";
import puppyStairsImg from "../assets/living/1-3. puppyStairs/puppyStairs.png";

const Product_List = () => {

  return (
    <div id="products_wrap">
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
                    <Link to="/airmesh">
                      <img 
                        src={airMeshImg}
                        alt="강아지 고양이 패드 에어메쉬 순면"
                        width="240"
                        height="320"
                      />
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  

                <div className="info">
                  <p className="name">
                    <Link to="/">3D AIR MASH 쿨패드</Link>  
                  </p>    {/** name end */}  
                  <div className="price">
                    <p className="sell sellY">
                      KRW  43,900<span>원</span> 
                    </p>      {/** sell sellY end */}  
                    <div className="discount_section">
                      <p className="per">10%</p>  
                      <p className="discount discountY">39,420원</p>    {/** discount discountY end */} 
                    </div>      {/** discount discountY end */}
                  </div>     {/** price end */}
                </div>      {/** info end */}
              </div>      {/** box  end */}  
            </li>  

            <li>
              <div className="box ">
                <div className="img">
                  <div className="prdimg">
                    <Link to="/ironCat_Pole">
                      <img 
                        src={ironCatPoleImg}
                        alt="아이언 캣폴"
                        width="240"
                        height="320"
                      />
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  

                <div className="info">
                  <p className="name">
                    <Link to="/">아이언 캣폴 원목캣타워 고양이 놀이터</Link>  
                  </p>    {/** name end */}  
                  <div className="price">
                    <p className="sell sellY">
                      KRW  129,000<span>원</span> 
                    </p>      {/** sell sellY end */}  
                    <div className="discount_section">
                      <p className="per">10%</p>  
                      <p className="discount discountY">116,100원</p>    {/** discount discountY end */} 
                    </div>      {/** discount discountY end */}
                  </div>     {/** price end */}
                </div>      {/** info end */}
              </div>      {/** box  end */}  
            </li>  

            <li>
              <div className="box ">
                <div className="img">
                  <div className="prdimg">
                    <Link to="/puppy_Stairs">
                      <img 
                        src={puppyStairsImg}
                        alt="강아지 계단 스텝 고급형"
                        width="240"
                        height="320"
                      />
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  

                <div className="info">
                  <p className="name">
                    <Link to="/">펫 스텝! 고급형 3단 3Color</Link>  
                  </p>    {/** name end */}  
                  <div className="price">
                    <p className="sell sellY">
                      KRW  50,500<span>원</span> 
                    </p>      {/** sell sellY end */}  
                    <div className="discount_section">
                      <p className="per">10%</p>  
                      <p className="discount discountY">45,450원</p>    {/** discount discountY end */} 
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
    </div>      /** products_wrap end */
  );
};

export default Product_List;