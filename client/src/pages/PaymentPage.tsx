import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRequestPayment = async () => {
    if (!orderId) {
      setMessage("주문 번호가 없습니다.");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { orderId, provider: "tosspayments" },
      });

      if (error) throw error;

      setMessage(`결제 요청이 생성되었습니다: ${JSON.stringify(data)}`);
    } catch (paymentError) {
      setMessage(paymentError instanceof Error ? paymentError.message : "결제 요청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <h1>결제</h1>
      <p>주문번호: {orderId ?? "없음"}</p>
      <button type="button" disabled={submitting} onClick={() => void handleRequestPayment()}>
        결제 요청
      </button>
      {message && <p>{message}</p>}
    </main>
  );
};

export default PaymentPage;
