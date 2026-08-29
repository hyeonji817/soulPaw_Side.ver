import type { Product, ProductOption, ProductOptionRow, ProductRow } from "./product";

export type CartItem = {
  id: string;
  userId: string;
  productId: string;
  optionId: string | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
  option: ProductOption | null;
};

export type CartItemRow = {
  id: string;
  user_id: string;
  product_id: string;
  option_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  products: ProductRow;
  product_options: ProductOptionRow | null;
};

export type AddCartItemInput = {
  productId: string;
  optionId?: string | null;
  quantity: number;
};

export type UpdateCartQuantityInput = {
  cartItemId: string;
  quantity: number;
};

export const getCartItemUnitPrice = (item: CartItem) =>
  Math.max(0, item.product.discountPrice + (item.option?.priceDelta ?? 0));

export const getCartItemTotalPrice = (item: CartItem) =>
  getCartItemUnitPrice(item) * item.quantity;
