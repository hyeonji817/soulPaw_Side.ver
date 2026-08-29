import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

export const getTossPayments = () => {
  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;

  if (!clientKey) {
    throw new Error("VITE_TOSS_CLIENT_KEY is required.");
  }

  return loadTossPayments(clientKey);
};