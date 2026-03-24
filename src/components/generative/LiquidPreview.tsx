"use client";

import { useState } from "react";
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

export function LiquidPreview({ code, title, pageType, onSave, isSaved }: LiquidPreviewProps) {
  const [view, setView] = useState<"code" | "preview">("code");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Create a sanitized preview by stripping Liquid tags
  const previewHtml = code
    .replace(/\{%[\s\S]*?%\}/g, "")
    .replace(/\{\{[\s\S]*?\}\}/g, "[dynamic content]")
    .replace(/<style>[\s\S]*?<\/style>/g, "");

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
          <div className="p-4 bg-white dark:bg-zinc-900 min-h-[200px] max-h-[500px] overflow-y-auto">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
