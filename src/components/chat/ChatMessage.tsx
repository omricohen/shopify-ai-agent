"use client";

import { memo, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Bot, User, Sparkles } from "lucide-react";
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

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResult[];
  isStreaming?: boolean;
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

export const ChatMessage = memo(function ChatMessage({
  role,
  content,
  toolResults,
  isStreaming,
}: ChatMessageProps) {
  const isAssistant = role === "assistant";

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
          {isStreaming && (
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

        {isStreaming && !content && (
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
