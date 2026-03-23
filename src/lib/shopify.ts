import {
  ShopifyProduct,
  ShopifyOrder,
  ShopifyCustomer,
  ShopifyCollection,
  AnalyticsData,
} from "@/types/shopify";

export class ShopifyClient {
  private storeUrl: string;
  private accessToken: string;
  private apiVersion = "2024-01";

  constructor(storeUrl: string, accessToken: string) {
    // Normalize store URL
    this.storeUrl = storeUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    if (!this.storeUrl.includes(".myshopify.com")) {
      this.storeUrl = `${this.storeUrl}.myshopify.com`;
    }
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(
      `/admin/api/${this.apiVersion}/${endpoint}.json`,
      `https://${this.storeUrl}`
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        "X-Shopify-Access-Token": this.accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Shopify API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  async getProducts(options?: {
    limit?: number;
    status?: string;
    title?: string;
    product_type?: string;
    collection_id?: string;
    ids?: string;
  }): Promise<ShopifyProduct[]> {
    const params: Record<string, string> = {
      limit: String(options?.limit || 50),
    };
    if (options?.status) params.status = options.status;
    if (options?.title) params.title = options.title;
    if (options?.product_type) params.product_type = options.product_type;
    if (options?.collection_id) params.collection_id = options.collection_id;
    if (options?.ids) params.ids = options.ids;

    const data = await this.request<{ products: ShopifyProduct[] }>("products", params);
    return data.products;
  }

  async searchProducts(query: string): Promise<ShopifyProduct[]> {
    // Use title filter for basic search
    const data = await this.request<{ products: ShopifyProduct[] }>("products", {
      limit: "50",
    });
    const q = query.toLowerCase();
    return data.products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.product_type.toLowerCase().includes(q) ||
        p.tags.toLowerCase().includes(q)
    );
  }

  async getOrders(options?: {
    limit?: number;
    status?: string;
    financial_status?: string;
    fulfillment_status?: string;
    created_at_min?: string;
    created_at_max?: string;
  }): Promise<ShopifyOrder[]> {
    const params: Record<string, string> = {
      limit: String(options?.limit || 50),
      status: options?.status || "any",
    };
    if (options?.financial_status) params.financial_status = options.financial_status;
    if (options?.fulfillment_status) params.fulfillment_status = options.fulfillment_status;
    if (options?.created_at_min) params.created_at_min = options.created_at_min;
    if (options?.created_at_max) params.created_at_max = options.created_at_max;

    const data = await this.request<{ orders: ShopifyOrder[] }>("orders", params);
    return data.orders;
  }

  async getCustomers(options?: {
    limit?: number;
    created_at_min?: string;
    created_at_max?: string;
    ids?: string;
  }): Promise<ShopifyCustomer[]> {
    const params: Record<string, string> = {
      limit: String(options?.limit || 50),
    };
    if (options?.created_at_min) params.created_at_min = options.created_at_min;
    if (options?.created_at_max) params.created_at_max = options.created_at_max;
    if (options?.ids) params.ids = options.ids;

    const data = await this.request<{ customers: ShopifyCustomer[] }>("customers", params);
    return data.customers;
  }

  async getCollections(limit?: number): Promise<ShopifyCollection[]> {
    const [custom, smart] = await Promise.all([
      this.request<{ custom_collections: ShopifyCollection[] }>("custom_collections", {
        limit: String(limit || 25),
      }),
      this.request<{ smart_collections: ShopifyCollection[] }>("smart_collections", {
        limit: String(limit || 25),
      }),
    ]);
    return [...custom.custom_collections, ...smart.smart_collections];
  }

  async getInventoryLevels(inventoryItemIds: string[]): Promise<any[]> {
    const data = await this.request<{ inventory_levels: any[] }>(
      "inventory_levels",
      { inventory_item_ids: inventoryItemIds.join(",") }
    );
    return data.inventory_levels;
  }

  async getAnalytics(options?: {
    created_at_min?: string;
    created_at_max?: string;
  }): Promise<AnalyticsData> {
    const orders = await this.getOrders({
      limit: 250,
      status: "any",
      created_at_min: options?.created_at_min,
      created_at_max: options?.created_at_max,
    });

    const totalRevenue = orders.reduce(
      (sum, o) => sum + parseFloat(o.total_price),
      0
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products
    const productMap = new Map<string, { title: string; revenue: number; quantity: number }>();
    orders.forEach((order) => {
      order.line_items.forEach((item) => {
        const existing = productMap.get(item.product_id) || {
          title: item.title,
          revenue: 0,
          quantity: 0,
        };
        existing.revenue += parseFloat(item.price) * item.quantity;
        existing.quantity += item.quantity;
        productMap.set(item.product_id, existing);
      });
    });
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Revenue by day
    const dayMap = new Map<string, { revenue: number; orders: number }>();
    orders.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0];
      const existing = dayMap.get(date) || { revenue: 0, orders: 0 };
      existing.revenue += parseFloat(order.total_price);
      existing.orders += 1;
      dayMap.set(date, existing);
    });
    const revenueByDay = Array.from(dayMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Orders by status
    const statusMap = new Map<string, number>();
    orders.forEach((order) => {
      const status = order.financial_status || "unknown";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    const ordersByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topProducts,
      revenueByDay,
      ordersByStatus,
    };
  }
}
