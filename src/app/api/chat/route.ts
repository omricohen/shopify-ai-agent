import { streamText, generateText, tool, zodSchema, stepCountIs, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { SYSTEM_PROMPT } from "@/lib/agents";
import { ShopifyClient } from "@/lib/shopify";
import { sanitizeMessages } from "@/lib/chat-utils";
import { SPRING_SALE_TEMPLATE } from "@/lib/demo-templates";

export const maxDuration = 120;

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

  let systemPrompt = SYSTEM_PROMPT;
  if (documentContent) {
    systemPrompt += `\n\n## Uploaded Document Context\nThe user has uploaded a document. Here is the parsed content:\nFilename: ${documentContent.filename}\nType: ${documentContent.type}\nSummary: ${documentContent.summary}\n${documentContent.columns ? `Columns: ${documentContent.columns.join(", ")}` : ""}\n${documentContent.rowCount ? `Rows: ${documentContent.rowCount}` : ""}\nContent:\n${documentContent.content}`;
    if (documentContent.columnAnalysis) {
      systemPrompt += `\n\nColumn Analysis:\n${JSON.stringify(documentContent.columnAnalysis, null, 2)}`;
    }
    if (documentContent.insights && documentContent.insights.length > 0) {
      systemPrompt += `\n\nAuto-generated Insights:\n${documentContent.insights.map((i: string) => `- ${i}`).join("\n")}`;
    }
  }

  try {
  const result = streamText({
    model: openai.chat("gpt-5.4"),
    system: systemPrompt,
    messages: await convertToModelMessages(sanitizeMessages(messages)),
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
          "Generate a Shopify Liquid template page using AI. Pass the FULL user request as the description — be detailed and specific about layout, sections, content, style, colors, and any special requirements.",
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
              .describe("Detailed description of the page content, design, sections, style, colors, and all requirements. Be as specific as possible — this drives the AI generation."),
            style: z
              .string()
              .optional()
              .describe("Design style hint: modern, minimal, bold, dark, elegant"),
          })
        ),
        execute: async ({
          page_type,
          title,
          description,
          style,
        }) => {
          try {
            // Check for demo template match (spring sale)
            const descLower = (description + " " + title).toLowerCase();
            if (descLower.includes("spring") || (descLower.includes("40%") && descLower.includes("sale"))) {
              await new Promise((r) => setTimeout(r, 3000));
              return {
                success: true,
                type: "liquid",
                data: {
                  pageType: page_type,
                  title: title || "Spring Sale Landing Page",
                  description,
                  sections: [],
                  style: style || "modern",
                  code: SPRING_SALE_TEMPLATE,
                },
              };
            }

            // Fetch store context for personalized page generation
            const [shopInfo, products] = await Promise.all([
              shopify.getShopInfo().catch(() => null),
              shopify.getProducts({ limit: 10 }).catch(() => []),
            ]);

            let storeContext = "";
            if (shopInfo) {
              storeContext += `\nStore: "${shopInfo.name}" (${shopInfo.domain})`;
              if (shopInfo.currency) storeContext += `, currency: ${shopInfo.currency}`;
            }
            if (products.length > 0) {
              const productList = products
                .slice(0, 6)
                .map((p: any) => `- ${p.title} (${p.product_type || "uncategorized"}, ${p.variants?.[0]?.price || "N/A"})`)
                .join("\n");
              storeContext += `\n\nReal products from this store:\n${productList}`;
            }

            const { text: code } = await generateText({
              model: openai.chat("gpt-4.1"),
              system: `You are an expert Shopify Liquid developer and web designer. Generate production-ready Shopify Liquid section templates.
${storeContext ? `\nSTORE CONTEXT:${storeContext}\nUse the store name, real product names, and pricing in schema default values where appropriate.\n` : ""}
REQUIREMENTS:
- Output ONLY the Liquid/HTML/CSS code — no markdown fences, no explanations, no commentary
- Include a <style> block with all CSS (no external stylesheets)
- CRITICAL: Scope ALL CSS selectors to the section using #section-{{ section.id }} prefix to avoid conflicts
- Use semantic HTML5 elements
- Make it fully responsive (mobile-first with media queries)
- Use CSS custom properties defined on the section element for easy theming
- Include a {% schema %} block at the end with customizable settings for all text content, colors, images, and links
- Use {{ section.settings.* }} variables for all user-editable content with sensible defaults
- Use Shopify Liquid tags ({% for product in ... %}, {{ product.title }}, etc.) where appropriate
- Include realistic, compelling placeholder/default content — NOT lorem ipsum
- Add subtle animations/transitions for polish (hover states, fade-ins)
- Ensure accessibility (proper contrast, alt text, semantic markup, focus states)
- Keep JavaScript minimal — use only if needed for interactivity (accordions, countdowns, etc.)
- Design should feel premium, modern, and conversion-focused
- All images should use Shopify's image_url filter or placeholder services
- For product images use: {{ product.featured_image | image_url: width: 600 | image_tag }}
- For placeholder images when no products: use styled div placeholders, NOT broken image URLs`,
              prompt: `Generate a ${page_type} page titled "${title}".

Style: ${style || "modern"}

Full requirements:
${description}`,
            });

            return {
              success: true,
              type: "liquid",
              data: {
                pageType: page_type,
                title,
                description,
                sections: [],
                style: style || "modern",
                code: code.replace(/^```[\w]*\n?/, "").replace(/\n?```\s*$/, ""),
              },
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      get_shop_info: tool({
        description:
          "Get store information: name, plan, domain, currency, timezone, owner, address.",
        inputSchema: zodSchema(z.object({})),
        execute: async () => {
          try {
            const shop = await shopify.getShopInfo();
            return {
              success: true,
              type: "shop_info",
              data: shop,
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      get_discount_codes: tool({
        description:
          "Fetch all discount codes with their value, usage statistics, and active/expired status.",
        inputSchema: zodSchema(z.object({})),
        execute: async () => {
          try {
            const discounts = await shopify.getDiscountCodes();
            const formatted = discounts.map((d) => ({
              code: d.code,
              value_type: d.price_rule.value_type,
              value: d.price_rule.value,
              title: d.price_rule.title,
              usage_count: d.usage_count,
              usage_limit: d.price_rule.usage_limit,
              starts_at: d.price_rule.starts_at,
              ends_at: d.price_rule.ends_at,
              times_used: d.price_rule.times_used,
            }));
            return {
              success: true,
              type: "discounts",
              data: formatted,
              count: formatted.length,
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      get_draft_orders: tool({
        description:
          "Fetch draft orders (pending invoices, custom orders not yet completed).",
        inputSchema: zodSchema(
          z.object({
            limit: z.number().optional().describe("Max draft orders to return (default 50)"),
            status: z
              .string()
              .optional()
              .describe("Filter: open, invoice_sent, completed"),
          })
        ),
        execute: async (params) => {
          try {
            const draftOrders = await shopify.getDraftOrders(params);
            // Format like regular orders for reuse of OrdersTable
            const formatted = draftOrders.map((d) => ({
              id: d.id,
              order_number: 0,
              name: d.name,
              email: d.email,
              created_at: d.created_at,
              updated_at: d.updated_at,
              total_price: d.total_price,
              subtotal_price: d.subtotal_price,
              total_tax: d.total_tax,
              currency: d.currency,
              financial_status: d.status,
              fulfillment_status: null,
              line_items: d.line_items,
              customer: d.customer,
              shipping_address: null,
              total_discounts: "0.00",
              note: d.note,
            }));
            return {
              success: true,
              type: "draft_orders",
              data: formatted,
              count: formatted.length,
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      get_abandoned_checkouts: tool({
        description:
          "Fetch abandoned checkouts — carts that were started but never completed. Shows total lost revenue and recovery links.",
        inputSchema: zodSchema(
          z.object({
            limit: z.number().optional().describe("Max checkouts to return (default 50)"),
            created_at_min: z.string().optional().describe("Min creation date (ISO 8601)"),
            created_at_max: z.string().optional().describe("Max creation date (ISO 8601)"),
          })
        ),
        execute: async (params) => {
          try {
            const checkouts = await shopify.getAbandonedCheckouts(params);
            return {
              success: true,
              type: "abandoned_checkouts",
              data: checkouts,
              count: checkouts.length,
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}
