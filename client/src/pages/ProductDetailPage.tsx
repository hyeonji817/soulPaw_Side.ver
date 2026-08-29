import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useProduct } from "../hooks/useProducts";
import { useWishlist } from "../hooks/useWishlist";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { product, loading, error } = useProduct(slug);
  const { addCartItem } = useCart();
  const { isWished, toggleWishlistItem } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [optionId, setOptionId] = useState<string | null>(null);

  const selectedOption = useMemo(
    () => product?.options.find((option) => option.id === optionId) ?? null,
    [optionId, product?.options],
  );
  const unitPrice = product ? product.discountPrice + (selectedOption?.priceDelta ?? 0) : 0;

  if (loading) return <main>상품을 불러오는 중입니다.</main>;
  if (error) return <main>{error}</main>;
  if (!product) return <main>상품을 찾을 수 없습니다.</main>;

  const handleAddCart = async () => {
    await addCartItem({ productId: product.id, optionId, quantity });
    alert("장바구니에 담았습니다.");
  };

  const handleToggleWish = async () => {
    await toggleWishlistItem(product.id);
  };

  return (
    <main>
      <h1>{product.name}</h1>
      {product.thumbnailUrl && <img src={product.thumbnailUrl} alt={product.name} width={240} />}

      <p>{product.manufacturer} · {product.categoryLabel}</p>
      <p>
        <del>{product.price.toLocaleString()}원</del>
        <strong>{product.discountPrice.toLocaleString()}원</strong>
        <span>{product.discountRate}%</span>
      </p>

      <label>
        옵션
        <select value={optionId ?? ""} onChange={(event) => setOptionId(event.target.value || null)}>
          <option value="">선택 안 함</option>
          {product.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        수량
        <input
          min={1}
          max={product.stock}
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />
      </label>

      <p>총 {(unitPrice * quantity).toLocaleString()}원</p>

      <button type="button" onClick={handleAddCart}>
        장바구니
      </button>
      <button type="button" onClick={handleToggleWish}>
        {isWished(product.id) ? "찜 해제" : "찜하기"}
      </button>

      {product.detailImageUrls.map((imageUrl) => (
        <img key={imageUrl} src={imageUrl} alt={`${product.name} 상세`} />
      ))}
    </main>
  );
};

export default ProductDetailPage;
