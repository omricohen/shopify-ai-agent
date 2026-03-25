"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useStore } from "@/lib/store-context";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { parseDocument, ParsedDocument } from "@/lib/document-parser";
import {
  Sparkles,
  Store,
  LogOut,
  MessageSquare,
  Trash2,
  FileText,
  X,
  LayoutDashboard,
  FileCode2,
} from "lucide-react";

interface ToolResultData {
  type: string;
  data: any;
}

interface ActiveToolCall {
  toolName: string;
  state: string;
  input?: any;
}

function extractActiveToolCalls(message: any): ActiveToolCall[] {
  const active: ActiveToolCall[] = [];
  if (!message.parts) return active;

  for (const part of message.parts) {
    // AI SDK v6 uses type "tool-<toolname>" for tool parts
    if (!part.type?.startsWith("tool-")) continue;
    // Only show tools that are still in progress (not completed or errored)
    if (part.state === "output-available" || part.state === "output-error") continue;

    // Extract tool name from the type string: "tool-generate_liquid_page" -> "generate_liquid_page"
    const toolName = part.type.replace(/^tool-/, "");
    active.push({
      toolName,
      state: part.state || "call",
      input: part.input,
    });
  }
  return active;
}

function extractToolResults(message: any): ToolResultData[] {
  const results: ToolResultData[] = [];
  if (!message.parts) return results;

  for (const part of message.parts) {
    if (!part.type?.startsWith("tool-")) continue;
    if (part.state !== "output-available") continue;

    const result = part.output;
    if (!result?.success) continue;

    switch (result.type) {
      case "products":
        results.push({ type: "products", data: result.data });
        break;
      case "orders":
        results.push({ type: "orders", data: result.data });
        break;
      case "customers":
        results.push({ type: "customers", data: result.data });
        break;
      case "inventory":
        results.push({ type: "inventory", data: result.data });
        break;
      case "analytics":
        if (result.metrics) {
          results.push({ type: "metrics", data: result.metrics });
        }
        if (result.chart) {
          results.push({ type: "analytics_chart", data: result.chart });
        }
        break;
      case "liquid":
        if (result.data) {
          results.push({
            type: "liquid",
            data: {
              code: result.data.code || result.data.description || "<!-- Liquid template -->",
              title: result.data.title,
              pageType: result.data.pageType,
              description: result.data.description,
              style: result.data.style,
            },
          });
        }
        break;
      case "shop_info":
        results.push({ type: "shop_info", data: result.data });
        break;
      case "discounts":
        results.push({ type: "discounts", data: result.data });
        break;
      case "draft_orders":
        results.push({ type: "draft_orders", data: result.data });
        break;
      case "abandoned_checkouts":
        results.push({ type: "abandoned_checkouts", data: result.data });
        break;
    }
  }

  return results;
}

function extractSuggestions(text: string): { cleanText: string; suggestions: string[] } {
  const match = text.match(/<!--suggestions:\[(.+?)\]-->/);
  if (!match) return { cleanText: text, suggestions: [] };

  try {
    const suggestions = JSON.parse(`[${match[1]}]`) as string[];
    const cleanText = text.replace(match[0], "").trimEnd();
    return { cleanText, suggestions };
  } catch {
    return { cleanText: text, suggestions: [] };
  }
}

function getMessageText(message: any): string {
  if (!message.parts) return message.content || "";
  return message.parts
    .filter((p: any) => p.type === "text")
    .map((p: any) => p.text)
    .join("");
}

const quickActions = [
  { label: "📊 Store overview", prompt: "Give me an overview of my store — key metrics, top products, and any issues I should know about." },
  { label: "📦 Low inventory", prompt: "Show me products that are running low on inventory." },
  { label: "🛒 Recent orders", prompt: "Show me the most recent orders." },
  { label: "🏷️ All products", prompt: "Show me all my products with their current status and pricing." },
  { label: "👥 Top customers", prompt: "Who are my top customers by total spend?" },
  { label: "🎨 Generate a page", prompt: "Generate a modern landing page for my store with a hero section, featured products, and a call-to-action." },
];

export default function ChatPage() {
  const { credentials, clearCredentials, isConnected } = useStore();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [documentContent, setDocumentContent] = useState<ParsedDocument | null>(null);
  const documentRef = useRef<ParsedDocument | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          storeUrl: credentials?.storeUrl,
          accessToken: credentials?.accessToken,
          documentContent: documentRef.current
            ? {
                type: documentRef.current.type,
                filename: documentRef.current.filename,
                content: documentRef.current.content,
                summary: documentRef.current.summary,
                columns: documentRef.current.columns,
                rowCount: documentRef.current.rowCount,
                columnAnalysis: documentRef.current.columnAnalysis,
                insights: documentRef.current.insights,
              }
            : undefined,
        }),
      })
  );

  const chat = useChat({
    transport,
    onFinish: () => {
      // Persist messages to localStorage after each completed exchange
      try {
        const msgs = chat.messages;
        if (msgs.length > 0) {
          localStorage.setItem("shopify_chat_messages", JSON.stringify(msgs));
        }
      } catch {
        // localStorage may be full or unavailable
      }
    },
  });

  // Restore persisted messages on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shopify_chat_messages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          chat.setMessages(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messages = chat.messages;
  const status = chat.status;
  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(
    async (message: string, files?: File[]) => {
      if (files && files.length > 0) {
        try {
          const file = files[0];
          const parsed = await parseDocument(file, file.name);
          documentRef.current = parsed;
          setDocumentContent(parsed);

          const fileInfo = `\n\n[Uploaded file: ${file.name} — ${parsed.summary}]`;
          chat.sendMessage({ text: message + fileInfo });
        } catch (_error) {
          chat.sendMessage({ text: message + "\n\n[File upload failed]" });
        }
      } else {
        chat.sendMessage({ text: message });
      }
    },
    [chat]
  );

  const handleDisconnect = () => {
    clearCredentials();
    router.push("/");
  };

  if (!isConnected) return null;

  const storeName = credentials?.storeUrl
    ?.replace(/^https?:\/\//, "")
    ?.replace(/\.myshopify\.com$/, "")
    ?.replace(/\/$/, "");

  // Extract suggestions from the last assistant message
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
  const lastAssistantText = lastAssistantMsg ? getMessageText(lastAssistantMsg) : "";
  const { suggestions } = !isLoading ? extractSuggestions(lastAssistantText) : { suggestions: [] };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm shrink-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">AI Command Center</h1>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[10px] gap-1">
                  <Store className="h-2.5 w-2.5" />
                  {storeName}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-muted-foreground"
              onClick={() => router.push("/dashboard")}
            >
              <LayoutDashboard className="h-3 w-3" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-muted-foreground"
              onClick={() => router.push("/pages")}
            >
              <FileCode2 className="h-3 w-3" />
              Pages
            </Button>
            {documentContent && (
              <Badge variant="info" className="gap-1 text-xs">
                <FileText className="h-3 w-3" />
                {documentContent.filename}
                <button
                  onClick={() => { documentRef.current = null; setDocumentContent(null); }}
                  className="ml-1 hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1 text-muted-foreground"
                onClick={() => { chat.setMessages([]); localStorage.removeItem("shopify_chat_messages"); }}
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            )}
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-muted-foreground"
              onClick={handleDisconnect}
            >
              <LogOut className="h-3 w-3" />
              Disconnect
            </Button>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 py-12">
                <div className="space-y-3">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">
                    What would you like to know?
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Ask anything about your store — products, orders, customers,
                    inventory, or analytics. I can also parse uploaded documents
                    and generate Liquid pages.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl w-full">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(action.prompt)}
                      className="text-left p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/30 transition-all duration-200 text-sm group"
                    >
                      <span className="group-hover:text-primary transition-colors">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-1">
                {messages.map((message, i) => {
                  const toolResults = extractToolResults(message);
                  const rawText = getMessageText(message);
                  const { cleanText } = extractSuggestions(rawText);
                  const isLastAssistant =
                    message.role === "assistant" &&
                    i === messages.length - 1 &&
                    isLoading;
                  const activeTools = isLastAssistant
                    ? extractActiveToolCalls(message)
                    : [];

                  return (
                    <ChatMessage
                      key={message.id}
                      role={message.role as "user" | "assistant"}
                      content={cleanText}
                      toolResults={toolResults}
                      isStreaming={isLastAssistant}
                      activeToolCalls={activeTools}
                    />
                  );
                })}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <ChatMessage
                    role="assistant"
                    content=""
                    isStreaming={true}
                  />
                )}

                {/* Suggestion chips */}
                {suggestions.length > 0 && !isLoading && (
                  <div className="flex flex-wrap gap-2 pl-11 pt-2 pb-4 animate-fade-in">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s)}
                        className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-accent hover:border-primary/30 transition-all duration-200 text-muted-foreground hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="max-w-4xl mx-auto w-full">
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          disabled={!isConnected}
        />
      </div>
    </div>
  );
}
