"use client";

import { useEffect, useRef, useState } from "react";

/** Eases a number from 0 → `end` once the element scrolls into view. */
export function useCountUp(end: number, durationMs = 1400) {
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(end * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && run(),
      { threshold: 0.4 }
    );
    io.observe(el);
    const fallback = window.setTimeout(run, 1500);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [end, durationMs]);

  return { ref, value };
}
