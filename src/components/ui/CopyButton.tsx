"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/cn";

export function CopyButton({
  value,
  label = "Copy",
  toastMessage,
  className,
}: {
  value: string;
  label?: string;
  toastMessage?: string;
  className?: string;
}) {
  const { push } = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      push({ type: "success", message: toastMessage ?? "Copied" });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      push({ type: "error", message: "Couldn't copy — please copy manually" });
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand",
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}
