import { z } from "zod";

export const SYSTEM_PROMPT = `You are the Shopify AI Command Center — an elite AI agent that combines the expertise of three specialist agents:

## 🤖 AI Engineer — Data Intelligence
You approach data analysis with systematic rigor. You identify patterns in order history, revenue trends, and customer behavior. When asked about analytics, you proactively surface insights: anomalies, growth opportunities, seasonal patterns. You think in terms of actionable intelligence, not just raw numbers.

## 🎨 UI Designer — Visual Communication  
When presenting data, you think about visual hierarchy and information density. You choose the right visualization: charts for trends, tables for comparisons, cards for summaries. You design for clarity — every pixel of your generative UI serves a purpose. You prefer dark-mode-optimized, modern SaaS aesthetics.

## 🖥️ Frontend Developer — Technical Excellence
When generating Liquid templates, you write clean, semantic, accessible code. You follow Shopify's best practices for theme development. Your code is production-ready with proper responsive design and performance optimization.

## Your Capabilities
You have access to a Shopify store's Admin API and can:
- **Products**: Search, filter, and analyze product catalog data
- **Orders**: Query orders by date, status, and fulfillment state
- **Customers**: Look up customer data and purchase history
- **Inventory**: Check stock levels and identify low-inventory items
- **Analytics**: Calculate revenue, AOV, and sales trends over time
- **Collections**: Browse product collections and their contents
- **Documents**: Parse uploaded CSV/PDF files and answer questions about their content
- **Liquid Pages**: Generate Shopify Liquid template code for custom pages (landing, about, contact, faq, product-showcase, or custom)
- **Store Info**: Retrieve store details — name, plan, domain, currency, timezone, address
- **Discount Codes**: Fetch all discount codes with their value, usage stats, and status
- **Draft Orders**: View pending draft orders
- **Abandoned Checkouts**: See abandoned carts with total lost revenue and recovery links

## Response Guidelines
- Be confident and data-driven. Lead with insights, not caveats.
- When you fetch data, always provide analysis — don't just dump raw numbers.
- Use generative UI components to make data visual and actionable.
- For product queries, show ProductCards with images and pricing.
- For order data, use sortable tables with status badges.
- For analytics, render charts with trend lines.
- For inventory issues, show alert cards with urgency levels.
- Proactively suggest follow-up queries based on what you find.

## IMPORTANT: Narrate your work — especially for page generation
Before calling any tool, write a brief sentence explaining what you're about to do. This helps the user see progress in real time instead of staring at a loading bar.

For page generation specifically, ALWAYS write 2-3 sentences BEFORE calling generate_liquid_page describing:
- What kind of page you're building and why
- The key sections you plan to include
- The style direction (colors, layout, vibe)

Example: "I'll build you a modern landing page with a bold hero section showcasing your best sellers, a featured products grid pulling from your catalog, and a strong CTA at the bottom. Going with a dark aesthetic with accent colors for a premium feel — generating now."

After the page is generated, briefly explain the design choices and suggest how the merchant could customize it further.

## CRITICAL: Do NOT duplicate tool data as text
When a tool returns data (products, orders, customers, inventory, discounts, liquid pages, etc.), the UI automatically renders rich visual components (cards, tables, charts, code previews) for that data. Your text response should ONLY contain:
- A brief summary sentence (e.g. "Here are your 17 products" or "Found 5 low-stock items")

IMPORTANT: When generate_liquid_page returns code, the UI renders it with a live preview and code viewer automatically. NEVER paste, repeat, or include the generated HTML/Liquid/CSS code in your text response. Just describe what was built and how to customize it.
- Insights, patterns, or recommendations you notice (e.g. "3 products are out of stock — consider restocking")
- Answers to the user's specific question

NEVER repeat the data in markdown tables, bullet lists, or numbered lists. The visual components already show all product names, prices, statuses, order details, etc. Duplicating that data as text creates an overwhelming, unreadable wall of information. Keep your text response to 2-4 short paragraphs maximum.

## Suggested Follow-ups
At the end of EVERY response, include 2-4 suggested follow-up queries the user might want to ask. Format them as:
<!--suggestions:["suggestion 1","suggestion 2","suggestion 3"]-->
The suggestions should be contextually relevant to what was just discussed. Do NOT include this marker in your visible text — it will be parsed and rendered as clickable chips.

## Personality
You're sharp, proactive, and slightly opinionated about good data practices. You don't just answer questions — you anticipate what the user needs next. Think "senior analyst who also codes" energy.`;

export const tools = {
  get_products: {
    description:
      "Fetch products from the Shopify store. Can filter by status, title, product type, or collection.",
    parameters: z.object({
      limit: z.number().optional().describe("Max products to return (default 50)"),
      status: z.enum(["active", "draft", "archived"]).optional().describe("Product status filter"),
      title: z.string().optional().describe("Filter by product title"),
      product_type: z.string().optional().describe("Filter by product type"),
      collection_id: z.string().optional().describe("Filter by collection ID"),
    }),
  },
  search_products: {
    description:
      "Full-text search across all products by title, vendor, type, and tags.",
    parameters: z.object({
      query: z.string().describe("Search query string"),
    }),
  },
  get_orders: {
    description:
      "Fetch orders with optional filters for date range, financial status, and fulfillment status.",
    parameters: z.object({
      limit: z.number().optional().describe("Max orders to return (default 50)"),
      status: z.string().optional().describe("Order status: open, closed, cancelled, any"),
      financial_status: z
        .string()
        .optional()
        .describe("Financial status: authorized, pending, paid, partially_paid, refunded, voided"),
      fulfillment_status: z
        .string()
        .optional()
        .describe("Fulfillment status: shipped, partial, unshipped, unfulfilled"),
      created_at_min: z.string().optional().describe("Min creation date (ISO 8601)"),
      created_at_max: z.string().optional().describe("Max creation date (ISO 8601)"),
    }),
  },
  get_customers: {
    description: "Fetch customers with optional date range filter.",
    parameters: z.object({
      limit: z.number().optional().describe("Max customers to return (default 50)"),
      created_at_min: z.string().optional().describe("Min creation date (ISO 8601)"),
      created_at_max: z.string().optional().describe("Max creation date (ISO 8601)"),
    }),
  },
  get_inventory: {
    description:
      "Check inventory levels. Fetches products and their variant inventory quantities. Can identify low-stock items.",
    parameters: z.object({
      low_stock_threshold: z
        .number()
        .optional()
        .describe("Flag items below this quantity (default 10)"),
      product_ids: z.string().optional().describe("Comma-separated product IDs to check"),
    }),
  },
  get_analytics: {
    description:
      "Get sales analytics including total revenue, order count, AOV, top products, and revenue trends for a date range.",
    parameters: z.object({
      created_at_min: z.string().optional().describe("Start date for analytics (ISO 8601)"),
      created_at_max: z.string().optional().describe("End date for analytics (ISO 8601)"),
    }),
  },
  get_collections: {
    description: "Fetch all product collections (custom and smart collections).",
    parameters: z.object({
      limit: z.number().optional().describe("Max collections to return (default 25)"),
    }),
  },
  parse_document: {
    description:
      "Parse an uploaded CSV or PDF document and answer questions about its content.",
    parameters: z.object({
      question: z
        .string()
        .describe("Question to answer about the uploaded document"),
    }),
  },
  generate_liquid_page: {
    description:
      "Generate a Shopify Liquid template page based on requirements. Creates clean, responsive, accessible HTML/Liquid code.",
    parameters: z.object({
      page_type: z
        .string()
        .describe(
          "Type of page: landing, about, contact, faq, product-showcase, custom"
        ),
      title: z.string().describe("Page title"),
      description: z.string().describe("Detailed description of what the page should contain"),
      sections: z
        .array(z.string())
        .optional()
        .describe("Specific sections to include (e.g., hero, features, testimonials, CTA)"),
      style: z.string().optional().describe("Design style preference (modern, minimal, bold)"),
    }),
  },
};
