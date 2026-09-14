"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useBanners } from "@/hooks/useBanners";
import { useCountdownTo } from "@/hooks/useCountdown";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import type { Banner } from "@/lib/types";

const AUTOPLAY_MS = 6500;
const MotionLink = motion.create(Link);

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

/** Full-bleed, auto-advancing promo carousel for the top of the homepage.
 *  Beyond the usual slider mechanics (swipe, arrows, dots, autoplay), each
 *  slide is pointer-reactive — the photo drifts and tilts toward the
 *  cursor like a physical object, the copy parallaxes against it, the CTA
 *  is magnetic, and the whole block recedes as you scroll past it. Slides
 *  come from the (admin-managed) `banners` collection, seeded with
 *  sensible defaults when Firebase isn't configured yet. */
export function HeroCarousel() {
  const { banners, loading } = useBanners();
  const reduced = useReducedMotion();
  const count = banners.length;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Pointer position, normalised to -0.5..0.5 of the hero box, smoothed with
  // a spring so slides drift rather than snap.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, { stiffness: 150, damping: 20, mass: 0.4 });
  const pointerY = useSpring(rawY, { stiffness: 150, damping: 20, mass: 0.4 });

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (reduced || e.pointerType !== "mouse" || !sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onPointerLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  // Whole hero gently recedes (zooms + rises) as the page scrolls past it.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0.6]);

  const go = useCallback(
    (rawNext: number, dir: number) => {
      setDirection(dir);
      setIndex(((rawNext % count) + count) % count);
    },
    [count]
  );
  const nextSlide = useCallback(() => go(index + 1, 1), [go, index]);
  const prevSlide = useCallback(() => go(index - 1, -1), [go, index]);

  useEffect(() => {
    if (paused || reduced || count <= 1) return;
    const id = window.setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced, count]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prevSlide();
      else if (e.key === "ArrowRight") nextSlide();
    }
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [prevSlide, nextSlide]);

  if (!loading && count === 0) return null;

  const slide = banners[index];

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        onPointerLeave();
      }}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerMove={onPointerMove}
      className="relative overflow-hidden bg-panel-dark focus:outline-none"
    >
      <motion.div
        style={
          reduced
            ? undefined
            : { scale: heroScale, y: heroY, opacity: heroOpacity, perspective: 1000 }
        }
        className="relative h-[380px] sm:h-[440px] lg:h-[500px]"
      >
        {slide && (
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={slide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduced ? 0.2 : 0.55, ease: [0.22, 1, 0.36, 1] }}
              drag={count > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.55}
              onDragEnd={(_e, info) => {
                if (info.offset.x < -80 || info.velocity.x < -400) nextSlide();
                else if (info.offset.x > 80 || info.velocity.x > 400) prevSlide();
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <BannerSlide
                banner={slide}
                pointerX={pointerX}
                pointerY={pointerY}
                reduced={reduced}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {!reduced && count > 1 && (
          <div
            key={`progress-${slide?.id}-${paused}`}
            className="absolute inset-x-0 top-0 z-10 h-0.5 bg-white/15"
          >
            <div
              className="h-full origin-left bg-white/80"
              style={{
                animation: paused
                  ? "none"
                  : `carousel-progress ${AUTOPLAY_MS}ms linear`,
              }}
            />
          </div>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prevSlide}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:left-5 sm:p-2.5"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={nextSlide}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:right-5 sm:p-2.5"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 sm:bottom-5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => go(i, i > index ? 1 : -1)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}

interface SlideProps {
  banner: Banner;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  reduced: boolean;
}

function BannerSlide({ banner, pointerX, pointerY, reduced }: SlideProps) {
  const countdown = useCountdownTo(banner.dealEndsAt);
  const showCountdown = banner.dealEndsAt && !countdown.done;

  // Background drifts opposite the cursor and tilts slightly — a physical,
  // "looking at the product" feel rather than a flat photo.
  const imageX = useTransform(pointerX, [-0.5, 0.5], [18, -18]);
  const imageY = useTransform(pointerY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(pointerX, [-0.5, 0.5], [-4, 4]);
  const rotateX = useTransform(pointerY, [-0.5, 0.5], [4, -4]);
  // Copy sits "closer" to the viewer, so it drifts with (not against) the
  // cursor, and by a smaller amount — the parallax separation reads as depth.
  const contentX = useTransform(pointerX, [-0.5, 0.5], [-8, 8]);

  return (
    <div className="relative h-full w-full">
      <div className="chamfer absolute inset-4 overflow-hidden border border-accent/30 sm:inset-6">
        <motion.div
          className="absolute inset-0"
          style={
            reduced
              ? undefined
              : { x: imageX, y: imageY, rotateX, rotateY, scale: 1.08 }
          }
        >
          <Image
            src={banner.image}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
            draggable={false}
          />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-r from-panel-dark/92 via-panel-dark/50 to-transparent" />
        <div className="circuit-tick left-3 top-3 text-accent" />
        <div className="circuit-tick bottom-3 right-3 rotate-180 text-accent" />
      </div>

      <div className="section relative flex h-full items-center">
        <motion.div
          style={reduced ? undefined : { x: contentX }}
          className="max-w-lg pl-10 sm:pl-11"
        >
          {(banner.badge || showCountdown) && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {banner.badge && (
                <span className="badge chamfer-sm bg-accent font-mono uppercase tracking-wide text-white">
                  {banner.badge}
                </span>
              )}
              {showCountdown && (
                <span className="inline-flex items-center gap-1.5 border border-white/15 bg-white/5 px-3 py-1 font-mono text-xs text-white backdrop-blur-sm">
                  <Clock className="h-3.5 w-3.5" />
                  Ends in {countdown.hours}:{countdown.minutes}:{countdown.seconds}
                </span>
              )}
            </div>
          )}

          {banner.eyebrow && (
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-brand-2">
              {banner.eyebrow}
            </p>
          )}
          <h2 className="mt-3 text-balance text-3xl font-bold leading-[1.02] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {banner.headline}
          </h2>
          {banner.subcopy && (
            <p className="mt-3 max-w-md text-pretty text-sm text-white/75 sm:text-base">
              {banner.subcopy}
            </p>
          )}
          {banner.ctaLabel && banner.ctaHref && (
            <MagneticCta href={banner.ctaHref} reduced={reduced}>
              {banner.ctaLabel} <ArrowRight className="h-4 w-4" />
            </MagneticCta>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/** A button that pulls gently toward the cursor while hovered, and springs
 *  back on release — the small, tactile signal that this UI responds to you. */
function MagneticCta({
  href,
  reduced,
  children,
}: {
  href: string;
  reduced: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 16, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 250, damping: 16, mass: 0.3 });

  function onMove(e: React.PointerEvent<HTMLAnchorElement>) {
    if (reduced || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <MotionLink
      ref={ref}
      href={href}
      draggable={false}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduced ? undefined : { x: sx, y: sy }}
      className="btn-electric chamfer-sm mt-6 inline-flex w-fit px-6 py-3"
    >
      {children}
    </MotionLink>
  );
}
