# 상품 상세 페이지 토스페이먼츠 연동 가이드

첨부된 `web-output.zip`과 기존 `src/shop/Product1_1.tsx` ~ `Product4_2.tsx` 파일은 화면 구조를 파악하기 위한 참고 자료입니다. 실제 결제 연동은 사용자의 요청에 따라 토스페이먼츠 Sandbox, Supabase(PostgreSQL), Supabase Edge Function 기준으로 설계합니다.

## 결론

상품 상세 페이지의 `결제하기` 버튼은 토스페이먼츠 결제창을 여는 역할만 맡기는 것이 좋습니다. 실제 결제 승인은 반드시 서버에서 처리해야 합니다.

권장 흐름은 아래와 같습니다.

```txt
Product*_*.tsx 결제하기 클릭
-> Supabase에 pending order 생성
-> Toss Payments SDK requestPayment 호출
-> /payment/success?paymentKey=...&orderId=...&amount=... 로 이동
-> Supabase Edge Function confirm-payment 호출
-> Edge Function이 Toss /v1/payments/confirm 호출
-> payments, orders, stock 업데이트
```

## 왜 서버 승인이 필요한가

토스페이먼츠 결제는 요청, 인증, 승인 단계로 나뉩니다. 프론트의 `requestPayment()`는 결제창을 열고 사용자를 인증시키는 단계입니다. 결제가 성공 URL로 돌아온 뒤에는 서버에서 `paymentKey`, `orderId`, `amount`를 검증하고 결제 승인 API를 호출해야 결제가 최종 완료됩니다.

프론트에서 `amount`를 조작할 수 있으므로, Edge Function에서는 반드시 Supabase DB의 상품 가격과 주문 금액을 다시 조회해서 토스에서 돌아온 `amount`와 비교해야 합니다.

## 필요한 환경 변수

### Vite 프론트

`.env.local`

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_TOSS_CLIENT_KEY=test_gck_...
```

`VITE_TOSS_CLIENT_KEY`는 브라우저에서 SDK 초기화에 사용합니다.

### Supabase Edge Function

Supabase secret으로 저장합니다.

```bash
supabase secrets set TOSS_SECRET_KEY=test_gsk_...
supabase secrets set SITE_URL=http://localhost:5173
```

`TOSS_SECRET_KEY`는 절대 프론트 코드에 넣지 않습니다.

## 설치

프론트에서 토스페이먼츠 SDK를 패키지로 설치합니다.

```bash
npm install @tosspayments/tosspayments-sdk
```

또는 공식 문서처럼 script 태그 방식으로 불러올 수도 있지만, Vite/React 프로젝트에서는 npm 패키지 방식이 관리하기 편합니다.

## DB 테이블 보강

기존 `orders`, `order_items`, `payments` 테이블을 아래처럼 쓰면 됩니다.

```sql
alter table public.orders
add column if not exists toss_order_id text unique;

alter table public.payments
add column if not exists toss_order_id text,
add column if not exists toss_status text,
add column if not exists method text,
add column if not exists requested_at timestamptz;
```

`orders.id`는 내부 UUID이고, `toss_order_id`는 토스에 전달하는 주문번호입니다. 토스 주문번호는 영문 대소문자, 숫자, `-`, `_`로 구성된 6~64자 문자열로 생성합니다.

## 프론트 유틸

`src/lib/tossPayments.ts`

```ts
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

const tossClientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;

if (!tossClientKey) {
  throw new Error("Missing VITE_TOSS_CLIENT_KEY.");
}

export const getTossPayments = () => loadTossPayments(tossClientKey);
```

## 상세 페이지 결제 버튼 로직

`ProductDetailTemplate` 또는 각 `shop/Product*_*.tsx`의 `handlePayment`를 아래 구조로 바꿉니다.

```tsx
import { supabase } from "../lib/supabase";
import { getTossPayments } from "../lib/tossPayments";

const createTossOrderId = () => {
  return `soulpaw_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`;
};

const handlePayment = async () => {
  if (!validateRequiredOption()) return;
  if (!product) return;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    alert("로그인이 필요한 기능입니다.");
    return;
  }

  const tossOrderId = createTossOrderId();
  const amount = totalPrice;
  const orderName = `${product.name}${qty > 1 ? ` 외 ${qty - 1}건` : ""}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      toss_order_id: tossOrderId,
      receiver_name: "상세페이지 바로결제",
      receiver_phone: "01000000000",
      postal_code: "00000",
      address1: "주문서에서 입력 필요",
      total_product_amount: amount,
      shipping_fee: 0,
      total_payment_amount: amount,
    })
    .select("id")
    .single();

  if (orderError) {
    alert(orderError.message);
    return;
  }

  const { error: orderItemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    option_id: selectedOption?.id ?? null,
    product_name: product.name,
    option_label: selectedOption?.label ?? null,
    unit_price: unitPrice,
    quantity: qty,
    total_price: amount,
  });

  if (orderItemError) {
    alert(orderItemError.message);
    return;
  }

  const tossPayments = await getTossPayments();
  const payment = tossPayments.payment({ customerKey: user.id });

  await payment.requestPayment({
    method: "CARD",
    amount: {
      currency: "KRW",
      value: amount,
    },
    orderId: tossOrderId,
    orderName,
    customerName: user.user_metadata?.name ?? "SoulPaw 고객",
    customerEmail: user.email,
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
  });
};
```

위 코드는 상세 페이지에서 결제창을 바로 여는 구조입니다. 다만 실제 쇼핑몰 UX에서는 상세 페이지에서 `/order`로 이동해 배송지를 받은 뒤, 주문서 페이지의 `결제하기` 버튼에서 `requestPayment()`를 호출하는 편이 더 자연스럽습니다.

## 결제 성공 페이지

`/payment/success` 페이지는 URL 쿼리의 `paymentKey`, `orderId`, `amount`를 읽고 Supabase Edge Function을 호출합니다.

```tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("결제 승인 중입니다.");

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = Number(searchParams.get("amount"));

      if (!paymentKey || !orderId || !amount) {
        setMessage("결제 승인에 필요한 정보가 없습니다.");
        return;
      }

      const { error } = await supabase.functions.invoke("confirm-payment", {
        body: { paymentKey, orderId, amount },
      });

      setMessage(error ? error.message : "결제가 완료되었습니다.");
    };

    void confirmPayment();
  }, [searchParams]);

  return <main>{message}</main>;
};

export default PaymentSuccessPage;
```

## 결제 실패 페이지

```tsx
import { useSearchParams } from "react-router-dom";

const PaymentFailPage = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <main>
      <h1>결제 실패</h1>
      <p>{message ?? "결제가 취소되었거나 실패했습니다."}</p>
      {code && <p>오류 코드: {code}</p>}
    </main>
  );
};

export default PaymentFailPage;
```

## Supabase Edge Function: confirm-payment

`supabase/functions/confirm-payment/index.ts`

```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { paymentKey, orderId, amount } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, toss_order_id, total_payment_amount, status")
      .eq("toss_order_id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("주문을 찾을 수 없습니다.");
    }

    if (order.status !== "pending") {
      throw new Error("이미 처리된 주문입니다.");
    }

    if (order.total_payment_amount !== amount) {
      throw new Error("결제 금액이 주문 금액과 다릅니다.");
    }

    const encryptedSecretKey = btoa(`${Deno.env.get("TOSS_SECRET_KEY")!}:`);
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `${order.id}-${paymentKey}`,
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const payment = await tossResponse.json();

    if (!tossResponse.ok) {
      throw new Error(payment.message ?? "토스페이먼츠 결제 승인에 실패했습니다.");
    }

    await supabase.from("payments").insert({
      order_id: order.id,
      user_id: order.user_id,
      provider: "tosspayments",
      payment_key: payment.paymentKey,
      toss_order_id: payment.orderId,
      amount: payment.totalAmount,
      status: "approved",
      toss_status: payment.status,
      method: payment.method,
      approved_at: payment.approvedAt,
      requested_at: payment.requestedAt,
      raw_response: payment,
    });

    await supabase
      .from("orders")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return new Response(JSON.stringify({ ok: true, payment }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: error instanceof Error ? error.message : "결제 승인 실패",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
```

## App.tsx 라우트 추가

```tsx
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailPage from "./pages/PaymentFailPage";

<Route path="/payment/success" element={<PaymentSuccessPage />} />
<Route path="/payment/fail" element={<PaymentFailPage />} />
```

## shop 상세 페이지 11개에 적용하는 방식

이전 문서의 `ProductDetailTemplate` 구조를 사용한다면 `결제하기` 버튼 로직은 템플릿 한 곳만 수정하면 됩니다.

```txt
Product1_1.tsx -> ProductDetailTemplate(slug="air-mesh-cool-pad")
Product1_2.tsx -> ProductDetailTemplate(slug="iron-cat-pole")
...
Product4_2.tsx -> ProductDetailTemplate(slug="puppy-styptic")
```

반대로 11개 파일을 그대로 유지하면 `handlePayment`를 11번 고쳐야 하므로 비추천입니다.

## 테스트 체크리스트

1. 토스 Sandbox 또는 개발자센터에서 테스트 클라이언트 키와 테스트 시크릿 키를 확인합니다.
2. `.env.local`에 `VITE_TOSS_CLIENT_KEY`를 넣습니다.
3. Supabase secrets에 `TOSS_SECRET_KEY`를 넣습니다.
4. 상세 페이지에서 옵션과 수량을 선택합니다.
5. `결제하기` 클릭 시 토스 결제창이 열리는지 확인합니다.
6. 성공 redirect 후 `/payment/success`에서 `paymentKey`, `orderId`, `amount`를 읽는지 확인합니다.
7. Edge Function에서 주문 금액과 redirect 금액을 비교합니다.
8. `POST /v1/payments/confirm` 승인 성공 후 `orders.status='paid'`, `payments.status='approved'`가 저장되는지 확인합니다.

## 운영 전 필수 보완

- 배송지 입력 없이 상세 페이지에서 바로 주문을 만들면 임시 배송지 값이 들어가므로, 실제 운영에서는 `/order` 페이지에서 배송지 입력 후 결제 요청을 호출하세요.
- 결제 승인 성공 후 `order_items` 기준으로 `products.stock` 또는 `product_options.stock`을 차감하는 트랜잭션/RPC를 추가해야 합니다.
- 실패/취소 시 `orders.status='cancelled'` 또는 `payments.status='failed'` 저장 로직을 추가하세요.
- 웹훅을 붙이면 결제 상태가 바뀌는 상황을 더 안정적으로 추적할 수 있습니다.

## 참고 공식 문서

- https://developers.tosspayments.com/sandbox
- https://docs.tosspayments.com/guides/v2/get-started/payment-flow
- https://docs.tosspayments.com/sdk/v2/js/payment-window
- https://docs.tosspayments.com/reference
- https://docs.tosspayments.com/reference/using-api/api-keys
