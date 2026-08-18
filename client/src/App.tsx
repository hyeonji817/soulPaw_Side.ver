import { Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./main/Home";
import Products from "./main/Products";
import Product_List from "./main/Product_List";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product_list" element={<Product_List />} />
      </Routes>
    </>
  );
}

export default App;