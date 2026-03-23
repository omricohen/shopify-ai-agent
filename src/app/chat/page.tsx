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
} from "lucide-react";

interface ToolResultData {
  type: string;
  data: any;
}

function extractToolResults(message: any): ToolResultData[] {
  const results: ToolResultData[] = [];
  if (!message.parts) return results;

  for (const part of message.parts) {
    if (part.type !== "tool-invocation") continue;
    if (part.state !== "result") continue;

    const result = part.result;
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
            },
          });
        }
        break;
    }
  }

  return results;
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
  { label: "📈 Revenue trend", prompt: "Show me the revenue trend over the last 30 days." },
];

export default function ChatPage() {
  const { credentials, clearCredentials, isConnected } = useStore();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [documentContent, setDocumentContent] = useState<ParsedDocument | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        storeUrl: credentials?.storeUrl,
        accessToken: credentials?.accessToken,
        documentContent: documentContent
          ? {
              type: documentContent.type,
              filename: documentContent.filename,
              content: documentContent.content,
              summary: documentContent.summary,
              columns: documentContent.columns,
              rowCount: documentContent.rowCount,
            }
          : undefined,
      },
    }),
  });

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
            {documentContent && (
              <Badge variant="info" className="gap-1 text-xs">
                <FileText className="h-3 w-3" />
                {documentContent.filename}
                <button
                  onClick={() => setDocumentContent(null)}
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
                onClick={() => chat.setMessages([])}
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
                  const textContent = getMessageText(message);
                  const isLastAssistant =
                    message.role === "assistant" &&
                    i === messages.length - 1 &&
                    isLoading;

                  return (
                    <ChatMessage
                      key={message.id}
                      role={message.role as "user" | "assistant"}
                      content={textContent}
                      toolResults={toolResults}
                      isStreaming={isLastAssistant}
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
