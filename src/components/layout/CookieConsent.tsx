"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import {
  getConsent,
  setConsent,
  CONSENT_EVENT,
  type ConsentValue,
} from "@/lib/consent";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(getConsent() === null);
    function onEvt(e: Event) {
      const detail = (e as CustomEvent).detail;
      setOpen(detail === "open");
    }
    window.addEventListener(CONSENT_EVENT, onEvt);
    return () => window.removeEventListener(CONSENT_EVENT, onEvt);
  }, []);

  function choose(value: ConsentValue) {
    setConsent(value);
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Cookie notice"
          aria-live="polite"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-surface/98 pb-safe shadow-[0_-8px_24px_rgba(16,24,40,0.08)] backdrop-blur"
        >
          <div className="section flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2.5 text-sm text-ink/80">
              <Cookie className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
              <span>
                We use cookies and similar technologies to provide a seamless
                shopping experience, remember your cart and wishlist, and improve
                our website. With your consent, we may also use cookies to
                understand how our site is used and personalize your experience.
                Learn more in our{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-brand hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => choose("essential")}
                className="btn-secondary"
              >
                Essential only
              </button>
              <button onClick={() => choose("all")} className="btn-primary">
                Accept all
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
