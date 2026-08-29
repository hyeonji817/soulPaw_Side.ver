import { Link, useSearchParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import type { ProductCategory } from "../types/product";

const categories: { value: ProductCategory; label: string }[] = [
  { value: "living", label: "리빙용품" },
  { value: "food", label: "사료간식" },
  { value: "dress", label: "패션용품" },
  { value: "medicine", label: "의약용품" },
];

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") as ProductCategory | null;
  const { products, loading, error } = useProducts(category ?? undefined);

  return (
    <main>
      <h1>상품 목록</h1>

      <nav aria-label="상품 카테고리">
        <button type="button" onClick={() => setSearchParams({})}>
          전체
        </button>
        {categories.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setSearchParams({ category: item.value })}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {loading && <p>상품을 불러오는 중입니다.</p>}
      {error && <p>{error}</p>}

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link to={`/products/${product.slug}`}>
              {product.thumbnailUrl && <img src={product.thumbnailUrl} alt={product.name} width={120} />}
              <strong>{product.name}</strong>
              <span>{product.discountPrice.toLocaleString()}원</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default ProductListPage;
