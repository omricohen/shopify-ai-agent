"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingCart, AlertTriangle, DollarSign, ExternalLink } from "lucide-react";

interface AbandonedCheckout {
  id: string;
  email: string;
  created_at: string;
  completed_at: string | null;
  total_price: string;
  currency: string;
  line_items: { title: string; quantity: number; price: string }[];
  recovery_url: string;
}

interface AbandonedCheckoutsProps {
  checkouts: AbandonedCheckout[];
}

export function AbandonedCheckouts({ checkouts }: AbandonedCheckoutsProps) {
  if (!checkouts || checkouts.length === 0) {
    return (
      <Card className="my-4 animate-fade-in border-emerald-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <ShoppingCart className="h-5 w-5 text-emerald-500" />
          <span className="text-sm">No abandoned checkouts found.</span>
        </CardContent>
      </Card>
    );
  }

  const totalLost = checkouts.reduce(
    (sum, c) => sum + parseFloat(c.total_price),
    0
  );
  const currency = checkouts[0]?.currency || "USD";

  return (
    <Card className="my-4 animate-fade-in border-amber-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Abandoned Checkouts ({checkouts.length})
          </CardTitle>
          <Badge variant="warning" className="gap-1">
            <DollarSign className="h-3 w-3" />
            {formatCurrency(totalLost, currency)} at risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {checkouts.map((checkout, i) => {
          const isRecovered = !!checkout.completed_at;
          const itemSummary = checkout.line_items
            .map((li) => `${li.title} x${li.quantity}`)
            .join(", ");

          return (
            <div
              key={checkout.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {checkout.email || "Guest"}
                  </span>
                  <Badge
                    variant={isRecovered ? "success" : "warning"}
                    className="text-[10px] shrink-0"
                  >
                    {isRecovered ? "Recovered" : "Abandoned"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {itemSummary || "No items"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(checkout.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-sm font-semibold">
                  {formatCurrency(parseFloat(checkout.total_price), currency)}
                </span>
                {checkout.recovery_url && !isRecovered && (
                  <a
                    href={checkout.recovery_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="Recovery link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
