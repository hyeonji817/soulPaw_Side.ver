import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { AddCartItemInput, CartItem, CartItemRow, UpdateCartQuantityInput } from "../types/cart";
import { getCartItemTotalPrice } from "../types/cart";
import { toProduct, toProductOption } from "../types/product";

const requireUserId = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("로그인이 필요한 기능입니다.");
  }

  return data.user.id;
};

const toCartItem = (row: CartItemRow): CartItem => ({
  id: row.id,
  userId: row.user_id,
  productId: row.product_id,
  optionId: row.option_id,
  quantity: row.quantity,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  product: toProduct(row.products),
  option: row.product_options ? toProductOption(row.product_options) : null,
});

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = await requireUserId();
      const { data, error: cartError } = await supabase
        .from("cart_items")
        .select("*, products(*), product_options(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (cartError) throw cartError;

      setItems(((data ?? []) as unknown as CartItemRow[]).map(toCartItem));
    } catch (cartError) {
      setError(cartError instanceof Error ? cartError.message : "장바구니를 불러오지 못했습니다.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCartItem = useCallback(
    async ({ productId, optionId = null, quantity }: AddCartItemInput) => {
      const userId = await requireUserId();

      const { error: addError } = await supabase.from("cart_items").upsert(
        {
          user_id: userId,
          product_id: productId,
          option_id: optionId,
          quantity,
        },
        { onConflict: "user_id,product_id,option_id" },
      );

      if (addError) throw addError;
      await fetchCart();
    },
    [fetchCart],
  );

  const updateQuantity = useCallback(
    async ({ cartItemId, quantity }: UpdateCartQuantityInput) => {
      if (quantity < 1) {
        throw new Error("수량은 1개 이상이어야 합니다.");
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq("id", cartItemId);

      if (updateError) throw updateError;
      await fetchCart();
    },
    [fetchCart],
  );

  const removeCartItem = useCallback(
    async (cartItemId: string) => {
      const { error: deleteError } = await supabase.from("cart_items").delete().eq("id", cartItemId);

      if (deleteError) throw deleteError;
      await fetchCart();
    },
    [fetchCart],
  );

  const clearCart = useCallback(async () => {
    const userId = await requireUserId();
    const { error: deleteError } = await supabase.from("cart_items").delete().eq("user_id", userId);

    if (deleteError) throw deleteError;
    await fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const loadCart = async () => {
      await fetchCart();
    };

    void loadCart(); 
  }, [fetchCart]);
  
  const totalProductAmount = useMemo(
    () => items.reduce((total, item) => total + getCartItemTotalPrice(item), 0),
    [items],
  );

  return {
    items,
    loading,
    error,
    totalProductAmount,
    addCartItem,
    updateQuantity,
    removeCartItem,
    clearCart,
    refetch: fetchCart,
  };
};
