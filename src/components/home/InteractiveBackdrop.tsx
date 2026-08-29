"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Ambient hero backdrop that reacts to the pointer: a soft brand glow trails
 * the cursor, and a faint dot grid is "torch-lit" only within a radius of it.
 * Falls back to a calm static wash on touch devices / reduced-motion.
 */
export function InteractiveBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;

    let targetX = 50;
    let targetY = 24;
    let curX = 50;
    let curY = 24;
    let raf = 0;
    let running = false;

    const loop = () => {
      curX += (targetX - curX) * 0.09;
      curY += (targetY - curY) * 0.09;
      el.style.setProperty("--mx", `${curX.toFixed(2)}%`);
      el.style.setProperty("--my", `${curY.toFixed(2)}%`);
      if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width) * 100;
      targetY = ((e.clientY - r.top) / r.height) * 100;
      el.dataset.lit = "1";
      kick();
    };
    const onLeave = () => {
      targetX = 50;
      targetY = 24;
      el.dataset.lit = "0";
      kick();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      data-lit="0"
      className="group/backdrop pointer-events-none absolute inset-0 overflow-hidden"
      style={{ ["--mx" as string]: "50%", ["--my" as string]: "24%" }}
    >
      {/* always-on ambient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(46rem 28rem at 50% -14%, color-mix(in srgb, var(--brand) 12%, transparent), transparent 70%)",
        }}
      />

      {/* torch-lit dot grid */}
      <div
        className="absolute inset-0 opacity-60 transition-opacity duration-700"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, color-mix(in srgb, var(--brand) 45%, transparent) 1px, transparent 1.5px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(20rem 20rem at var(--mx) var(--my), #000 0%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(20rem 20rem at var(--mx) var(--my), #000 0%, transparent 72%)",
        }}
      />

      {/* glow that trails the cursor */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(24rem 24rem at var(--mx) var(--my), color-mix(in srgb, var(--brand) 15%, transparent), transparent 62%)",
        }}
      />
    </div>
  );
}
