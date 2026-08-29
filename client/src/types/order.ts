import type { CartItem } from "./cart";

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "ready" | "requested" | "approved" | "failed" | "cancelled";

export type ShippingAddress = {
  receiverName: string;
  receiverPhone: string;
  postalCode: string;
  address1: string;
  address2?: string;
  memo?: string;
};

export type Order = ShippingAddress & {
  id: string;
  userId: string;
  status: OrderStatus;
  totalProductAmount: number;
  shippingFee: number;
  totalPaymentAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  optionId: string | null;
  productName: string;
  optionLabel: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};

export type Payment = {
  id: string;
  orderId: string;
  userId: string;
  provider: string;
  paymentKey: string | null;
  amount: number;
  status: PaymentStatus;
  approvedAt: string | null;
  createdAt: string;
};

export type CreateOrderInput = ShippingAddress & {
  items: CartItem[];
  shippingFee?: number;
};
