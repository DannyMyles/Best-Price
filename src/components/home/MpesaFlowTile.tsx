"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MPESA_PAYBILL_NUMBER } from "@/lib/contact";

const steps = [
  {
    key: "send",
    title: "Send Money",
    body: (
      <>
        to{" "}
        <span className="font-semibold text-ink">{MPESA_PAYBILL_NUMBER}</span>
      </>
    ),
  },
  {
    key: "pin",
    title: "Enter M-PESA PIN",
    body: <span className="tracking-[0.4em] text-ink">••••</span>,
  },
  {
    key: "done",
    title: "Payment received",
    body: <span className="text-success">Order confirmed on WhatsApp</span>,
  },
] as const;

export function MpesaFlowTile() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % steps.length), 2400);
    return () => clearInterval(id);
  }, [reduced]);

  const step = steps[i];

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-mpesa/25 bg-success-050/60 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 items-center rounded-md bg-mpesa px-1.5 text-[11px] font-bold text-white">
          M-PESA
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-ink/60">
          <Lock className="h-3 w-3" /> Secure payment
        </span>
      </div>

      <div className="my-4 min-h-[92px] rounded-2xl border border-border bg-surface p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.key}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  step.key === "done"
                    ? "bg-success text-white"
                    : "bg-mpesa/15 text-mpesa"
                }`}
              >
                {step.key === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <p className="text-sm font-semibold text-ink">{step.title}</p>
            </div>
            <p className="mt-1.5 pl-8 text-sm text-muted">{step.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">Pay the way Kenya pays</p>
        <p className="mt-0.5 text-xs text-muted">
          M-Pesa, cash on delivery or bank transfer — your choice at checkout.
        </p>
      </div>
    </div>
  );
}
