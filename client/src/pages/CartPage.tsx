import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { getCartItemTotalPrice } from "../types/cart";

const CartPage = () => {
  const { items, loading, error, totalProductAmount, updateQuantity, removeCartItem, clearCart } =
    useCart();

  if (loading) return <main>장바구니를 불러오는 중입니다.</main>;

  return (
    <main>
      <h1>장바구니</h1>
      {error && <p>{error}</p>}

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.product.name}</strong>
            {item.option && <span>{item.option.label}</span>}
            <input
              min={1}
              type="number"
              value={item.quantity}
              onChange={(event) =>
                void updateQuantity({ cartItemId: item.id, quantity: Number(event.target.value) })
              }
            />
            <span>{getCartItemTotalPrice(item).toLocaleString()}원</span>
            <button type="button" onClick={() => void removeCartItem(item.id)}>
              삭제
            </button>
          </li>
        ))}
      </ul>

      <p>상품 합계 {totalProductAmount.toLocaleString()}원</p>
      <button type="button" onClick={() => void clearCart()}>
        전체 비우기
      </button>
      <Link to="/order">주문하기</Link>
    </main>
  );
};

export default CartPage;
