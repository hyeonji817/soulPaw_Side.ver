import "./Product2_1.css";
import "./Product2_2.css";
import "./Product2_3.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTossPayments } from "../lib/tossPayments";
import { apiRequest } from "../lib/api";
import Header from "../main/Header";
import Footer from "../main/Footer";

type ProductOption = {
  id: number;
  value: string;
  label: string;
  priceDelta: number;
};

type ProductImage = {
  id: number;
  role: "main" | "detail";
  assetPath: string;
  alt: string;
};

type Product = {
  id: number;
  slug: string;
  productTable: string;
  pname: string;
  manufacturer: string;
  category: string;
  public: string;
  price: number;
  discountPrice: number;
  discountRate: number;
  mileage: number;
  stock: number;
  options: ProductOption[];
  images: ProductImage[];
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

type Product2Props = {
  productSlug: string;
};

const productPageClassBySlug: Record<string, string> = {
  "dograng-classic": "dograng_Classic",
  "mojjine-food": "mojjine_food",
  "rorench-petchurr": "rorench_petChurr",
};

const assetModules = import.meta.glob("../assets/**/*.{png,jpg,jpeg,svg}", {
  eager: true,
  query: "?url",
  import: "default",
});

const assetUrlByPath = Object.fromEntries(
  Object.entries(assetModules).map(([path, url]) => [
    path.replace("../assets/", ""),
    url as string,
  ]),
);

const getUserKey = () => {
  const storageKey = "soulpaw:userKey";
  const existing = localStorage.getItem(storageKey);

  if (existing) return existing;

  const next = `guest-${crypto.randomUUID()}`;
  localStorage.setItem(storageKey, next);
  return next;
};

const resolveAssetUrl = (assetPath?: string) => {
  if (!assetPath) return "";
  return assetUrlByPath[assetPath] ?? assetPath;
};

const Product2 = ({ productSlug }: Product2Props) => {
  const nav = useNavigate();
  const classBase = productPageClassBySlug[productSlug] ?? "dograng_Classic";
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [isWished, setIsWished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadProduct = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const { product: nextProduct } = await apiRequest<{ product: Product }>(
          `/products/${productSlug}`,
        );

        if (ignore) return;

        setProduct(nextProduct);
        setQty(1);
        setSelectedType("");
        setIsWished(localStorage.getItem(`wish:${nextProduct.productTable}:${nextProduct.slug}`) === "Y");
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error instanceof Error ? error.message : "상품 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [productSlug]);

  const selectedOption = useMemo(() => {
    return product?.options.find((option) => option.value === selectedType);
  }, [product?.options, selectedType]);

  const mainImage = useMemo(() => {
    return product?.images.find((image) => image.role === "main");
  }, [product?.images]);

  const detailImages = useMemo(() => {
    return product?.images.filter((image) => image.role === "detail") ?? [];
  }, [product?.images]);

  const requiredSatisfied = Boolean(selectedOption);
  const optionDelta = selectedOption?.priceDelta ?? 0;
  const unitPrice = product ? Math.max(0, product.discountPrice + optionDelta) : 0;
  const totalPrice = unitPrice * qty;
  const selectedLabel = selectedOption ? `종류: ${selectedOption.label}` : "";

  const makeCartItem = (): CartItem | null => {
    if (!product) return null;

    return {
      productTable: product.productTable,
      productId: product.slug,
      pname: product.pname,
      qty,
      optionLabel: selectedLabel,
      unitPrice,
      optionDelta,
      totalPrice,
      mileage: product.mileage,
      image: resolveAssetUrl(mainImage?.assetPath),
    };
  };

  const validateRequiredOption = () => {
    if (requiredSatisfied) return true;

    alert("필수 옵션을 모두 선택해 주세요.");
    return false;
  };

  const handleQtyChange = (nextQty: number) => {
    if (!product) return;
    setQty(Math.min(product.stock, Math.max(1, nextQty)));
  };

  const handleAddToCart = async () => {
    if (!product || !selectedOption || !validateRequiredOption()) return;

    try {
      await apiRequest("/cart/items", {
        method: "POST",
        body: {
          userKey: getUserKey(),
          productSlug: product.slug,
          optionId: selectedOption.id,
          quantity: qty,
        },
      });

      const cartItem = makeCartItem();
      const prevCart = JSON.parse(localStorage.getItem("cartItems") || "[]") as CartItem[];
      localStorage.setItem("cartItems", JSON.stringify(cartItem ? [...prevCart, cartItem] : prevCart));
      alert("장바구니에 상품을 담았습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "장바구니 담기에 실패했습니다.");
    }
  };

  const handleBuyNow = () => {
    if (!validateRequiredOption()) return;

    const orderItem = makeCartItem();
    nav("/orderList", { state: { orderItem } });
  };

  const handlePayment = async () => {
    if (!product || !selectedOption || !validateRequiredOption()) return;

    try {
      const { order, payment } = await apiRequest<{
        order: { toss_order_id: string };
        payment: {
          method: "CARD";
          amount: {
            currency: "KRW";
            value: number;
          };
          orderId: string;
        };
      }>("/payments/prepare", {
        method: "POST",
        body: {
          userKey: getUserKey(),
          productSlug: product.slug,
          optionId: selectedOption.id,
          quantity: qty,
        },
      });

      const tossPayments = await getTossPayments();
      const tossPayment = tossPayments.payment({ customerKey: getUserKey() });

      await tossPayment.requestPayment({
        ...payment,
        orderName: `${product.pname}${qty > 1 ? ` 외 ${qty - 1}건` : ""}`,
        customerName: "SoulPaw 고객",
        successUrl: `${window.location.origin}/payment/success?orderId=${order.toss_order_id}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "결제 준비 중 오류가 발생했습니다.");
    }
  };

  const handleToggleWish = async () => {
    if (!product) return;

    try {
      const { wished } = await apiRequest<{ wished: boolean }>("/wishlist/toggle", {
        method: "POST",
        body: {
          userKey: getUserKey(),
          productSlug: product.slug,
        },
      });

      const key = `wish:${product.productTable}:${product.slug}`;
      setIsWished(wished);

      if (wished) {
        localStorage.setItem(key, "Y");
        alert("관심상품에 추가했습니다.");
      } else {
        localStorage.removeItem(key);
        alert("관심상품에서 삭제했습니다.");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "관심상품 처리에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className={`${classBase}_wrap`}>
        <div className={`${classBase}_Header`}><Header /></div>
        <div className={`${classBase}_body`}>
          <div id="detail">상품 정보를 불러오는 중입니다.</div>
        </div>
        <div className={`${classBase}_Footer`}><Footer /></div>
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className={`${classBase}_wrap`}>
        <div className={`${classBase}_Header`}><Header /></div>
        <div className={`${classBase}_body`}>
          <div id="detail">{errorMessage || "상품을 찾을 수 없습니다."}</div>
        </div>
        <div className={`${classBase}_Footer`}><Footer /></div>
      </div>
    );
  }

  return (
    <div className={`${classBase}_wrap`}>
      <div className={`${classBase}_Header`}>
        <Header />
      </div>

      <div className={`${classBase}_body`}>
        <div id="detail">
          <div className="detail_top_wrap">
            <div className="prdimg">
              <div id="addimg" className="addimg">
                <div className="add_img">
                  <img src={resolveAssetUrl(mainImage?.assetPath)} alt={mainImage?.alt || product.pname} />
                </div>

                <div className="detail_info">
                  {detailImages.map((image) => (
                    <div key={image.id} className="img_wrapper" style={{ textAlign: "center" }}>
                      <img src={resolveAssetUrl(image.assetPath)} alt={image.alt || product.pname} />
                    </div>
                  ))}
                  <div style={{ textAlign: "center" }}><br /></div>
                </div>
              </div>

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
                  </span>
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
                </div>
              </div>
            </div>

            <div className="info_scroll">
              <form name="prdFrm" method="post" style={{ margin: "0px" }} acceptCharset="utf-8">
                <div className="wrap_prd">
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
                    </div>

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
                    </div>

                    <div className="opt_list">
                      <div className="th">종류</div>
                      <div className="td">
                        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                          <option value="">::선택하세요::</option>
                          {product.options.map((option) => (
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
                    </div>

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
                    </table>

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
                    </div>

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
                      </span>

                      <span className=""></span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className={`${classBase}_Footer`}>
        <Footer />
      </div>
    </div>
  );
};

export default Product2;

