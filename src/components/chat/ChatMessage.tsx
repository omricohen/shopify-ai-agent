"use client";

import { memo, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import {
  Bot,
  User,
  Sparkles,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  FileCode2,
  Store,
  Tag,
  FileText,
  Layers,
  Search,
  AlertTriangle,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { usePages } from "@/lib/pages-context";
import {
  ProductCard,
  OrdersTable,
  SalesChart,
  MetricsRow,
  InventoryAlert,
  CustomerList,
  LiquidPreview,
  ShopInfoCard,
  DiscountList,
  AbandonedCheckouts,
} from "@/components/generative";

export interface ToolResult {
  type: string;
  data: any;
}

export interface ActiveToolCall {
  toolName: string;
  state: string;
  input?: any;
}

const TOOL_META: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  get_products: { label: "Products", icon: Package, description: "Fetching products from your store" },
  search_products: { label: "Search", icon: Search, description: "Searching products" },
  get_orders: { label: "Orders", icon: ShoppingCart, description: "Fetching orders" },
  get_customers: { label: "Customers", icon: Users, description: "Fetching customer data" },
  get_inventory: { label: "Inventory", icon: AlertTriangle, description: "Checking inventory levels" },
  get_analytics: { label: "Analytics", icon: BarChart3, description: "Analyzing sales data" },
  get_collections: { label: "Collections", icon: Layers, description: "Fetching collections" },
  generate_liquid_page: { label: "Page Generator", icon: FileCode2, description: "Generating Liquid page" },
  parse_document: { label: "Document", icon: FileText, description: "Analyzing document" },
  get_shop_info: { label: "Store Info", icon: Store, description: "Fetching store information" },
  get_discount_codes: { label: "Discounts", icon: Tag, description: "Fetching discount codes" },
  get_draft_orders: { label: "Draft Orders", icon: ShoppingBag, description: "Fetching draft orders" },
  get_abandoned_checkouts: { label: "Checkouts", icon: ShoppingCart, description: "Fetching abandoned checkouts" },
};

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResult[];
  isStreaming?: boolean;
  activeToolCalls?: ActiveToolCall[];
}

function LiquidPreviewWithSave({ data }: { data: any }) {
  const { savePage, pages } = usePages();
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    savePage({
      title: data.title || "Untitled Page",
      pageType: data.pageType || "custom",
      style: data.style,
      description: data.description,
      code: data.code,
    });
    setSaved(true);
  }, [data, savePage]);

  return (
    <LiquidPreview
      code={data.code}
      title={data.title}
      pageType={data.pageType}
      onSave={handleSave}
      isSaved={saved}
    />
  );
}

function renderToolResult(result: ToolResult, index: number) {
  const key = `tool-${index}`;

  switch (result.type) {
    case "products":
      return <ProductCard key={key} products={result.data} />;
    case "orders":
      return <OrdersTable key={key} orders={result.data} />;
    case "analytics_chart":
      return (
        <SalesChart
          key={key}
          data={result.data.revenueByDay}
          title={result.data.title}
          type={result.data.chartType}
        />
      );
    case "metrics":
      return <MetricsRow key={key} metrics={result.data} />;
    case "inventory":
      return (
        <InventoryAlert
          key={key}
          items={result.data.items}
          title={result.data.title}
        />
      );
    case "customers":
      return <CustomerList key={key} customers={result.data} />;
    case "liquid":
      return <LiquidPreviewWithSave key={key} data={result.data} />;
    case "shop_info":
      return <ShopInfoCard key={key} shop={result.data} />;
    case "discounts":
      return <DiscountList key={key} discounts={result.data} />;
    case "draft_orders":
      return <OrdersTable key={key} orders={result.data} />;
    case "abandoned_checkouts":
      return <AbandonedCheckouts key={key} checkouts={result.data} />;
    default:
      return null;
  }
}

function ToolCallProgress({ toolCalls }: { toolCalls: ActiveToolCall[] }) {
  if (toolCalls.length === 0) return null;

  return (
    <div className="space-y-2">
      {toolCalls.map((tc, i) => {
        const meta = TOOL_META[tc.toolName] || {
          label: tc.toolName,
          icon: Sparkles,
          description: "Processing...",
        };
        const Icon = meta.icon;
        const detail = getToolDetail(tc);

        return (
          <div
            key={`${tc.toolName}-${i}`}
            className="flex items-start gap-3 p-3 rounded-lg border border-primary/20 bg-primary/[0.03] animate-fade-in"
          >
            <div className="shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {meta.label}
                </span>
                <Loader2 className="h-3 w-3 text-primary animate-spin" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {meta.description}
                {detail && <span className="text-foreground/70">{detail}</span>}
              </p>
              <div className="mt-2 h-1 w-full rounded-full bg-primary/10 overflow-hidden">
                <div className="h-full bg-primary/40 rounded-full animate-progress" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getToolDetail(tc: ActiveToolCall): string {
  if (!tc.input) return "";
  switch (tc.toolName) {
    case "generate_liquid_page":
      return tc.input.title ? ` — "${tc.input.title}"` : "";
    case "search_products":
      return tc.input.query ? ` — "${tc.input.query}"` : "";
    case "get_products":
      return tc.input.product_type ? ` — type: ${tc.input.product_type}` : "";
    case "get_orders":
      return tc.input.status ? ` — ${tc.input.status}` : "";
    case "get_inventory":
      return tc.input.low_stock_threshold ? ` — threshold: ${tc.input.low_stock_threshold}` : "";
    default:
      return "";
  }
}

export const ChatMessage = memo(function ChatMessage({
  role,
  content,
  toolResults,
  isStreaming,
  activeToolCalls,
}: ChatMessageProps) {
  const isAssistant = role === "assistant";
  const hasActiveTools = activeToolCalls && activeToolCalls.length > 0;

  return (
    <div
      className={cn(
        "flex gap-3 py-4 animate-fade-in",
        isAssistant ? "pr-12" : "pl-12"
      )}
    >
      <div
        className={cn(
          "shrink-0 h-8 w-8 rounded-lg flex items-center justify-center",
          isAssistant
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {isAssistant ? "AI Agent" : "You"}
          </span>
          {isStreaming && !hasActiveTools && (
            <span className="flex items-center gap-1 text-[10px] text-primary">
              <Sparkles className="h-3 w-3 animate-pulse" />
              Thinking...
            </span>
          )}
        </div>

        {content && (
          <div
            className={cn(
              "text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none",
              "prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1",
              "prose-code:bg-muted prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-xs",
              "prose-pre:bg-muted prose-pre:rounded-lg prose-pre:p-3",
              "prose-table:border-collapse prose-table:w-full prose-table:text-xs prose-table:my-3",
              "prose-th:border prose-th:border-border prose-th:bg-muted/50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium prose-th:text-muted-foreground",
              "prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2"
            )}
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        {hasActiveTools && <ToolCallProgress toolCalls={activeToolCalls} />}

        {isStreaming && !content && !hasActiveTools && (
          <div className="flex gap-1 py-2">
            <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        {toolResults?.map((result, i) => renderToolResult(result, i))}
      </div>
    </div>
  );
});
