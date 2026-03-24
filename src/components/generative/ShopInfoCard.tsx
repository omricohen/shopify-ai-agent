"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShopifyShopInfo } from "@/types/shopify";
import {
  Store,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ShopInfoCardProps {
  shop: ShopifyShopInfo;
}

export function ShopInfoCard({ shop }: ShopInfoCardProps) {
  if (!shop) return null;

  const details = [
    { icon: Globe, label: "Domain", value: shop.domain },
    { icon: Mail, label: "Email", value: shop.email },
    { icon: Phone, label: "Phone", value: shop.phone || "Not set" },
    {
      icon: MapPin,
      label: "Location",
      value: [shop.city, shop.province, shop.country_name]
        .filter(Boolean)
        .join(", "),
    },
    { icon: DollarSign, label: "Currency", value: shop.currency },
    { icon: Clock, label: "Timezone", value: shop.iana_timezone || shop.timezone },
    {
      icon: Calendar,
      label: "Created",
      value: shop.created_at ? formatDate(shop.created_at) : "Unknown",
    },
  ];

  return (
    <Card className="my-4 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            {shop.name}
          </CardTitle>
          <Badge variant="info" className="text-[10px]">
            {shop.plan_display_name || shop.plan_name}
          </Badge>
        </div>
        {shop.shop_owner && (
          <p className="text-xs text-muted-foreground">
            Owner: {shop.shop_owner}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {details.map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 rounded-md bg-muted/30"
            >
              <d.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  {d.label}
                </span>
                <span className="text-sm font-medium truncate block">
                  {d.value || "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
