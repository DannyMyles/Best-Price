"use client";

import { useEffect, useState } from "react";

/* Removes the plain white studio background from a product photo so the
   product can float on a dark banner. Works on the fly in the browser:
   flood-fills near-white pixels inward from the image border (so white
   parts *inside* the product survive), then softens the edge ring to avoid
   a white halo. Photos whose border isn't mostly white (lifestyle shots)
   are left untouched. Results are cached per URL for the session. */

type Result = { url: string; cutout: boolean };
const cache = new Map<string, Promise<Result>>();

const MAX_SIDE = 1000;
const NEAR_WHITE = 236; // every channel at least this bright…
const MAX_TINT = 16; // …and nearly grey (max-min channel spread)

function isNearWhite(d: Uint8ClampedArray, i: number) {
  const r = d[i], g = d[i + 1], b = d[i + 2];
  const lo = Math.min(r, g, b);
  return lo >= NEAR_WHITE && Math.max(r, g, b) - lo <= MAX_TINT;
}

async function cutOut(src: string): Promise<Result> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  img.src = src;
  await img.decode();

  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { url: src, cutout: false };
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h); // throws if the server blocks CORS
  const d = data.data;

  // Only treat it as a studio shot if most of the border is white.
  let border = 0, whiteBorder = 0;
  for (let x = 0; x < w; x++) for (const y of [0, h - 1]) { border++; if (isNearWhite(d, (y * w + x) * 4)) whiteBorder++; }
  for (let y = 0; y < h; y++) for (const x of [0, w - 1]) { border++; if (isNearWhite(d, (y * w + x) * 4)) whiteBorder++; }
  if (whiteBorder / border < 0.7) return { url: src, cutout: false };

  // Flood fill the background from every white border pixel.
  const bg = new Uint8Array(w * h);
  const stack: number[] = [];
  const seed = (p: number) => {
    if (!bg[p] && isNearWhite(d, p * 4)) { bg[p] = 1; stack.push(p); }
  };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  while (stack.length) {
    const p = stack.pop()!;
    const x = p % w;
    if (x > 0) seed(p - 1);
    if (x < w - 1) seed(p + 1);
    if (p >= w) seed(p - w);
    if (p < w * (h - 1)) seed(p + w);
  }

  // Clear the background; fade the 2px ring around it by how white it is.
  for (let p = 0; p < w * h; p++) if (bg[p]) d[p * 4 + 3] = 0;
  for (let pass = 0; pass < 2; pass++) {
    const edge: number[] = [];
    for (let p = 0; p < w * h; p++) {
      if (bg[p]) continue;
      const x = p % w;
      if ((x > 0 && bg[p - 1]) || (x < w - 1 && bg[p + 1]) || (p >= w && bg[p - w]) || (p < w * (h - 1) && bg[p + w])) edge.push(p);
    }
    for (const p of edge) {
      const i = p * 4;
      const whiteness = Math.max(0, (Math.min(d[i], d[i + 1], d[i + 2]) - 170) / 85);
      d[i + 3] = Math.min(d[i + 3], Math.round(255 * (1 - whiteness * 0.85)));
      bg[p] = 2; // next pass works one pixel further in
    }
  }
  ctx.putImageData(data, 0, 0);

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  return blob ? { url: URL.createObjectURL(blob), cutout: true } : { url: src, cutout: false };
}

/** `null` while processing; then the cut-out URL (or the original if the
 *  photo isn't on white, or processing failed). */
export function useCutout(src: string | undefined, enabled = true): Result | null {
  const key = enabled && src ? src : null;
  const [result, setResult] = useState<{ key: string; value: Result } | null>(null);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    let job = cache.get(key);
    if (!job) {
      job = cutOut(key).catch(() => ({ url: key, cutout: false }));
      cache.set(key, job);
    }
    job.then((value) => alive && setResult({ key, value }));
    return () => {
      alive = false;
    };
  }, [key]);

  if (!key) return src ? { url: src, cutout: false } : null;
  return result?.key === key ? result.value : null;
}
