"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { HomeSearch } from "./HomeSearch";
import { HeroCarousel } from "./HeroCarousel";
import { HeroSidePanel } from "./HeroSidePanel";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-muted to-white">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl animate-float-slower" />

      <div className="relative mx-auto max-w-[1600px] px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium text-ink/70 shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
            Trusted Nairobi CBD retailer · Fast WhatsApp ordering
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-xl"
          >
            <HomeSearch />
          </motion.div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2"
          >
            <HeroCarousel />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroSidePanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
