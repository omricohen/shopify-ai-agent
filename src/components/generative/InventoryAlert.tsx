"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, XCircle } from "lucide-react";

interface InventoryItem {
  title: string;
  variant?: string;
  sku?: string;
  quantity: number;
  threshold?: number;
}

interface InventoryAlertProps {
  items: InventoryItem[];
  title?: string;
}

export function InventoryAlert({
  items,
  title = "Inventory Alerts",
}: InventoryAlertProps) {
  if (!items || items.length === 0) {
    return (
      <Card className="my-4 animate-fade-in border-emerald-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Package className="h-5 w-5 text-emerald-500" />
          <span className="text-sm">All inventory levels look healthy! 🎉</span>
        </CardContent>
      </Card>
    );
  }

  const outOfStock = items.filter((item) => item.quantity === 0);
  const lowStock = items.filter((item) => item.quantity > 0);

  return (
    <Card className="my-4 animate-fade-in border-amber-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {title}
          <Badge variant="warning">{items.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {outOfStock.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-red-500 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Out of Stock ({outOfStock.length})
            </h4>
            {outOfStock.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-md bg-red-500/5 border border-red-500/10"
              >
                <div>
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.variant && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({item.variant})
                    </span>
                  )}
                </div>
                <Badge variant="destructive">0 units</Badge>
              </div>
            ))}
          </div>
        )}
        {lowStock.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-amber-500 uppercase tracking-wider flex items-center gap-1 mt-3">
              <AlertTriangle className="h-3 w-3" />
              Low Stock ({lowStock.length})
            </h4>
            {lowStock.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-md bg-amber-500/5 border border-amber-500/10"
              >
                <div>
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.variant && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({item.variant})
                    </span>
                  )}
                </div>
                <Badge variant="warning">{item.quantity} units</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
