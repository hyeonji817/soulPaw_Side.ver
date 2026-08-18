import "./Home.css"; 
import Header from "./Header";
import Products from "./Products";
import Footer from "./Footer";

const Home = () => {
  return (
    <div className="wrap_Home">
      <div className="Header">
        <Header />  
      </div>      {/** Header end */}
      <div className="Products">
        <Products />  
      </div>    {/** Products end */}
      <div className="Footer">
        <Footer />
      </div>      {/** Footer end */}
    </div>   /** wrap_Home end */
  );
};

export default Home; 