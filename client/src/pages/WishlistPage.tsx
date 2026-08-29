import { Link } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";

const WishlistPage = () => {
  const { products, loading, error, removeWishlistItem } = useWishlist();

  if (loading) return <main>관심상품을 불러오는 중입니다.</main>;

  return (
    <main>
      <h1>관심상품</h1>
      {error && <p>{error}</p>}

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link to={`/products/${product.slug}`}>
              {product.thumbnailUrl && <img src={product.thumbnailUrl} alt={product.name} width={120} />}
              <strong>{product.name}</strong>
            </Link>
            <button type="button" onClick={() => void removeWishlistItem(product.id)}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default WishlistPage;
