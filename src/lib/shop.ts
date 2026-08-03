export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price_cents: number;
  compare_at_cents: number | null;
  currency: string;
  stock: number;
  images: string[];
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  image_url: string | null;
};

export type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  currency: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postcode: string;
  notes: string | null;
  created_at: string;
};

export const SHIPPING_CENTS = 9900;
export const FREE_SHIPPING_OVER_CENTS = 500000;

export function formatPrice(cents: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Product photos live in a private store and are served through the site. */
export function productImageUrl(path: string | undefined | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `/api/public/product-image/${path}`;
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
