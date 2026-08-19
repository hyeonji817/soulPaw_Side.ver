import "./Product_List.css"; 
import { Link } from "react-router-dom";
import airMeshImg from "../assets/living/1-1. airMesh/airMesh.png";

const Product_List = () => {

  return (
    <div id="products_wrap">
      <div className="products_body">
        <div id="big_section">
          <ul className="sub_category">
            <li><Link to="/shop/products1">리빙용품</Link></li>
            <li><Link to="/shop/products2">사료간식</Link></li>
            <li><Link to="/shop/products3">패션용품</Link></li>
            <li><Link to="/shop/products4">의약용품</Link></li>  
          </ul>        {/** sub_category end */}

          {/** 상품정렬 */}
          <ul className="prd_basic col3">
            <li>
              <div className="box ">
                <div className="img">
                  <div className="prdimg">
                    <Link to="/products1">
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
          </ul>      {/** prd_basic col3 end */}  

          <ul className="paging">

          </ul>      {/** paging end */}
        </div>      {/** big_section end */}  
      </div>     {/** products_body end */}
    </div>      /** products_wrap end */
  );
};

export default Product_List;