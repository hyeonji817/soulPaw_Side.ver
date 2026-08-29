import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

const tossClientKey = import.meta.env.VITE_TOSS_CLIENT_KEY; 

if (!tossClientKey) {
  throw new Error("Missing VITE_TOSS_CLIENT_KEY.");
}

export const getTossPayments = () => loadTossPayments(tossClientKey);