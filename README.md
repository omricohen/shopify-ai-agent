# Shopify AI Agent

A conversational AI agent that connects to any Shopify store and lets merchants explore their data, generate analytics, parse documents, and build Liquid page templates — all through natural language. Built with Next.js 14, the Vercel AI SDK, and OpenAI.

---

## Features

### AI Chat Agent

The core of the app is a streaming chat interface backed by an LLM with access to **13 tools** that query the Shopify Admin API in real time:

| Tool | Description |
|------|-------------|
| `get_products` | Fetch product catalog with variants and images |
| `search_products` | Full-text product search |
| `get_orders` | Retrieve orders with line items and fulfillment status |
| `get_customers` | Customer records and order history |
| `get_inventory` | Inventory levels across locations |
| `get_analytics` | Revenue, AOV, and order metrics over a date range |
| `get_collections` | Product collections (smart and manual) |
| `get_shop_info` | Store configuration and metadata |
| `get_discount_codes` | Active and expired discount codes |
| `get_draft_orders` | Unpaid draft orders |
| `get_abandoned_checkouts` | Abandoned checkout recovery data |
| `parse_document` | Parse uploaded CSV or PDF files |
| `generate_liquid_page` | Generate a Shopify Liquid section template |

### Generative UI

Tool results are not dumped as raw text. Each tool maps to a purpose-built React component that renders inline in the chat stream:

- **ProductCard** — image, price, variants, inventory badge
- **OrdersTable** — sortable table with status indicators
- **SalesChart** — revenue and order trend lines (Recharts)
- **MetricsRow** — KPI cards for revenue, AOV, order count
- **InventoryAlert** — low-stock warnings with thresholds
- **CustomerList** — customer cards with lifetime value
- **ShopInfoCard** — store details at a glance
- **DiscountList** — discount codes with usage stats
- **AbandonedCheckouts** — recovery opportunities with value
- **LiquidPreview** — live-rendered preview of generated Liquid templates

### Analytics Dashboard

A standalone dashboard view with date range filtering, revenue charts, top products, recent orders, and inventory alerts — all fetched from the same Shopify API layer used by the agent.

### Document Parsing

Users can drag-and-drop CSV or PDF files directly into the chat. CSV parsing includes automatic column type inference, summary statistics, and AI-generated insights. PDF text is extracted and made available for the agent to reason over.

### Liquid Page Generation

Ask the agent to generate a Shopify page (e.g., "build me a holiday sale landing page") and it produces a production-ready Liquid section template with proper `{% schema %}` blocks. The template is rendered in a sandboxed iframe preview with schema default values extracted automatically. Pages can be saved to a persistent library for later use.

### Pages Library

A dedicated view for browsing, previewing, and managing saved Liquid page templates.

---

## Architecture

The app follows a streaming tool-call pattern:

1. **Client** sends a message via the Vercel AI SDK's `useChat` hook.
2. **Server** (`/api/chat`) streams an OpenAI response with tool calls.
3. When the model invokes a tool, the server executes it (Shopify API call, document parse, or Liquid generation) and returns structured data.
4. The **client** matches each tool result to a generative UI component and renders it inline as the stream arrives.

Key patterns:
- **Streaming** — responses and tool results stream token-by-token; no waiting for full completion.
- **Tool calling** — the LLM decides which tools to invoke and with what parameters (validated with Zod schemas).
- **Generative UI** — React components are selected at render time based on tool name, giving the agent a rich visual vocabulary beyond plain text.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Shopify store with a [custom app](https://help.shopify.com/en/manual/apps/app-types/custom-apps) that has Admin API access

### Shopify Setup

1. In your Shopify admin, go to **Settings > Apps and sales channels > Develop apps**.
2. Create a new app and configure the Admin API scopes:
   - `read_products`, `read_orders`, `read_customers`, `read_inventory`, `read_analytics`, `read_discounts`, `read_draft_orders`, `read_checkouts`
3. Install the app and copy the **Admin API access token**.
4. Note your store's myshopify domain (e.g., `your-store.myshopify.com`).

### Environment Variables

Create a `.env.local` file in the project root:

```
OPENAI_API_KEY=sk-...
```

Store credentials (Shopify domain and access token) are entered by the user at login and validated against the Shopify Admin API at runtime — they are not stored server-side.

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Enter your Shopify store URL and Admin API access token to connect.

---

## Tech Stack

- **Framework** — Next.js 14 (App Router), React 18, TypeScript
- **AI** — Vercel AI SDK v6, OpenAI GPT
- **Styling** — Tailwind CSS, Radix UI primitives
- **Charts** — Recharts
- **Validation** — Zod
- **Document parsing** — csv-parse, pdf-parse
- **Deployment** — Vercel
