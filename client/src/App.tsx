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
import Product2_2 from "./shop/Product2_2";
import Product2_3 from "./shop/Product2_3";

import Products3 from "./main/Products3";
import Product3_1 from "./shop/Product3_1";
import Product3_2 from "./shop/Product3_2";
import Product3_3 from "./shop/Product3_3";

import Products4 from "./main/Products4";
import Product4_1 from "./shop/Product4_1";
// import Product4_2 from "./shop/Product4_2";

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
        <Route path="/mojjine_food" element={<Product2_2 />} />
        <Route path="/rorench_petChurr" element={<Product2_3 />} />

        <Route path="/products_dress" element={<Products3 />} />
        <Route path="/geumhwadan_hanbok" element={<Product3_1 />} />
        <Route path="/aricat_Tshirt" element={<Product3_2 />} />
        <Route path="/cherryPola_Tshirt" element={<Product3_3 />} />

        <Route path="/products_medicine" element={<Products4 />} />
        <Route path="/doctorOne_8" element={<Product4_1 />} />
        {/** <Route path="/quickstock" element={<Product4_2 />} /> */}
      </Routes>
    </>
  );
}

export default App;