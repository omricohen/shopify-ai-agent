"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ShopifyProduct } from "@/types/shopify";
import {
  Package,
  Tag,
  TrendingDown,
} from "lucide-react";

interface ProductCardProps {
  products: ShopifyProduct[];
}

export function ProductCard({ products }: ProductCardProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-muted-foreground text-sm p-4">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4 animate-fade-in">
      {products.map((product, i) => {
        const mainVariant = product.variants?.[0];
        const price = mainVariant ? parseFloat(mainVariant.price) : 0;
        const comparePrice = mainVariant?.compare_at_price
          ? parseFloat(mainVariant.compare_at_price)
          : null;
        const totalInventory = product.variants?.reduce(
          (sum, v) => sum + (v.inventory_quantity || 0),
          0
        ) || 0;
        const isLowStock = totalInventory < 10 && totalInventory > 0;
        const isOutOfStock = totalInventory === 0;
        const image = product.images?.[0];

        return (
          <Card
            key={product.id}
            className="overflow-hidden hover:border-primary/50 transition-all duration-300 group"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {image && (
              <div className="relative h-48 overflow-hidden bg-muted">
                <img
                  src={image.src}
                  alt={image.alt || product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {comparePrice && comparePrice > price && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-2"
                  >
                    -{Math.round(((comparePrice - price) / comparePrice) * 100)}%
                  </Badge>
                )}
              </div>
            )}
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                  {product.title}
                </h3>
                <Badge
                  variant={
                    product.status === "active"
                      ? "success"
                      : product.status === "draft"
                      ? "warning"
                      : "secondary"
                  }
                  className="shrink-0 text-[10px]"
                >
                  {product.status}
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(price)}
                </span>
                {comparePrice && comparePrice > price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(comparePrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span
                    className={
                      isOutOfStock
                        ? "text-red-500 font-medium"
                        : isLowStock
                        ? "text-amber-500 font-medium"
                        : ""
                    }
                  >
                    {isOutOfStock
                      ? "Out of stock"
                      : `${totalInventory} in stock`}
                  </span>
                  {isLowStock && (
                    <TrendingDown className="h-3 w-3 text-amber-500" />
                  )}
                </div>
                {product.variants?.length > 1 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    <span>{product.variants.length} variants</span>
                  </div>
                )}
              </div>

              {product.vendor && (
                <div className="text-xs text-muted-foreground">
                  by {product.vendor}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
