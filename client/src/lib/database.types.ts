export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          user_id: string;
          toss_order_id: string;
          receiver_name: string;
          receiver_phone: string;
          postal_code: string;
          address1: string;
          total_product_amount: number;
          shipping_fee: number;
          total_payment_amount: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          toss_order_id: string;
          receiver_name: string;
          receiver_phone: string;
          postal_code: string;
          address1: string;
          total_product_amount: number;
          shipping_fee: number;
          total_payment_amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          option_id: number | null;
          product_name: string;
          option_label: string | null;
          unit_price: number;
          quantity: number;
          total_price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          option_id?: number | null;
          product_name: string;
          option_label?: string | null;
          unit_price: number;
          quantity: number;
          total_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};