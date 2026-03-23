"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShopifyOrder } from "@/types/shopify";
import { ShoppingCart, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface OrdersTableProps {
  orders: ShopifyOrder[];
}

const statusConfig: Record<string, { variant: "success" | "warning" | "info" | "destructive" | "secondary"; icon: React.ReactNode }> = {
  paid: { variant: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
  pending: { variant: "warning", icon: <Clock className="h-3 w-3" /> },
  authorized: { variant: "info", icon: <AlertCircle className="h-3 w-3" /> },
  refunded: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  partially_refunded: { variant: "warning", icon: <AlertCircle className="h-3 w-3" /> },
  voided: { variant: "secondary", icon: <XCircle className="h-3 w-3" /> },
};

const fulfillmentConfig: Record<string, { variant: "success" | "warning" | "info" | "secondary" }> = {
  fulfilled: { variant: "success" },
  partial: { variant: "warning" },
  unfulfilled: { variant: "info" },
  null: { variant: "secondary" },
};

export function OrdersTable({ orders }: OrdersTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-muted-foreground text-sm p-4">No orders found.</div>
    );
  }

  return (
    <Card className="my-4 animate-fade-in overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          Orders ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Order</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Fulfillment</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => {
                const status = statusConfig[order.financial_status] || statusConfig.pending;
                const fulfillment = fulfillmentConfig[order.fulfillment_status || "null"] || fulfillmentConfig.null;

                return (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="p-3">
                      <span className="font-medium text-primary">
                        {order.name}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="p-3">
                      <div>
                        {order.customer
                          ? `${order.customer.first_name} ${order.customer.last_name}`
                          : order.email || "Guest"}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={status.variant} className="gap-1">
                        {status.icon}
                        {order.financial_status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={fulfillment.variant}>
                        {order.fulfillment_status || "unfulfilled"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(parseFloat(order.total_price), order.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
