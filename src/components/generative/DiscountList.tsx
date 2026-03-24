"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Tag, Percent, Hash, Calendar } from "lucide-react";

interface DiscountItem {
  code: string;
  value_type: "fixed_amount" | "percentage";
  value: string;
  title: string;
  usage_count: number;
  usage_limit: number | null;
  starts_at: string;
  ends_at: string | null;
  times_used: number;
}

interface DiscountListProps {
  discounts: DiscountItem[];
}

function formatValue(type: string, value: string): string {
  const num = Math.abs(parseFloat(value));
  return type === "percentage" ? `${num}%` : `$${num.toFixed(2)}`;
}

function getStatus(item: DiscountItem): { label: string; variant: "success" | "warning" | "secondary" } {
  const now = new Date();
  const start = new Date(item.starts_at);
  if (start > now) return { label: "Scheduled", variant: "warning" };
  if (item.ends_at && new Date(item.ends_at) < now)
    return { label: "Expired", variant: "secondary" };
  if (item.usage_limit && item.usage_count >= item.usage_limit)
    return { label: "Used up", variant: "secondary" };
  return { label: "Active", variant: "success" };
}

export function DiscountList({ discounts }: DiscountListProps) {
  if (!discounts || discounts.length === 0) {
    return (
      <div className="text-muted-foreground text-sm p-4">
        No discount codes found.
      </div>
    );
  }

  return (
    <Card className="my-4 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          Discount Codes ({discounts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {discounts.map((discount, i) => {
          const status = getStatus(discount);
          return (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {discount.value_type === "percentage" ? (
                    <Percent className="h-4 w-4" />
                  ) : (
                    <Tag className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold bg-muted px-1.5 py-0.5 rounded">
                      {discount.code}
                    </code>
                    <Badge variant={status.variant} className="text-[10px]">
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="font-medium text-foreground">
                      {formatValue(discount.value_type, discount.value)} off
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {discount.usage_count}
                      {discount.usage_limit
                        ? `/${discount.usage_limit}`
                        : ""}{" "}
                      used
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(discount.starts_at)}
                      {discount.ends_at
                        ? ` – ${formatDate(discount.ends_at)}`
                        : "+"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
