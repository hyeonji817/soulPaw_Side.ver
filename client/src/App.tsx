import { Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./main/Home";
import Products from "./main/Products";
import Product_List from "./main/Product_List";
import Products1 from "./main/Products1";
import Products2 from "./main/Products2";
import Products3 from "./main/Products3";
import Products4 from "./main/Products4";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product_list" element={<Product_List />} />
        <Route path="/products_living" element={<Products1 />} />
        <Route path="/products_food" element={<Products2 />} />
        <Route path="/products_dress" element={<Products3 />} />
        <Route path="/products_medicine" element={<Products4 />} />
      </Routes>
    </>
  );
}

export default App;