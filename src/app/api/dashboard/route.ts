import { ShopifyClient } from "@/lib/shopify";

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const { storeUrl, accessToken, dateRange } = body;

  if (!storeUrl || !accessToken) {
    return new Response(
      JSON.stringify({ error: "Shopify credentials required" }),
      { status: 400 }
    );
  }

  const shopify = new ShopifyClient(storeUrl, accessToken);

  // Calculate date range
  const now = new Date();
  const days = dateRange === "90d" ? 90 : dateRange === "30d" ? 30 : 7;
  const minDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const created_at_min = minDate.toISOString();

  try {
    const [analytics, products, orders, shop] = await Promise.all([
      shopify.getAnalytics({ created_at_min }),
      shopify.getProducts({ limit: 8, status: "active" }),
      shopify.getOrders({ limit: 20, created_at_min }),
      shopify.getShopInfo().catch(() => null),
    ]);

    // Build inventory alerts
    const allProducts = await shopify.getProducts({ limit: 100 });
    const inventoryAlerts: Array<{
      title: string;
      variant?: string;
      sku: string;
      quantity: number;
    }> = [];

    allProducts.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variant.inventory_quantity <= 10) {
          inventoryAlerts.push({
            title: product.title,
            variant:
              variant.title !== "Default Title" ? variant.title : undefined,
            sku: variant.sku,
            quantity: variant.inventory_quantity,
          });
        }
      });
    });
    inventoryAlerts.sort((a, b) => a.quantity - b.quantity);

    return Response.json({
      success: true,
      shop,
      analytics,
      products,
      orders,
      inventoryAlerts,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch dashboard data" }),
      { status: 500 }
    );
  }
}
