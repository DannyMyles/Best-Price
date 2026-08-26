"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SplitText } from "@/components/ui/SplitText";
import { AnimatedLinkButton } from "@/components/ui/AnimatedButton";
import { ProductImage } from "@/components/ui/ProductImage";
import { HomeSearch } from "./HomeSearch";
import { CategorySlug } from "@/lib/types";

const showcase: { category: CategorySlug; className: string; delay: number }[] = [
  { category: "macbook-pro", className: "h-40 w-40 sm:h-48 sm:w-48", delay: 0.3 },
  { category: "ipad", className: "h-28 w-28 sm:h-32 sm:w-32", delay: 0.45 },
  { category: "imac", className: "h-32 w-32 sm:h-36 sm:w-36", delay: 0.55 },
  { category: "surface", className: "h-24 w-24 sm:h-28 sm:w-28", delay: 0.65 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-muted to-white">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl animate-float-slower" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium text-ink/70 shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
            Genuine devices, Nairobi CBD
          </motion.div>

          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            <SplitText text="Quality Technology." as="div" />
            <SplitText text="Best Prices." as="div" delay={0.35} className="text-brand" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg"
          >
            Explore the latest MacBooks, iPads, iMacs and Surface devices at
            competitive prices — with easy WhatsApp ordering.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.78 }}
            className="mt-6 max-w-md"
          >
            <HomeSearch />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <AnimatedLinkButton href="/products" variant="primary">
              Shop Products <ArrowRight className="h-4 w-4" />
            </AnimatedLinkButton>
            <AnimatedLinkButton href="/#categories" variant="secondary">
              Explore Categories
            </AnimatedLinkButton>
          </motion.div>
        </div>

        <div className="relative mx-auto grid h-[340px] w-full max-w-md grid-cols-2 gap-4 sm:h-[400px]">
          {showcase.map((item, i) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: item.delay, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className={`flex items-center justify-center ${
                i % 2 === 0 ? "self-start" : "self-end"
              }`}
            >
              <ProductImage
                category={item.category}
                alt={item.category.replace("-", " ")}
                className={`${item.className} rounded-3xl shadow-xl shadow-black/10`}
                sizes="200px"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
