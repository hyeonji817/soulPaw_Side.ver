import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getCartItemTotalPrice, getCartItemUnitPrice } from "../types/cart";
import { useCart } from "../hooks/useCart";
import type { ShippingAddress } from "../types/order";

const baseAddress: ShippingAddress = {
  receiverName: "",
  receiverPhone: "",
  postalCode: "",
  address1: "",
  address2: "",
  memo: "",
};

const OrderPage = () => {
  const navigate = useNavigate();
  const { items, totalProductAmount, clearCart } = useCart();
  const [address, setAddress] = useState(baseAddress);
  const [submitting, setSubmitting] = useState(false);
  const shippingFee = useMemo(() => (totalProductAmount >= 50000 ? 0 : 3000), [totalProductAmount]);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("로그인이 필요한 기능입니다.");

      const totalPaymentAmount = totalProductAmount + shippingFee;
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userData.user.id,
          receiver_name: address.receiverName,
          receiver_phone: address.receiverPhone,
          postal_code: address.postalCode,
          address1: address.address1,
          address2: address.address2 || null,
          memo: address.memo || null,
          total_product_amount: totalProductAmount,
          shipping_fee: shippingFee,
          total_payment_amount: totalPaymentAmount,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      const { error: orderItemsError } = await supabase.from("order_items").insert(
        items.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          option_id: item.optionId,
          product_name: item.product.name,
          option_label: item.option?.label ?? null,
          unit_price: getCartItemUnitPrice(item),
          quantity: item.quantity,
          total_price: getCartItemTotalPrice(item),
        })),
      );

      if (orderItemsError) throw orderItemsError;

      await clearCart();
      navigate(`/payment?orderId=${order.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <h1>주문서</h1>

      <label>
        받는 분
        <input
          value={address.receiverName}
          onChange={(event) => setAddress({ ...address, receiverName: event.target.value })}
        />
      </label>
      <label>
        연락처
        <input
          value={address.receiverPhone}
          onChange={(event) => setAddress({ ...address, receiverPhone: event.target.value })}
        />
      </label>
      <label>
        우편번호
        <input
          value={address.postalCode}
          onChange={(event) => setAddress({ ...address, postalCode: event.target.value })}
        />
      </label>
      <label>
        주소
        <input
          value={address.address1}
          onChange={(event) => setAddress({ ...address, address1: event.target.value })}
        />
      </label>
      <label>
        상세주소
        <input
          value={address.address2}
          onChange={(event) => setAddress({ ...address, address2: event.target.value })}
        />
      </label>

      <p>상품 금액 {totalProductAmount.toLocaleString()}원</p>
      <p>배송비 {shippingFee.toLocaleString()}원</p>
      <p>결제 예정 금액 {(totalProductAmount + shippingFee).toLocaleString()}원</p>

      <button type="button" disabled={submitting || items.length === 0} onClick={() => void handleSubmit()}>
        결제 페이지로 이동
      </button>
    </main>
  );
};

export default OrderPage;
