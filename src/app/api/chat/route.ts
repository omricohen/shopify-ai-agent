import { streamText, tool, zodSchema, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { SYSTEM_PROMPT } from "@/lib/agents";
import { ShopifyClient } from "@/lib/shopify";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, storeUrl, accessToken, documentContent } = body;

  if (!storeUrl || !accessToken) {
    return new Response(
      JSON.stringify({ error: "Shopify credentials required" }),
      { status: 400 }
    );
  }

  const shopify = new ShopifyClient(storeUrl, accessToken);

  const systemPrompt = documentContent
    ? `${SYSTEM_PROMPT}\n\n## Uploaded Document Context\nThe user has uploaded a document. Here is the parsed content:\nFilename: ${documentContent.filename}\nType: ${documentContent.type}\nSummary: ${documentContent.summary}\n${documentContent.columns ? `Columns: ${documentContent.columns.join(", ")}` : ""}\n${documentContent.rowCount ? `Rows: ${documentContent.rowCount}` : ""}\nContent:\n${documentContent.content}`
    : SYSTEM_PROMPT;

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages,
    tools: {
      get_products: tool({
        description:
          "Fetch products from the Shopify store. Can filter by status, title, product type, or collection.",
        inputSchema: zodSchema(
          z.object({
            limit: z.number().optional().describe("Max products to return (default 50)"),
            status: z.enum(["active", "draft", "archived"]).optional(),
            title: z.string().optional(),
            product_type: z.string().optional(),
            collection_id: z.string().optional(),
          })
        ),
        execute: async (params) => {
          try {
            const products = await shopify.getProducts(params);
            return {
              success: true,
              type: "products",
              data: products,
              count: products.length,
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      search_products: tool({
        description: "Full-text search across products.",
        inputSchema: zodSchema(
          z.object({
            query: z.string().describe("Search query"),
          })
        ),
        execute: async ({ query }) => {
          try {
            const products = await shopify.searchProducts(query);
            return {
              success: true,
              type: "products",
              data: products,
              count: products.length,
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      get_orders: tool({
        description: "Fetch orders with filters for date range, status, fulfillment.",
        inputSchema: zodSchema(
          z.object({
            limit: z.number().optional(),
            status: z.string().optional(),
            financial_status: z.string().optional(),
            fulfillment_status: z.string().optional(),
            created_at_min: z.string().optional(),
            created_at_max: z.string().optional(),
          })
        ),
        execute: async (params) => {
          try {
            const orders = await shopify.getOrders(params);
            return {
              success: true,
              type: "orders",
              data: orders,
              count: orders.length,
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      get_customers: tool({
        description: "Fetch customers with optional date range filter.",
        inputSchema: zodSchema(
          z.object({
            limit: z.number().optional(),
            created_at_min: z.string().optional(),
            created_at_max: z.string().optional(),
          })
        ),
        execute: async (params) => {
          try {
            const customers = await shopify.getCustomers(params);
            return {
              success: true,
              type: "customers",
              data: customers,
              count: customers.length,
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      get_inventory: tool({
        description: "Check inventory levels and identify low-stock items.",
        inputSchema: zodSchema(
          z.object({
            low_stock_threshold: z
              .number()
              .optional()
              .describe("Threshold for low stock (default 10)"),
          })
        ),
        execute: async ({ low_stock_threshold = 10 }) => {
          try {
            const products = await shopify.getProducts({ limit: 100 });
            const alertItems: Array<{
              title: string;
              variant?: string;
              sku: string;
              quantity: number;
              threshold: number;
            }> = [];

            products.forEach((product) => {
              product.variants?.forEach((variant) => {
                if (variant.inventory_quantity <= low_stock_threshold) {
                  alertItems.push({
                    title: product.title,
                    variant:
                      variant.title !== "Default Title"
                        ? variant.title
                        : undefined,
                    sku: variant.sku,
                    quantity: variant.inventory_quantity,
                    threshold: low_stock_threshold,
                  });
                }
              });
            });

            alertItems.sort((a, b) => a.quantity - b.quantity);

            return {
              success: true,
              type: "inventory",
              data: {
                items: alertItems,
                title: `Items below ${low_stock_threshold} units`,
                totalChecked: products.length,
              },
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      get_analytics: tool({
        description: "Get sales analytics: revenue, orders, AOV, trends.",
        inputSchema: zodSchema(
          z.object({
            created_at_min: z.string().optional(),
            created_at_max: z.string().optional(),
          })
        ),
        execute: async (params) => {
          try {
            const analytics = await shopify.getAnalytics(params);
            return {
              success: true,
              type: "analytics",
              metrics: [
                {
                  label: "Total Revenue",
                  value: analytics.totalRevenue,
                  format: "currency",
                  icon: "revenue",
                },
                {
                  label: "Total Orders",
                  value: analytics.totalOrders,
                  format: "number",
                  icon: "orders",
                },
                {
                  label: "Avg Order Value",
                  value: analytics.averageOrderValue,
                  format: "currency",
                  icon: "aov",
                },
              ],
              chart: {
                revenueByDay: analytics.revenueByDay,
                title: "Revenue Trend",
                chartType: "area",
              },
              topProducts: analytics.topProducts,
              ordersByStatus: analytics.ordersByStatus,
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      get_collections: tool({
        description: "Fetch all product collections.",
        inputSchema: zodSchema(
          z.object({
            limit: z.number().optional(),
          })
        ),
        execute: async ({ limit }) => {
          try {
            const collections = await shopify.getCollections(limit ?? undefined);
            return {
              success: true,
              type: "collections",
              data: collections,
              count: collections.length,
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      parse_document: tool({
        description:
          "Analyze the uploaded document. The document has already been parsed and is in context.",
        inputSchema: zodSchema(
          z.object({
            question: z.string().describe("Question about the document"),
          })
        ),
        execute: async ({ question }) => {
          if (!documentContent) {
            return {
              success: false,
              error: "No document has been uploaded yet.",
            };
          }
          return {
            success: true,
            type: "document",
            data: documentContent,
            question,
          };
        },
      }),

      generate_liquid_page: tool({
        description:
          "Generate a Shopify Liquid template page based on requirements.",
        inputSchema: zodSchema(
          z.object({
            page_type: z
              .string()
              .describe(
                "Type of page: landing, about, contact, faq, product-showcase, custom"
              ),
            title: z.string().describe("Page title"),
            description: z
              .string()
              .describe("Detailed description of the page content and design"),
            sections: z
              .array(z.string())
              .optional()
              .describe("Specific sections to include"),
            style: z
              .string()
              .optional()
              .describe("Design style: modern, minimal, bold"),
          })
        ),
        execute: async ({
          page_type,
          title,
          description,
          sections,
          style,
        }) => {
          return {
            success: true,
            type: "liquid",
            data: {
              pageType: page_type,
              title,
              description,
              sections: sections || [],
              style: style || "modern",
              code: `<!-- Generated Liquid template for: ${title} -->`,
            },
          };
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  return result.toDataStreamResponse();
}
