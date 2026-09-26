"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Clock, Pause, Play } from "lucide-react";
import { useBanners } from "@/hooks/useBanners";
import { useCountdownTo } from "@/hooks/useCountdown";
import { useCutout } from "@/hooks/useCutout";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import type { Banner } from "@/lib/types";

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 50;
/** Primary-button colour when a slide has no accent of its own (brand green,
 *  the AA-contrast shade). */
const DEFAULT_ACCENT = "#178549";

/** Black or white — whichever reads better on `hex` (WCAG relative luminance). */
function readableOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (lum + 0.05) / 0.05 > 1.05 / (lum + 0.05) ? "#111111" : "#ffffff";
}

/** Retail-style promo carousel for the top of the homepage (modelled on the
 *  big camera retailers): a contained banner with the picture on the left and
 *  a badge, brand line, bold headline, short copy and up to two buttons on
 *  the right. Slides cross-fade, autoplay pauses on hover/focus or via the
 *  pause button, and touch users can swipe. Slides come from the
 *  admin-managed banners API (or, until some exist, one per department). */
export function HeroCarousel() {
  const { banners, loading } = useBanners();
  const reduced = useReducedMotion();
  const count = banners.length;

  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  const playing = count > 1 && !reduced && !stopped && !hovered && !focused;
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, index, count]);

  if (!loading && count === 0) return null;

  return (
    <section className="bg-panel-dark" aria-roledescription="carousel" aria-label="Promotions">
      <div
        className="group/hero relative h-[460px] overflow-hidden bg-panel-dark sm:h-[340px] lg:h-[390px]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") prev();
          else if (e.key === "ArrowRight") next();
        }}
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (dx < -SWIPE_PX) next();
          else if (dx > SWIPE_PX) prev();
        }}
      >
        {loading && count === 0 && <div className="absolute inset-0 animate-pulse bg-white/5" />}

        {banners.map((b, i) => (
          <Slide
            key={b.id}
            banner={b}
            active={i === index}
            first={i === 0}
            label={`${i + 1} of ${count}`}
            reduced={reduced}
          />
        ))}

        {count > 1 && (
          <div className="pointer-events-none absolute inset-0 z-20 mx-auto max-w-[1600px] *:pointer-events-auto">
            <ArrowButton side="left" onClick={prev} />
            <ArrowButton side="right" onClick={next} />

            <div className="absolute inset-x-0 bottom-2.5 z-20 flex items-center justify-center gap-0.5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className="p-1.5"
                >
                  <span
                    className={cn(
                      "block h-2 w-2 rounded-full transition-colors",
                      i === index ? "bg-white" : "bg-white/35 hover:bg-white/70"
                    )}
                  />
                </button>
              ))}
              {!reduced && (
                <button
                  type="button"
                  onClick={() => setStopped((s) => !s)}
                  aria-label={stopped ? "Play slideshow" : "Pause slideshow"}
                  className={cn(
                    "ml-1 p-1.5 text-white/55 transition-colors hover:text-white"
                  )}
                >
                  {stopped ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3 fill-current" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** A white-background product photo with the white removed, so the product
 *  floats on the dark banner (see useCutout). Stays hidden until processed,
 *  then fades in; photos that aren't on white are shown as-is. */
function ProductShot({ src, active, motion }: { src: string; active: boolean; motion: string }) {
  const shot = useCutout(src);
  return (
    <div className="relative h-full w-full max-w-[560px] sm:h-[96%]">
      {shot && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shot.url}
          alt=""
          draggable={false}
          className={cn(
            "absolute inset-0 h-full w-full object-contain transition-all ease-out group-hover/hero:scale-[1.03]",
            shot.cutout
              ? "drop-shadow-[0_22px_28px_rgba(0,0,0,0.55)]"
              : "rounded-[12px] object-cover",
            motion,
            active ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0"
          )}
        />
      )}
    </div>
  );
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex",
        side === "left" ? "left-4 lg:left-6" : "right-4 lg:right-6"
      )}
    >
      <Icon className="h-6 w-6" strokeWidth={1.75} />
    </button>
  );
}

interface SlideProps {
  banner: Banner;
  active: boolean;
  first: boolean;
  label: string;
  reduced: boolean;
}

function Slide({ banner, active, first, label, reduced }: SlideProps) {
  const product = banner.layout === "product";
  const accent = banner.accent ?? DEFAULT_ACCENT;
  const onAccent = readableOn(accent);
  const countdown = useCountdownTo(banner.dealEndsAt);
  const showCountdown = banner.dealEndsAt && !countdown.done;
  const motion = reduced ? "duration-0" : "duration-700";

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      className={cn(
        "absolute inset-0 transition-opacity ease-out [--glow-x:50%] [--glow-y:26%] sm:[--glow-x:33%] sm:[--glow-y:50%]",
        motion,
        active ? "z-10 opacity-100" : "z-0 opacity-0"
      )}
    >
      {/* ---- background ---- */}
      {product ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#0e1013",
            backgroundImage: `radial-gradient(circle at var(--glow-x) var(--glow-y), ${accent}59 0%, ${accent}1f 28%, transparent 58%), linear-gradient(115deg, #16191e 0%, #0e1013 55%, #08090b 100%)`,
          }}
        >
          {/* faint dot grid for texture */}
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(90deg,black,transparent_70%)]" />
        </div>
      ) : (
        <>
          <Image
            src={banner.image}
            alt=""
            fill
            priority={first}
            unoptimized
            sizes="(min-width: 1600px) 1600px, 100vw"
            className="object-cover object-left"
            draggable={false}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/55 to-black/0 sm:bg-linear-to-r sm:from-black/0 sm:via-black/45 sm:to-black/85" />
        </>
      )}

      {/* ---- content: kept in a centred column so picture and copy stay together on wide screens ---- */}
      <div className="relative mx-auto grid h-full max-w-6xl grid-rows-[1fr_auto] items-center gap-5 px-5 pb-12 pt-6 text-white sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:grid-rows-1 sm:gap-12 sm:px-24 sm:py-0 lg:gap-16">
        <div className="flex h-full items-center justify-center sm:justify-end">
          {product && <ProductShot src={banner.image} active={active} motion={motion} />}
        </div>

        <div
          className={cn(
            "max-w-xl transition-all ease-out",
            reduced ? "duration-0" : "delay-150 duration-700",
            active ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
          )}
        >
          {(banner.badge || banner.eyebrow || showCountdown) && (
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              {banner.badge && (
                <span
                  className="py-1 pl-2.5 pr-4 text-[11px] font-bold uppercase leading-none tracking-[0.06em] [clip-path:polygon(0_0,100%_0,calc(100%-8px)_100%,0_100%)] sm:text-xs"
                  style={{ backgroundColor: accent, color: onAccent }}
                >
                  {banner.badge}
                </span>
              )}
              {banner.eyebrow && (
                <span className="text-base font-bold leading-none tracking-tight sm:text-lg">{banner.eyebrow}</span>
              )}
              {showCountdown && (
                <span className="inline-flex items-center gap-1.5 rounded bg-white/10 px-2 py-1 font-mono text-xs tabular-nums">
                  <Clock className="h-3.5 w-3.5" />
                  Ends in {countdown.hours}:{countdown.minutes}:{countdown.seconds}
                </span>
              )}
            </div>
          )}

          <h2 className="line-clamp-2 text-balance text-[28px] font-extrabold leading-[1.02] tracking-[-0.025em] sm:text-[36px] lg:text-[46px]">
            {banner.headline}
          </h2>

          {banner.subcopy && (
            <p className="mt-2.5 line-clamp-2 max-w-md text-pretty text-sm leading-snug text-white/75 sm:text-base">
              {banner.subcopy}
            </p>
          )}

          {((banner.cta2Label && banner.cta2Href) || (banner.ctaLabel && banner.ctaHref)) && (
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
              {banner.cta2Label && banner.cta2Href && (
                <Link
                  href={banner.cta2Href}
                  className="inline-flex h-10 items-center rounded-[5px] border-2 border-white/90 px-5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black sm:h-11 sm:px-6"
                >
                  {banner.cta2Label}
                </Link>
              )}
              {banner.ctaLabel && banner.ctaHref && (
                <Link
                  href={banner.ctaHref}
                  className="inline-flex h-10 items-center rounded-[5px] px-6 text-sm font-semibold shadow-sm transition hover:brightness-[0.92] sm:h-11 sm:px-7"
                  style={{ backgroundColor: accent, color: onAccent }}
                >
                  {banner.ctaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
