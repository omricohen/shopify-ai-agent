export interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  status: string;
  tags: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  created_at: string;
  updated_at: string;
  handle: string;
}

export interface ShopifyVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  inventory_quantity: number;
  inventory_item_id: string;
  weight: number;
  weight_unit: string;
}

export interface ShopifyImage {
  id: string;
  product_id: string;
  src: string;
  alt: string | null;
  width: number;
  height: number;
}

export interface ShopifyOrder {
  id: string;
  order_number: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  line_items: ShopifyLineItem[];
  customer: ShopifyCustomer | null;
  shipping_address: ShopifyAddress | null;
  total_discounts: string;
  note: string | null;
}

export interface ShopifyLineItem {
  id: string;
  title: string;
  quantity: number;
  price: string;
  sku: string;
  variant_title: string;
  product_id: string;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  total_spent: string;
  created_at: string;
  updated_at: string;
  phone: string | null;
  tags: string;
  default_address: ShopifyAddress | null;
  state: string;
}

export interface ShopifyAddress {
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  body_html: string;
  handle: string;
  image: ShopifyImage | null;
  products_count: number;
  published_at: string;
}

export interface ShopifyInventoryLevel {
  inventory_item_id: string;
  location_id: string;
  available: number;
  updated_at: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { title: string; revenue: number; quantity: number }[];
  revenueByDay: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
}

export interface ShopifyShopInfo {
  id: string;
  name: string;
  email: string;
  domain: string;
  myshopify_domain: string;
  plan_name: string;
  plan_display_name: string;
  currency: string;
  money_format: string;
  timezone: string;
  iana_timezone: string;
  country_name: string;
  province: string;
  city: string;
  address1: string;
  phone: string;
  created_at: string;
  updated_at: string;
  shop_owner: string;
  weight_unit: string;
  primary_locale: string;
}

export interface ShopifyPriceRule {
  id: string;
  title: string;
  value_type: "fixed_amount" | "percentage";
  value: string;
  starts_at: string;
  ends_at: string | null;
  usage_limit: number | null;
  times_used: number;
  status: string;
  target_type: string;
  target_selection: string;
  created_at: string;
}

export interface ShopifyDiscountCode {
  id: string;
  code: string;
  price_rule_id: string;
  usage_count: number;
  created_at: string;
}

export interface ShopifyDraftOrder {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  status: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  line_items: ShopifyLineItem[];
  customer: ShopifyCustomer | null;
  note: string | null;
  invoice_url: string;
}

export interface ShopifyAbandonedCheckout {
  id: string;
  token: string;
  email: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  total_price: string;
  subtotal_price: string;
  total_discounts: string;
  currency: string;
  line_items: ShopifyLineItem[];
  customer: ShopifyCustomer | null;
  abandoned_checkout_url: string;
  recovery_url: string;
}

export interface StoreCredentials {
  storeUrl: string;
  accessToken: string;
}
