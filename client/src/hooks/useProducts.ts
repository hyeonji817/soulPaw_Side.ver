import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  Product,
  ProductCategory,
  ProductOptionRow,
  ProductRow,
  ProductWithOptions,
} from "../types/product";
import { toProduct, toProductOption } from "../types/product";

type UseProductsResult = {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

type UseProductResult = {
  product: ProductWithOptions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useProducts = (category?: ProductCategory): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error: productsError } = await query;

    if (productsError) {
      setError(productsError.message);
      setLoading(false);
      return;
    }

    setProducts(((data ?? []) as ProductRow[]).map(toProduct));
    setLoading(false);
  }, [category]);

  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts();
    };
  
    void loadProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

export const useProduct = (slug: string | undefined): UseProductResult => {
  const [product, setProduct] = useState<ProductWithOptions | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!slug) {
      setProduct(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const productResponse = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (productResponse.error) {
      setError(productResponse.error.message);
      setLoading(false);
      return;
    }

    const optionResponse = await supabase
      .from("product_options")
      .select("*")
      .eq("product_id", productResponse.data.id)
      .order("sort_order", { ascending: true });

    if (optionResponse.error) {
      setError(optionResponse.error.message);
      setLoading(false);
      return;
    }

    setProduct({
      ...toProduct(productResponse.data as ProductRow),
      options: ((optionResponse.data ?? []) as ProductOptionRow[]).map(toProductOption),
    });
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    const loadProduct = async () => {
      await fetchProduct();
    };
  
    void loadProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
};
