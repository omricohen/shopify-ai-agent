"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  BarChart3,
} from "lucide-react";

interface Metric {
  label: string;
  value: number;
  format?: "currency" | "number" | "percent";
  change?: number;
  icon?: string;
}

interface MetricsRowProps {
  metrics: Metric[];
}

const iconMap: Record<string, React.ReactNode> = {
  revenue: <DollarSign className="h-4 w-4" />,
  orders: <ShoppingCart className="h-4 w-4" />,
  aov: <TrendingUp className="h-4 w-4" />,
  customers: <Users className="h-4 w-4" />,
  products: <Package className="h-4 w-4" />,
  default: <BarChart3 className="h-4 w-4" />,
};

function formatMetricValue(value: number, format?: string): string {
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    default:
      return formatNumber(value);
  }
}

export function MetricsRow({ metrics }: MetricsRowProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4 animate-fade-in">
      {metrics.map((metric, i) => (
        <Card
          key={i}
          className="overflow-hidden hover:border-primary/30 transition-all duration-300"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {metric.label}
              </span>
              <div className="text-primary">
                {iconMap[metric.icon || "default"] || iconMap.default}
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {formatMetricValue(metric.value, metric.format)}
            </div>
            {metric.change !== undefined && (
              <div
                className={`text-xs mt-1 flex items-center gap-1 ${
                  metric.change >= 0 ? "text-emerald-500" : "text-red-500"
                }`}
              >
                <TrendingUp
                  className={`h-3 w-3 ${
                    metric.change < 0 ? "rotate-180" : ""
                  }`}
                />
                {Math.abs(metric.change).toFixed(1)}% from previous period
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
