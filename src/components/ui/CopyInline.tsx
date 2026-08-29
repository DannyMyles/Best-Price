"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/cn";

/**
 * An inline, tappable value that copies itself to the clipboard — for phone
 * and M-Pesa numbers shown in running text. Icon inherits `currentColor`
 * so it works on light and dark surfaces; pass colour via `className`.
 */
export function CopyInline({
  value,
  display,
  toastMessage = "Copied",
  ariaLabel,
  className,
}: {
  /** The exact string written to the clipboard (usually digits only). */
  value: string;
  /** What to show; defaults to `value`. */
  display?: React.ReactNode;
  toastMessage?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const { push } = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      push({ type: "success", message: toastMessage });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      push({ type: "error", message: "Couldn't copy — please copy manually" });
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={ariaLabel ?? `Copy ${value}`}
      className={cn(
        "group inline-flex items-center gap-1 whitespace-nowrap rounded underline decoration-dotted decoration-1 underline-offset-2 transition-colors hover:decoration-solid focus-visible:outline-none",
        className
      )}
    >
      {display ?? value}
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}
