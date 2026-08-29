"use client";

import { useEffect, useState } from "react";

interface Remaining {
  hours: string;
  minutes: string;
  seconds: string;
  done: boolean;
}

function diffToMidnight(): Remaining {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  let ms = midnight.getTime() - now.getTime();
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { hours: pad(h), minutes: pad(m), seconds: pad(s), done: ms === 0 };
}

/** Live ticking countdown to the next local midnight. Renders "--:--:--"
 *  on the server / first paint to avoid a hydration mismatch, then ticks. */
export function useCountdownToMidnight(): Remaining {
  const [remaining, setRemaining] = useState<Remaining>({
    hours: "--",
    minutes: "--",
    seconds: "--",
    done: false,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(diffToMidnight());
    const id = window.setInterval(() => setRemaining(diffToMidnight()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return remaining;
}
