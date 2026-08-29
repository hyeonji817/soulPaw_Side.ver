# shop 상세 페이지 Supabase/API 연동 가이드

첨부된 웹 산출물과 기존 `src/shop/Product*.tsx` 파일은 화면 구조를 참고하기 위한 자료입니다. 실제 연동 기준은 사용자가 요청한 `client/src` 구조와 Supabase(PostgreSQL) API 구성입니다.

## 결론

`shop/Product1_1.tsx`부터 `shop/Product4_2.tsx`까지 11개 상세 페이지는 대부분 같은 상세 화면입니다. 상품마다 다른 값은 아래 정도입니다.

- 상품 slug: `air-mesh-cool-pad`, `iron-cat-pole` 등
- CSS 파일과 wrapper class
- 대표 이미지, 상세 이미지
- 상품명, 제조사, 카테고리, 가격, 할인율, 마일리지, 재고
- 옵션 목록

따라서 권장 방식은 **상세 페이지 로직을 공통 컴포넌트 하나로 분리하고, 각 shop 페이지는 slug만 넘기는 얇은 래퍼로 바꾸는 것**입니다.

## 현재 코드에서 제거할 하드코딩

각 상세 페이지에 반복되는 아래 항목은 Supabase 데이터로 대체합니다.

```tsx
const PRODUCT_TABLE = "product_life";
const PRODUCT_ID = "air-mesh-cool-pad";

const product = {
  pname: "에어메쉬 순면 쿨매트",
  manufacturer: "(주)국민유통",
  category: "리빙용품",
  public: "국산",
  price: 43900,
  discountPrice: 39510,
  discountRate: 10,
  mileage: 878,
  stock: 10,
};

const typeOptions = [...];
```

그리고 아래 localStorage 처리도 Supabase 테이블로 교체합니다.

```tsx
localStorage.getItem(`wish:${PRODUCT_TABLE}:${PRODUCT_ID}`)
localStorage.setItem("cartItems", JSON.stringify([...prevCart, cartItem]))
localStorage.setItem("paymentItem", JSON.stringify(paymentItem))
```

대체 테이블은 다음과 같습니다.

- 상품 상세: `products`, `product_options`
- 장바구니: `cart_items`
- 찜: `wishlist_items`
- 주문/결제: `orders`, `order_items`, `payments`

## 파일 구조 제안

```txt
client/src
├─ components/
│  └─ ProductDetailTemplate.tsx
├─ shop/
│  ├─ Product1_1.tsx
│  ├─ Product1_2.tsx
│  └─ ...
├─ hooks/
│  ├─ useProducts.ts
│  ├─ useCart.ts
│  └─ useWishlist.ts
└─ types/
   ├─ product.ts
   ├─ cart.ts
   └─ order.ts
```

`ProductDetailTemplate.tsx`가 실제 상세 로직을 담당하고, `shop/Product1_1.tsx` 같은 파일은 기존 라우트와 CSS 호환을 위해 slug만 넘깁니다.

## 상세 페이지 공통 컴포넌트 예시

```tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../main/Header";
import Footer from "../main/Footer";
import { useCart } from "../hooks/useCart";
import { useProduct } from "../hooks/useProducts";
import { useWishlist } from "../hooks/useWishlist";

type ProductDetailTemplateProps = {
  slug: string;
  wrapClassName: string;
  bodyClassName: string;
};

const ProductDetailTemplate = ({
  slug,
  wrapClassName,
  bodyClassName,
}: ProductDetailTemplateProps) => {
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(slug);
  const { addCartItem } = useCart();
  const { isWished, toggleWishlistItem } = useWishlist();
  const [qty, setQty] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState("");

  const selectedOption = useMemo(() => {
    return product?.options.find((option) => option.id === selectedOptionId) ?? null;
  }, [product?.options, selectedOptionId]);

  if (loading) return <div className={wrapClassName}>상품을 불러오는 중입니다.</div>;
  if (error) return <div className={wrapClassName}>{error}</div>;
  if (!product) return <div className={wrapClassName}>상품을 찾을 수 없습니다.</div>;

  const requiredSatisfied = product.options.length === 0 || Boolean(selectedOption);
  const optionDelta = selectedOption?.priceDelta ?? 0;
  const unitPrice = Math.max(0, product.discountPrice + optionDelta);
  const totalPrice = unitPrice * qty;
  const optionStock = selectedOption?.stock ?? product.stock;
  const wished = isWished(product.id);

  const handleQtyChange = (nextQty: number) => {
    setQty(Math.min(optionStock, Math.max(1, nextQty)));
  };

  const validateRequiredOption = () => {
    if (requiredSatisfied) return true;
    alert("필수 옵션을 모두 선택해 주세요.");
    return false;
  };

  const handleAddToCart = async () => {
    if (!validateRequiredOption()) return;

    await addCartItem({
      productId: product.id,
      optionId: selectedOption?.id ?? null,
      quantity: qty,
    });

    alert("장바구니에 상품을 담았습니다.");
  };

  const handleBuyNow = async () => {
    if (!validateRequiredOption()) return;

    await addCartItem({
      productId: product.id,
      optionId: selectedOption?.id ?? null,
      quantity: qty,
    });

    navigate("/order");
  };

  const handlePayment = async () => {
    if (!validateRequiredOption()) return;

    await addCartItem({
      productId: product.id,
      optionId: selectedOption?.id ?? null,
      quantity: qty,
    });

    navigate("/order");
  };

  const handleToggleWish = async () => {
    await toggleWishlistItem(product.id);
  };

  return (
    <div className={wrapClassName}>
      <Header />

      <div className={bodyClassName}>
        <div id="detail">
          <div className="detail_top_wrap">
            <div className="prdimg">
              <div id="addimg" className="addimg">
                <div className="add_img">
                  {product.thumbnailUrl && <img src={product.thumbnailUrl} alt={product.name} />}
                </div>

                <div className="detail_info">
                  {product.detailImageUrls.map((imageUrl) => (
                    <div key={imageUrl} className="img_wrapper" style={{ textAlign: "center" }}>
                      <img src={imageUrl} alt={`${product.name} 상세 이미지`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="info_scroll">
              <div className="wrap_prd">
                <div className="info">
                  <h3 className="name">{product.name}</h3>
                  <p className="summary">
                    {product.manufacturer} · {product.categoryLabel}
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
                    <div className="th">종류</div>
                    <div className="td">
                      <select
                        value={selectedOptionId}
                        onChange={(event) => setSelectedOptionId(event.target.value)}
                      >
                        <option value="">::선택하세요::</option>
                        {product.options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                            {option.priceDelta
                              ? ` (+${option.priceDelta.toLocaleString()}원)`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="opt_list">
                    <div className="th">수량</div>
                    <div className="td">
                      <select value={qty} onChange={(event) => handleQtyChange(Number(event.target.value))}>
                        {Array.from({ length: Math.min(10, optionStock) }, (_, index) => index + 1).map(
                          (value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>

                  <table className="list">
                    <tbody>
                      <tr>
                        <th scope="row">MILEAGE</th>
                        <td>회원적립금 : {product.mileage.toLocaleString()} 원</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="multi_opt">
                    <ul id="detail_multi_option" className="selected_list">
                      {requiredSatisfied ? (
                        <li className="selected_item">
                          <div className="sel_name">
                            {product.name}
                            {selectedOption ? ` (종류: ${selectedOption.label})` : ""}
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
                      <button type="button" onClick={handleBuyNow}>
                        BUY NOW
                      </button>
                    </span>

                    <span className="box_btn large cart block">
                      <button type="button" onClick={handleAddToCart}>
                        ADD TO BAG
                      </button>
                    </span>

                    <span className="box_btn large payment block">
                      <button type="button" onClick={handlePayment}>
                        결제하기
                      </button>
                    </span>

                    <span className={`box_btn large wishBtn block ${wished ? "on" : ""}`}>
                      <button type="button" onClick={handleToggleWish}>
                        {wished ? "WISHED" : "WISH"}
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailTemplate;
```

## shop 파일별 래퍼 예시

기존 URL을 유지하고 싶으면 `App.tsx` 라우트는 그대로 두고, 각 상세 파일만 아래처럼 줄입니다.

```tsx
import "./Product1_1.css";
import ProductDetailTemplate from "../components/ProductDetailTemplate";

const Product1_1 = () => (
  <ProductDetailTemplate
    slug="air-mesh-cool-pad"
    wrapClassName="airMesh_wrap"
    bodyClassName="airMesh_body"
  />
);

export default Product1_1;
```

다른 상세 페이지는 slug와 class만 바꿉니다.

| 파일 | slug | wrapClassName | bodyClassName |
| --- | --- | --- | --- |
| `Product1_1.tsx` | `air-mesh-cool-pad` | `airMesh_wrap` | `airMesh_body` |
| `Product1_2.tsx` | `iron-cat-pole` | `ironCatPole_wrap` | `ironCatPole_body` |
| `Product1_3.tsx` | `puppy-stairs` | `puppyStairs_wrap` | `puppyStairs_body` |
| `Product2_1.tsx` | `dograng-classic` | `dograng_Classic_wrap` | `dograng_Classic_body` |
| `Product2_2.tsx` | `mojjine-food` | `mojjine_food_wrap` | `mojjine_food_body` |
| `Product2_3.tsx` | `rorench-petchurr` | `rorench_petChurr_wrap` | `rorench_petChurr_body` |
| `Product3_1.tsx` | `geumhwadan-hanbok` | `geumhwadan_hanbok_wrap` | `geumhwadan_hanbok_body` |
| `Product3_2.tsx` | `aricat-nasi-tshirt` | `aricat_Tshirt_wrap` | `aricat_Tshirt_body` |
| `Product3_3.tsx` | `cherry-pola-tshirt` | `cherryPola_Tshirt_wrap` | `cherryPola_Tshirt_body` |
| `Product4_1.tsx` | `pet-household-medicine` | `doctorOne_8_wrap` | `doctorOne_8_body` |
| `Product4_2.tsx` | `puppy-styptic` | `quickStop_wrap` | `quickStop_body` |

## App.tsx 라우트 개선안

현재 라우트를 유지할 수도 있지만, 신규 구조에서는 동적 상세 라우트가 더 좋습니다.

```tsx
<Route path="/products/:slug" element={<ProductDetailPage />} />
```

다만 기존 경로(`/airmesh`, `/ironCat_Pole` 등)를 이미 쓰고 있다면 당장은 유지하세요. 이후에 아래처럼 리다이렉트 또는 래퍼로 점진 전환하면 됩니다.

```tsx
<Route path="/airmesh" element={<Product1_1 />} />
<Route path="/ironCat_Pole" element={<Product1_2 />} />
```

## 장바구니 연동

상세 페이지의 `ADD TO BAG`은 더 이상 localStorage에 저장하지 않습니다.

```tsx
await addCartItem({
  productId: product.id,
  optionId: selectedOption?.id ?? null,
  quantity: qty,
});
```

이 호출은 `cart_items` 테이블에 저장됩니다. RLS 정책 때문에 로그인한 사용자는 자기 장바구니만 읽고 쓸 수 있습니다.

## 찜 연동

상세 페이지의 `WISH` 버튼은 `wishlist_items` 테이블을 토글합니다.

```tsx
await toggleWishlistItem(product.id);
```

기존 `wish:${PRODUCT_TABLE}:${PRODUCT_ID}` localStorage 키는 제거합니다.

## 바로구매/결제 연동

상세 페이지에서 바로 결제 페이지로 보내기보다, 다음 흐름이 안전합니다.

1. 선택한 상품을 장바구니 또는 임시 주문 아이템으로 서버에 저장
2. `/order`에서 배송지 입력
3. `orders`, `order_items` 생성
4. `/payment?orderId=...`로 이동
5. Supabase Edge Function에서 결제 승인 및 금액 검증

프론트가 계산한 `totalPrice`는 화면 표시용입니다. 실제 주문 금액은 서버에서 `products.discount_price`, `product_options.price_delta`, `quantity`로 다시 계산해야 합니다.

## 단계별 전환 순서

1. Supabase에 `products`, `product_options`, `cart_items`, `wishlist_items` 테이블과 RLS 정책을 적용합니다.
2. 기존 상품 11개를 `products`에 seed합니다.
3. `product_options`에 각 상품 기본 옵션을 넣습니다.
4. `ProductDetailTemplate.tsx`를 추가합니다.
5. `shop/Product*.tsx` 11개를 slug 래퍼로 줄입니다.
6. `localStorage` 기반 장바구니/찜 코드를 제거합니다.
7. `/cart`, `/wishlist`, `/order`, `/payment` 라우트를 새 페이지 파일로 연결합니다.
8. 결제는 Edge Function으로 분리해서 금액 검증, 결제 승인, 재고 차감을 처리합니다.

## 주의할 점

- Supabase anon key는 프론트에 둬도 되지만 service role key는 절대 프론트에 두면 안 됩니다.
- 상품 이미지 경로는 현재 `src/assets` import 방식과 DB URL 방식 중 하나로 통일하는 것이 좋습니다.
- DB에 `/assets/...` 문자열을 넣으려면 이미지를 `public/assets` 아래로 옮기는 편이 더 단순합니다.
- 상세 이미지가 여러 장인 상품은 `detail_image_urls text[]`로 관리하면 현재 UI 구조와 잘 맞습니다.
- 재고 차감은 프론트에서 하지 말고 결제 승인 서버 로직에서 처리해야 합니다.
