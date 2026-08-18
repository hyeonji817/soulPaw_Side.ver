import "./Product_List.css"; 
import { Link } from "react-router-dom";

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
                      <img src="./assets/"/>
                    </Link>  
                  </div>      {/** prdimg end */}  
                </div>     {/** img end */}  
              </div>      {/** box  end */}  
            </li>  
          </ul>      {/** prd_basic col3 end */}  
        </div>      {/** big_section end */}  
      </div>     {/** products_body end */}
    </div>      /** products_wrap end */
  );
};

export default Product_List;