"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@/lib/store-context";
import {
  Store,
  Key,
  ArrowRight,
  Sparkles,
  BarChart3,
  ShoppingCart,
  FileCode2,
  Zap,
  Shield,
  Bot,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function ConnectPage() {
  const [storeUrl, setStoreUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const { setCredentials } = useStore();
  const router = useRouter();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsConnecting(true);

    try {
      // Validate through our server-side API to avoid CORS
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeUrl, accessToken }),
      });

      const result = await response.json();
      if (!response.ok || !result.valid) {
        throw new Error(result.error || "Invalid credentials. Please check your store URL and access token.");
      }

      setCredentials({ storeUrl: result.storeUrl, accessToken });
      router.push("/chat");
    } catch (err: any) {
      setError(err.message || "Failed to connect. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const features = [
    {
      icon: <Bot className="h-5 w-5" />,
      title: "AI-Powered Chat",
      description: "Natural language queries for your store data",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Visual Analytics",
      description: "Auto-generated charts, metrics, and insights",
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      title: "Smart Inventory",
      description: "Low stock alerts and inventory management",
    },
    {
      icon: <FileCode2 className="h-5 w-5" />,
      title: "Liquid Generator",
      description: "AI-generated Shopify page templates",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Real-time Streaming",
      description: "Instant responses with generative UI",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Secure & Private",
      description: "Credentials stored locally, never on servers",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-chart-4/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b bg-background/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">Shopify AI Command Center</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                Powered by Claude AI
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
                Your Shopify store,{" "}
                <span className="gradient-text">supercharged with AI</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Ask questions in plain English. Get instant analytics, product
                insights, inventory alerts, and generated Liquid pages — all
                through an intelligent AI agent.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="text-primary mt-0.5">{feature.icon}</div>
                  <div>
                    <div className="text-sm font-medium">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Connect form */}
          <Card className="border-2 shadow-2xl shadow-primary/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Connect Your Store</CardTitle>
              <CardDescription>
                Enter your Shopify store URL and Admin API access token to get
                started. Your credentials are stored locally and never sent to
                third-party servers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    Store URL
                  </label>
                  <Input
                    placeholder="your-store.myshopify.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    Admin API Access Token
                  </label>
                  <Input
                    type="password"
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxxx"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    required
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Create a custom app in your Shopify admin → Settings → Apps
                    → Develop apps
                  </p>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 animate-fade-in">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-semibold gap-2 group"
                  disabled={isConnecting || !storeUrl || !accessToken}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Launch Command Center
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Need a test store?{" "}
                  <a
                    href="https://partners.shopify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Create a Shopify Partners dev store
                    <ChevronRight className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Shopify AI Command Center</span>
          <span>Built with Next.js, Vercel AI SDK & Claude</span>
        </div>
      </footer>
    </div>
  );
}
