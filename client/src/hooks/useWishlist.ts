import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Product, ProductRow } from "../types/product";
import { toProduct } from "../types/product";

type WishlistRow = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products: ProductRow;
};

const requireUserId = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("로그인이 필요한 기능입니다.");
  }

  return data.user.id;
};

export const useWishlist = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = await requireUserId();
      const { data, error: wishlistError } = await supabase
        .from("wishlist_items")
        .select("*, products(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (wishlistError) throw wishlistError;

      setProducts(((data ?? []) as unknown as WishlistRow[]).map((row) => toProduct(row.products)));
    } catch (wishlistError) {
      setError(
        wishlistError instanceof Error ? wishlistError.message : "관심상품을 불러오지 못했습니다.",
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const isWished = useCallback(
    (productId: string) => products.some((product) => product.id === productId),
    [products],
  );

  const addWishlistItem = useCallback(
    async (productId: string) => {
      const userId = await requireUserId();
      const { error: addError } = await supabase
        .from("wishlist_items")
        .upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" });

      if (addError) throw addError;
      await fetchWishlist();
    },
    [fetchWishlist],
  );

  const removeWishlistItem = useCallback(
    async (productId: string) => {
      const userId = await requireUserId();
      const { error: deleteError } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);

      if (deleteError) throw deleteError;
      await fetchWishlist();
    },
    [fetchWishlist],
  );

  const toggleWishlistItem = useCallback(
    async (productId: string) => {
      if (isWished(productId)) {
        await removeWishlistItem(productId);
        return false;
      }

      await addWishlistItem(productId);
      return true;
    },
    [addWishlistItem, isWished, removeWishlistItem],
  );

  useEffect(() => {
    void fetchWishlist();
  }, [fetchWishlist]);

  return {
    products,
    loading,
    error,
    isWished,
    addWishlistItem,
    removeWishlistItem,
    toggleWishlistItem,
    refetch: fetchWishlist,
  };
};
