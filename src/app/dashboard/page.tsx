"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MetricsRow,
  SalesChart,
  ProductCard,
  InventoryAlert,
  OrdersTable,
} from "@/components/generative";
import {
  Sparkles,
  Store,
  MessageSquare,
  RefreshCw,
  LogOut,
  Loader2,
  FileCode2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

type DateRange = "7d" | "30d" | "90d";

interface DashboardData {
  shop: any;
  analytics: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueByDay: { date: string; revenue: number; orders: number }[];
    topProducts: { title: string; revenue: number; quantity: number }[];
  };
  products: any[];
  orders: any[];
  inventoryAlerts: any[];
}

export default function DashboardPage() {
  const { credentials, clearCredentials, isConnected } = useStore();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const fetchDashboard = useCallback(
    async (range: DateRange) => {
      if (!credentials) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeUrl: credentials.storeUrl,
            accessToken: credentials.accessToken,
            dateRange: range,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load dashboard");
        }
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [credentials]
  );

  useEffect(() => {
    if (isConnected) {
      fetchDashboard(dateRange);
    }
  }, [isConnected, dateRange, fetchDashboard]);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Dashboard</h1>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[10px] gap-1">
                  <Store className="h-2.5 w-2.5" />
                  {storeName}
                </Badge>
                {data?.shop?.name && (
                  <span className="text-xs text-muted-foreground">
                    {data.shop.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Date range selector */}
            <div className="flex rounded-md border overflow-hidden">
              {(["7d", "30d", "90d"] as DateRange[]).map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-none h-7 text-xs"
                  onClick={() => setDateRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-muted-foreground"
              onClick={() => fetchDashboard(dateRange)}
              disabled={loading}
            >
              <RefreshCw
                className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
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
              onClick={() => router.push("/pages")}
            >
              <FileCode2 className="h-3 w-3" />
              Pages
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

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && !data && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading dashboard...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-3">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDashboard(dateRange)}
              >
                Try again
              </Button>
            </div>
          </div>
        )}

        {data && !error && (
          <div className="space-y-6">
            {/* Metrics */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Key Metrics ({dateRange})
              </h2>
              <MetricsRow
                metrics={[
                  {
                    label: "Total Revenue",
                    value: data.analytics.totalRevenue,
                    format: "currency",
                    icon: "revenue",
                  },
                  {
                    label: "Total Orders",
                    value: data.analytics.totalOrders,
                    format: "number",
                    icon: "orders",
                  },
                  {
                    label: "Avg Order Value",
                    value: data.analytics.averageOrderValue,
                    format: "currency",
                    icon: "aov",
                  },
                ]}
              />
            </section>

            {/* Revenue chart */}
            {data.analytics.revenueByDay.length > 0 && (
              <section>
                <SalesChart
                  data={data.analytics.revenueByDay}
                  title={`Revenue Trend (${dateRange})`}
                  type="area"
                />
              </section>
            )}

            {/* Two-column layout: Products + Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              {data.products.length > 0 && (
                <section>
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Top Products
                  </h2>
                  <ProductCard products={data.products} />
                </section>
              )}

              {/* Inventory Alerts */}
              <section>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Inventory Alerts
                </h2>
                <InventoryAlert
                  items={data.inventoryAlerts}
                  title="Low Stock Items"
                />
              </section>
            </div>

            {/* Recent Orders */}
            {data.orders.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Recent Orders
                </h2>
                <OrdersTable orders={data.orders} />
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
