import { Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./main/Home";
import Products from "./main/Products";
import Product_List from "./main/Product_List";

import Products1 from "./main/Products1";
import Product1_1 from "./shop/Product1_1";
import Product1_2 from "./shop/Product1_2";
import Product1_3 from "./shop/Product1_3";

import Products2 from "./main/Products2";
import Product2_1 from "./shop/Product2_1";

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
        <Route path="/airmesh" element={<Product1_1 />} />
        <Route path="/ironCat_Pole" element={<Product1_2 />} />
        <Route path="/puppy_Stairs" element={<Product1_3 />} />

        <Route path="/products_food" element={<Products2 />} />
        <Route path="/dograng_classic" element={<Product2_1 />} />
        
        <Route path="/products_dress" element={<Products3 />} />
        <Route path="/products_medicine" element={<Products4 />} />
      </Routes>
    </>
  );
}

export default App;