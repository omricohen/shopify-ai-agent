"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ShopifyCustomer } from "@/types/shopify";
import { Users, Mail, ShoppingBag, MapPin } from "lucide-react";

interface CustomerListProps {
  customers: ShopifyCustomer[];
}

export function CustomerList({ customers }: CustomerListProps) {
  if (!customers || customers.length === 0) {
    return (
      <div className="text-muted-foreground text-sm p-4">
        No customers found.
      </div>
    );
  }

  return (
    <Card className="my-4 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Customers ({customers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {customers.map((customer, i) => (
          <div
            key={customer.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
              {customer.first_name?.[0]}
              {customer.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {customer.first_name} {customer.last_name}
                </span>
                {customer.orders_count > 10 && (
                  <Badge variant="success" className="text-[10px]">
                    VIP
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </span>
                )}
                {customer.default_address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {customer.default_address.city},{" "}
                    {customer.default_address.country}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-sm font-medium">
                <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                {customer.orders_count} orders
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(parseFloat(customer.total_spent))} total
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
