import "./Product3_3.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getTossPayments } from "../lib/tossPayments";
import Header from "../main/Header";
import Footer from "../main/Footer";

import cherryPolaImg from "../assets/dress/3-3. cherryPola/cherryPola.png";
import cherryPolaDescImg from "../assets/dress/3-3. cherryPola/cherryPola_Desc.png";

type ProductOption = {
  id: number; 
  value: string; 
  label: string; 
  priceDelta: number; 
};

type CartItem = {
  productTable: string; 
  productId: string; 
  pname: string; 
  qty: number; 
  optionLabel: string;
  unitPrice: number; 
  optionDelta: number;  
  totalPrice: number; 
  mileage: number; 
  image: string; 
};

const PRODUCT_TABLE = "product_dress"; 
const PRODUCT_ID = "cherryPola-Tshirt";

const createTossOrderId = () => {
  return `soulpaw-${crypto.randomUUID()}`;
};

const product = {
  pname: "체리폴라 티셔츠", 
  manufacturer: "티아라펫", 
  category: "패션용품", 
  public: "국산", 
  price: 12000, 
  discountPrice: 10800, 
  discountRate: 10, 
  mileage: 360, 
  stock: 10, 
};

const typeOptions: ProductOption[] = [
  {
    id: 9, 
    value: "cherryPola-Tshirt", 
    label: "체리폴라 티셔츠", 
    priceDelta: 0, 
  },
];

const Product3_3 = () => {
  const nav = useNavigate(); 
  const [qty, setQty] = useState(1); 
  const [selectedType, setSelectedType] = useState(""); 
  const [isWished, setIsWished] = useState<boolean>(() => {
    return localStorage.getItem(`wish:${PRODUCT_TABLE}:${PRODUCT_ID}`) === "Y";
  });

  const selectedOption = useMemo(() => {
    return typeOptions.find((option) => option.value == selectedType); 
  }, [selectedType]);

  const requiredSatisfied = Boolean(selectedOption); 
  const optionDelta = selectedOption?.priceDelta ?? 0; 
  const unitPrice = Math.max(0, product.discountPrice + optionDelta);
  const totalPrice = unitPrice * qty;
  const selectedLabel = selectedOption ? `종류: ${selectedOption.label}` : "";

  const makeCartItem = (): CartItem => ({
    productTable: PRODUCT_TABLE,
    productId: PRODUCT_ID,
    pname: product.pname,
    qty,
    optionLabel: selectedLabel,
    unitPrice,
    optionDelta,
    totalPrice,
    mileage: product.mileage,
    image: cherryPolaDescImg,
  });

  const validateRequiredOption = () => {
    if (requiredSatisfied) return true;

    alert("필수 옵션을 모두 선택해 주세요.");
    return false;
  };

  const handleQtyChange = (nextQty: number) => {
    setQty(Math.min(product.stock, Math.max(1, nextQty)));
  };

  const handleAddToCart = () => {
    if (!validateRequiredOption()) return;

    const cartItem = makeCartItem();
    const prevCart = JSON.parse(localStorage.getItem("cartItems") || "[]") as CartItem[];
    localStorage.setItem("cartItems", JSON.stringify([...prevCart, cartItem]));

    // alert("장바구니에 상품을 담았습니다.");
    nav("/cart", { state: { cartItem } });
  };

  const handleBuyNow = () => {
    if (!validateRequiredOption()) return;

    const orderItem = makeCartItem();
    nav("/orderList", { state: { orderItem } });
  };

  const handlePayment = async () => {
    if (!validateRequiredOption()) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    const tossOrderId = createTossOrderId();
    const amount = totalPrice;
    const orderName = `${product.pname}${qty > 1 ? ` 외 ${qty - 1}건` : ""}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        toss_order_id: tossOrderId,
        receiver_name: "상세페이지 바로결제",
        receiver_phone: "01000000000",
        postal_code: "00000",
        address1: "주문서에서 입력 필요",
        total_product_amount: amount,
        shipping_fee: 0,
        total_payment_amount: amount,
      })
      .select("id")
      .single();

    if (orderError) {
      alert(orderError.message);
      return;
    }

    const { error: orderItemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: PRODUCT_ID,
      option_id: selectedOption?.id ?? null,
      product_name: product.pname,
      option_label: selectedOption?.label ?? null,
      unit_price: unitPrice,
      quantity: qty,
      total_price: amount,
    });

    if (orderItemError) {
      alert(orderItemError.message);
      return;
    }

    try {
      const tossPayments = await getTossPayments();
      const payment = tossPayments.payment({ customerKey: user.id });

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: amount,
        },
        orderId: tossOrderId,
        orderName,
        customerName: user.user_metadata?.name ?? "SoulPaw 고객",
        customerEmail: user.email,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "결제창을 여는 중 오류가 발생했습니다.";
      alert(message);
    }
  };

  const handleToggleWish = () => {
    setIsWished((prev) => {
      const next = !prev;
      const key = `wish:${PRODUCT_TABLE}:${PRODUCT_ID}`;

      if (next) {
        localStorage.setItem(key, "Y");
        alert("관심상품에 추가했습니다.");
      } else {
        localStorage.removeItem(key);
        alert("관심상품에서 삭제했습니다.");
      }

      return next;
    });
  };

  return (
    <div className="cherryPola_Tshirt_wrap">
      <div className="cherryPola_Tshirt_Header">
        <Header />  
      </div>    {/** cherryPola_Tshirt_Header end */}

      <div className="cherryPola_Tshirt_body">
        <div id="detail">
          <div className="detail_top_wrap">
            {/** 상품 이미지 */}
            <div className="prdimg">
              <div id="addimg" className="addimg">
                <div className="add_img">
                  <img src={cherryPolaImg} alt="체리폴라 티셔츠" />  
                </div>     {/** add_img end */}  

                <div className="detail_info">
                  <div className="img_wrapper" style={{ textAlign: "center" }}>
                    <img src={cherryPolaDescImg} /> 
                  </div>      {/** img_wrapper end */}
                  <div style={{ textAlign: "center" }}><br /></div>  
                </div>     {/** detail_info end */}
              </div>      {/** addimg end */}  

              <div className="related_wrap">
                <div className="btn_bottom dn">
                  <span className="box_btn w141 left">
                    <a
                      href="/cart"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart();
                      }}
                    >
                      선택상품 장바구니
                    </a>
                  </span>		{/** box_btn w141 end */}
                  <span className="box_btn w141">
                    <a
                      href="/orderList"
                      onClick={(e) => {
                        e.preventDefault();
                        handleBuyNow();
                      }}
                    >
                      선택상품 구매
                    </a>
                  </span>
                </div>		{/** btn_bottom dn end */}     
              </div>    {/** related_wrap end */}
            </div>      {/** prdimg end */} 

            {/** 상품정보 */}
            <div className="info_scroll">
              <form name="prdFrm" method="post" style={{ margin: "0px" }} acceptCharset="utf-8">
                <div className="wrap_prd">
                  {/** 상품정보 & 버튼 */}
                  <div className="info">
                    <h3 className="name">{product.pname}</h3>
                    <p className="summary">
                      {product.manufacturer} · {product.category}
                    </p>

                    <div className="price">
                      <div className="top_price">
                        <span className="consumer consumerY">
                          {product.price.toLocaleString()} 원
                        </span>
                        <span className="sell sellY">
                          <strong>{product.discountPrice.toLocaleString()}</strong>
                        </span>
                      </div>

                      <span className="discount discountY">
                        <strong>{product.discountPrice.toLocaleString()}</strong>
                      </span>
                      <span className="per">{product.discountRate}%</span>
                    </div>     {/** price end */}

                    {/** 상품옵션리스트 */}
                    <div className="opt_list">
                      <div className="th">수량</div>
                      <div className="td">
                        <select>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>  
                      </div>  
                    </div>      {/** opt_list end */}

                    {/** 상품옵션리스트 - 종류 (데이터가 있을 때만 노출) */}
                    <div className="opt_list"></div>      {/** opt_list end */}

                    {/** 세부종류 : 종류를 선택했을 때만 노출 */}
                    <div className="opt_list">
                      <div className="th">수량</div>
                      <div className="td">
                        <select value={qty} onChange={(e) => handleQtyChange(Number(e.target.value))}>
                          {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map(
                            (value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>      {/** opt_list end */}

                    {/** 세부종류 선택하기 */}
                    <div className="opt_list">
                      <div className="th">종류</div>
                      <div className="td">
                        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                          <option value="">::선택하세요::</option>
                          {typeOptions.map((option) => (
                            <option key={option.id} value={option.value}>
                              {option.label}
                              {option.priceDelta
                                ? ` (+${option.priceDelta.toLocaleString()}원)`
                                : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/** 수량 */}
                    <div className="box_qty hidden">
                      <input type="text" name="buy_ea" value={qty} readOnly className="form_input" />
                      <div className="btn_ea">
                        <a
                          href="#"
                          className="ea_up"
                          onClick={(e) => {
                            e.preventDefault();
                            handleQtyChange(qty + 1);
                          }}
                        >
                          +
                        </a>
                        <a
                          href="#"
                          className="ea_down"
                          onClick={(e) => {
                            e.preventDefault();
                            handleQtyChange(qty - 1);
                          }}
                        >
                          -
                        </a>
                      </div>
                    </div>      {/** box_qty hidden end */}

                    <table className="list">
                      <colgroup>
                        <col style={{ width: "30%" }} />
                        <col />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th scope="row">MILEAGE</th>
                          <td>
                            <div className="box_info">
                              <div className="info">
                                회원적립금 : {product.mileage.toLocaleString()} 원
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>  
                    </table>      {/** list end */}

                    <div className="multi_opt">
                      <ul id="detail_multi_option" className="selected_list">
                        {requiredSatisfied ? (
                          <li
                            className="selected_item"
                            style={{ display: "flex", alignItems: "center", gap: 12 }}
                          >
                            <div className="sel_name" style={{ flex: 1 }}>
                              {product.pname} ({selectedLabel})
                            </div>

                            <div
                              className="sel_ctrl"
                              style={{ display: "flex", alignItems: "center", gap: 6 }}
                            >
                              <button type="button" onClick={() => handleQtyChange(qty - 1)}>
                                -
                              </button>
                              <input readOnly value={qty} style={{ width: 36, textAlign: "center" }} />
                              <button type="button" onClick={() => handleQtyChange(qty + 1)}>
                                +
                              </button>
                            </div>
                          </li>
                        ) : (
                          <li className="selected_item empty">필수 옵션을 모두 선택해 주세요.</li>
                        )}
                      </ul>

                      <div className="opt_total">
                        <span className="title">총 상품금액(수량) : </span>
                        <strong>
                          <span id="detail_multi_option_prc">{totalPrice.toLocaleString()}</span> KRW
                          <span className="ea_total"> ({requiredSatisfied ? qty : 0}개)</span>
                        </strong>
                      </div>
                    </div>     {/** multi_opt end */}

                    {/** 버튼 */}
                    <div className="btn">
                    <span className="box_btn large buy block">
                        <a
                          href="/orderList"
                          onClick={(e) => {
                            e.preventDefault();
                            handleBuyNow();
                          }}
                        >
                          BUY NOW
                        </a>
                      </span>

                      <span className="box_btn large cart block">
                        <a
                          href="/cart"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart();
                          }}
                        >
                          ADD TO BAG
                        </a>
                      </span>

                      <span className="box_btn large payment block">
                        <a
                          href="/payment"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePayment();
                          }}
                        >
                          결제하기
                        </a>
                      </span>

                      <span className={`box_btn large wishBtn block ${isWished ? "on" : ""}`}>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleWish();
                          }}
                        >
                          {isWished ? "WISHED ♥" : "WISH ♥"}
                        </a>
                      </span>   {/** box btn large buy block end */} 

                      {/** 찜하기 */}
                      <span className=""></span>     
                    </div>     {/** btn end */}
                  </div>      {/** info end */}  
                </div>      {/** wrap_prd end */}
              </form> 
            </div>     {/** info_scroll end */}
          </div>     {/** detail_top_wrap end */}  
        </div>     {/** detail end */}  
      </div>      {/** cherryPola_Tshirt_body end */}

      <div className="cherryPola_Tshirt_Footer">
        <Footer />  
      </div>    {/** cherryPola_Tshirt_Footer end */}
    </div>      /** cherryPola_Tshirt_wrap end */
  );
};

export default Product3_3;