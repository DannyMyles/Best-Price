"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedLinkButton } from "@/components/ui/AnimatedButton";
import { cn } from "@/lib/cn";

interface Slide {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
}

const slides: Slide[] = [
  {
    eyebrow: "Genuine devices, Nairobi CBD",
    title: "Quality Technology.\nBest Prices.",
    subtitle:
      "Explore the latest MacBooks, iPads, iMacs and Surface devices at competitive prices — with easy WhatsApp ordering.",
    cta: "Shop All Products",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1627766556564-5d89b3765c46?q=80&w=1600&auto=format&fit=crop",
  },
  {
    eyebrow: "Best Seller",
    title: "MacBook Pro M5 Pro.\nPower Redefined.",
    subtitle:
      "Elevated performance with the M5 Pro chip — built for demanding creative and professional workflows.",
    cta: "Shop MacBook Pro",
    href: "/products?category=macbook-pro",
    image:
      "https://images.unsplash.com/photo-1542767352-e98201e84ed8?q=80&w=1600&auto=format&fit=crop",
  },
  {
    eyebrow: "New Arrival",
    title: "iPad Pro M5.\nCreativity Unleashed.",
    subtitle:
      "The ultimate iPad experience. The M5 chip and a stunning display make this the most capable iPad ever.",
    cta: "Shop iPad",
    href: "/products?category=ipad",
    image:
      "https://images.unsplash.com/photo-1669691177924-f12fcc3cc540?q=80&w=1600&auto=format&fit=crop",
  },
];

const AUTOPLAY_MS = 5500;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((delta: number) => {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, go]);

  const slide = slides[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="group relative h-[440px] w-full overflow-hidden rounded-3xl sm:h-[500px]"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-panel-dark/95 via-panel-dark/55 to-transparent" />

          <div className="relative flex h-full max-w-lg flex-col justify-center gap-4 px-8 sm:px-12">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
            >
              {slide.eyebrow}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55 }}
              className="whitespace-pre-line text-3xl font-semibold leading-[1.1] text-white sm:text-4xl lg:text-5xl"
            >
              {slide.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.55 }}
              className="text-sm leading-relaxed text-white/75 sm:text-base"
            >
              {slide.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.55 }}
            >
              <AnimatedLinkButton href={slide.href} variant="primary" className="w-fit">
                {slide.cta} <ArrowRight className="h-4 w-4" />
              </AnimatedLinkButton>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-white/25 group-hover:opacity-100 sm:left-4"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-white/25 group-hover:opacity-100 sm:right-4"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
