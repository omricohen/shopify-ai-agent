"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Send,
  Paperclip,
  X,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() && files.length === 0) return;
      if (isLoading) return;

      onSend(input.trim(), files.length > 0 ? files : undefined);
      setInput("");
      setFiles([]);
    },
    [input, files, isLoading, onSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFiles = Array.from(e.target.files || []);
      setFiles((prev) => [...prev, ...newFiles]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Auto-resize textarea
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    },
    []
  );

  return (
    <div className="border-t bg-background/95 backdrop-blur-sm p-4">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-xs animate-fade-in"
            >
              <FileText className="h-3 w-3 text-primary" />
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => removeFile(i)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your store..."
            rows={1}
            disabled={disabled}
            className={cn(
              "w-full resize-none rounded-lg border bg-muted/50 px-4 py-2.5 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200 min-h-[42px] max-h-[200px]"
            )}
          />
        </div>

        <Button
          type="submit"
          size="icon"
          className={cn(
            "shrink-0 h-10 w-10 rounded-lg transition-all duration-200",
            input.trim() || files.length > 0
              ? "bg-primary hover:bg-primary/90 shadow-md"
              : "bg-muted text-muted-foreground"
          )}
          disabled={isLoading || disabled || (!input.trim() && files.length === 0)}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>
          Try: &quot;Show me top-selling products&quot; · &quot;Revenue this month&quot; · &quot;Low inventory items&quot;
        </span>
      </div>
    </div>
  );
}
