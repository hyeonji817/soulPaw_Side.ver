import "./Products.css";
import Product_List from "./Product_List";

const Products = () => {
  return (
    <div className="Products_wrap">
      <div className="Product_List">
        <Product_List />  
      </div>        {/** Product_List end */}
    </div>     /** Products_wrap end */
  );
};

export default Products;