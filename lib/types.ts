export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  cost_price: number;
  image_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  category: string;
  active: boolean;
  featured: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "completed"
  | "cancelled";

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string | null;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_method: "pay_now" | "cod";
  payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded";
  location_pin: string | null;
  toyyibpay_bill_code: string | null;
  toyyibpay_refno: string | null;
  toyyibpay_transaction_id: string | null;
  payment_paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
};
