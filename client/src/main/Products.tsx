import "./Products.css"; 
import Header from "./Header";
import Product_List from "./Product_List";
import Footer from "./Footer";

const Products = () => {
  return (
    <div className="Products_wrap">
      <div className="Products_Header">
        <Header />  
      </div>     {/** Products_Header end */}
      <div className="Product_List">
        <Product_List />  
      </div>        {/** Product_List end */}
      <div className="Products_Footer">
        <Footer />  
      </div>     {/** Products_Footer end */}
    </div>     /** Products_wrap end */
  );
};

export default Products;