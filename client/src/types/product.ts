export type ProductCategory = "living" | "food" | "dress" | "medicine";

export type Product = {
  id: string;
  slug: string;
  legacyTable: string | null;
  name: string;
  manufacturer: string | null;
  category: ProductCategory;
  categoryLabel: string;
  origin: string | null;
  price: number;
  discountPrice: number;
  discountRate: number;
  mileage: number;
  stock: number;
  thumbnailUrl: string | null;
  detailImageUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductOption = {
  id: string;
  productId: string;
  value: string;
  label: string;
  priceDelta: number;
  stock: number | null;
  sortOrder: number;
};

export type ProductWithOptions = Product & {
  options: ProductOption[];
};

export type ProductRow = {
  id: string;
  slug: string;
  legacy_table: string | null;
  name: string;
  manufacturer: string | null;
  category: ProductCategory;
  category_label: string;
  origin: string | null;
  price: number;
  discount_price: number;
  discount_rate: number;
  mileage: number;
  stock: number;
  thumbnail_url: string | null;
  detail_image_urls: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductOptionRow = {
  id: string;
  product_id: string;
  value: string;
  label: string;
  price_delta: number;
  stock: number | null;
  sort_order: number;
};

export const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  slug: row.slug,
  legacyTable: row.legacy_table,
  name: row.name,
  manufacturer: row.manufacturer,
  category: row.category,
  categoryLabel: row.category_label,
  origin: row.origin,
  price: row.price,
  discountPrice: row.discount_price,
  discountRate: row.discount_rate,
  mileage: row.mileage,
  stock: row.stock,
  thumbnailUrl: row.thumbnail_url,
  detailImageUrls: row.detail_image_urls ?? [],
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const toProductOption = (row: ProductOptionRow): ProductOption => ({
  id: row.id,
  productId: row.product_id,
  value: row.value,
  label: row.label,
  priceDelta: row.price_delta,
  stock: row.stock,
  sortOrder: row.sort_order,
});
