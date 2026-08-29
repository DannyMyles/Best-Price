"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { SearchAutocomplete } from "./SearchAutocomplete";

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useFocusTrap<HTMLDivElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[80] bg-surface"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-3">
            <button
              onClick={onClose}
              aria-label="Close search"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/70 hover:bg-surface-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <SearchAutocomplete
                variant="overlay"
                autoFocus
                onNavigate={onClose}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
