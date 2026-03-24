"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Eye, Copy, Check, Save } from "lucide-react";

interface LiquidPreviewProps {
  code: string;
  title: string;
  pageType: string;
  onSave?: () => void;
  isSaved?: boolean;
}

function extractSchemaDefaults(code: string): Record<string, string> {
  const defaults: Record<string, string> = {};
  const schemaMatch = code.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (!schemaMatch) return defaults;

  try {
    const schema = JSON.parse(schemaMatch[1]);
    if (schema.settings) {
      for (const setting of schema.settings) {
        if (setting.id && setting.default !== undefined) {
          defaults[setting.id] = String(setting.default);
        }
      }
    }
  } catch {
    // Schema parse failed, return empty defaults
  }
  return defaults;
}

function buildPreviewHtml(code: string): string {
  // Extract schema defaults before stripping
  const defaults = extractSchemaDefaults(code);
  const sectionId = "preview-1";

  let html = code
    // Remove Liquid comment blocks
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "")
    // Remove Liquid schema blocks (not visible HTML)
    .replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g, "")
    // Replace section.id with a stable preview ID
    .replace(/\{\{\s*section\.id\s*\}\}/g, sectionId)
    // Replace section.settings.X with schema defaults
    .replace(/\{\{\s*section\.settings\.(\w+)\s*\}\}/g, (_match, key) => {
      return defaults[key] ?? "";
    })
    // Handle section.settings with filters (e.g., | escape, | image_url)
    .replace(/\{\{\s*section\.settings\.(\w+)\s*\|[^}]*\}\}/g, (_match, key) => {
      return defaults[key] ?? "";
    })
    // Remove for/if/unless control flow but keep inner content
    .replace(/\{%-?\s*(?:for|if|unless|elsif|else|endif|endfor|endunless|case|when|endcase|capture|endcapture|assign|increment|decrement|paginate|endpaginate|layout|section|render|include|liquid|break|continue|cycle|tablerow|endtablerow|raw|endraw|style|endstyle)\b[\s\S]*?-?%\}/g, "")
    // Remove any remaining {% %} tags
    .replace(/\{%[\s\S]*?%\}/g, "")
    // Variables with | default: "value" — extract and use the default value
    .replace(/\{\{[^}]*\|\s*default:\s*"([^"]*)"\s*\}\}/g, "$1")
    .replace(/\{\{[^}]*\|\s*default:\s*'([^']*)'\s*\}\}/g, "$1")
    // Money filter: {{ 7800 | money }} -> $78.00
    .replace(/\{\{\s*(\d+)\s*\|\s*money\s*\}\}/g, (_m, cents) => {
      return `$${(parseInt(cents) / 100).toFixed(2)}`;
    })
    // Product image URLs with image_url filter
    .replace(/\{\{\s*product\.featured_image\s*\|[^}]*\}\}/g, "https://placehold.co/400x400/e2e8f0/64748b?text=Product")
    .replace(/\{\{\s*product\.featured_image\.alt[^}]*\}\}/g, "Product image")
    // Product fields
    .replace(/\{\{\s*product\.title\s*\}\}/g, "Sample Product")
    .replace(/\{\{\s*product\.price\s*\|[^}]*\}\}/g, "$29.99")
    .replace(/\{\{\s*product\.compare_at_price\s*\|[^}]*\}\}/g, "$49.99")
    .replace(/\{\{\s*product\.description\s*\}\}/g, "A wonderful product for your store.")
    .replace(/\{\{\s*product\.url\s*\}\}/g, "#")
    // Routes
    .replace(/\{\{\s*routes\.\w+\s*\}\}/g, "#")
    // Placeholder SVG tags
    .replace(/\{\{\s*'[^']*'\s*\|\s*placeholder_svg_tag[^}]*\}\}/g,
      '<div style="width:100%;aspect-ratio:1;background:#e2e8f0;display:grid;place-items:center;color:#94a3b8;font-size:14px;">Product Image</div>')
    // Shop fields
    .replace(/\{\{\s*shop\.email\s*\}\}/g, "hello@example.com")
    .replace(/\{\{\s*shop\.name\s*\}\}/g, "My Store")
    .replace(/\{\{\s*shop\.address1?\s*\}\}/g, "123 Main Street")
    .replace(/\{\{\s*shop\.city\s*\}\}/g, "New York")
    .replace(/\{\{\s*shop\.province\s*\}\}/g, "NY")
    .replace(/\{\{\s*shop\.zip\s*\}\}/g, "10001")
    // Any remaining {{ ... }} — show empty string
    .replace(/\{\{[^}]*\}\}/g, "");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    img { max-width: 100%; height: auto; }
    a { color: inherit; text-decoration: none; }
    svg { max-width: 100%; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

export function LiquidPreview({ code, title, pageType, onSave, isSaved }: LiquidPreviewProps) {
  const [view, setView] = useState<"code" | "preview">("code");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewHtml = useMemo(() => buildPreviewHtml(code), [code]);

  return (
    <Card className="my-4 animate-fade-in overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            {title}
            <Badge variant="info" className="text-[10px]">
              {pageType}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border overflow-hidden">
              <Button
                variant={view === "code" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none h-7 text-xs"
                onClick={() => setView("code")}
              >
                <Code2 className="h-3 w-3 mr-1" />
                Code
              </Button>
              <Button
                variant={view === "preview" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none h-7 text-xs"
                onClick={() => setView("preview")}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={onSave}
                disabled={isSaved}
              >
                {isSaved ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                {isSaved ? "Saved" : "Save"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {view === "code" ? (
          <div className="relative">
            <pre className="p-4 bg-muted/50 overflow-x-auto text-xs leading-relaxed max-h-[500px] overflow-y-auto">
              <code className="text-foreground">{code}</code>
            </pre>
          </div>
        ) : (
          <div className="bg-white rounded-b-lg overflow-hidden">
            <iframe
              srcDoc={previewHtml}
              sandbox="allow-same-origin"
              className="w-full border-0"
              style={{ height: "500px" }}
              title={`Preview of ${title}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
