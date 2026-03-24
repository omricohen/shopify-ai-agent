"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store-context";
import { usePages, SavedLiquidPage } from "@/lib/pages-context";
import { LiquidPreview } from "@/components/generative/LiquidPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Store,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  FileCode2,
  Trash2,
  X,
} from "lucide-react";

export default function PagesPage() {
  const { credentials, clearCredentials, isConnected } = useStore();
  const { pages, deletePage } = usePages();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const handleDisconnect = () => {
    clearCredentials();
    router.push("/");
  };

  if (!isConnected) return null;

  const storeName = credentials?.storeUrl
    ?.replace(/^https?:\/\//, "")
    ?.replace(/\.myshopify\.com$/, "")
    ?.replace(/\/$/, "");

  const expandedPage = pages.find((p) => p.id === expandedId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Saved Pages</h1>
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
              onClick={() => router.push("/chat")}
            >
              <MessageSquare className="h-3 w-3" />
              Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-muted-foreground"
              onClick={() => router.push("/dashboard")}
            >
              <LayoutDashboard className="h-3 w-3" />
              Dashboard
            </Button>
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

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Expanded page view */}
        {expandedPage && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Viewing: {expandedPage.title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1 text-muted-foreground"
                onClick={() => setExpandedId(null)}
              >
                <X className="h-3 w-3" />
                Close
              </Button>
            </div>
            <LiquidPreview
              code={expandedPage.code}
              title={expandedPage.title}
              pageType={expandedPage.pageType}
            />
          </div>
        )}

        {/* Empty state */}
        {pages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileCode2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">No saved pages yet</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Ask the AI to generate a Liquid page in chat, then click Save to
                add it here.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/chat")}
            >
              <MessageSquare className="h-3 w-3 mr-2" />
              Go to Chat
            </Button>
          </div>
        )}

        {/* Pages grid */}
        {pages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page) => (
              <Card
                key={page.id}
                className={`cursor-pointer hover:border-primary/30 transition-all duration-200 ${
                  expandedId === page.id ? "border-primary" : ""
                }`}
                onClick={() =>
                  setExpandedId(expandedId === page.id ? null : page.id)
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium leading-tight">
                      {page.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (expandedId === page.id) setExpandedId(null);
                        deletePage(page.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info" className="text-[10px]">
                      {page.pageType}
                    </Badge>
                    {page.style && (
                      <Badge variant="secondary" className="text-[10px]">
                        {page.style}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <pre className="text-[10px] text-muted-foreground bg-muted/50 rounded p-2 overflow-hidden max-h-[80px] leading-relaxed">
                    <code>{page.code.slice(0, 200)}...</code>
                  </pre>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {new Date(page.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
