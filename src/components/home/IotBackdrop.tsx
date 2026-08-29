"use client";

import { useEffect, useMemo, useRef } from "react";
import { Wifi } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { getCategoryImages } from "@/lib/data/categoryImages";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { CategorySlug } from "@/lib/types";

/** A node is a small floating product thumbnail wired into a network — the
 *  "internet of things" PriceHub sells. Positions are % of the hero box. */
interface Node {
  id: string;
  x: number;
  y: number;
  category?: CategorySlug;
  label: string;
  hub?: boolean;
}

const nodes: Node[] = [
  { id: "hub", x: 50, y: 7, label: "PriceHub", hub: true },
  { id: "ipad", x: 8, y: 22, category: "ipad", label: "Tablets" },
  { id: "air", x: 92, y: 14, category: "macbook-air", label: "Ultrabooks" },
  { id: "imac", x: 4, y: 50, category: "imac", label: "Desktops" },
  { id: "surface", x: 96, y: 42, category: "surface", label: "2-in-1s" },
  { id: "acc", x: 5, y: 78, category: "accessories", label: "Accessories" },
  { id: "pro", x: 96, y: 72, category: "macbook-pro", label: "Pro laptops" },
];

const edgePairs: [string, string][] = [
  ["hub", "ipad"],
  ["hub", "air"],
  ["hub", "imac"],
  ["hub", "surface"],
  ["hub", "acc"],
  ["hub", "pro"],
  ["ipad", "imac"],
  ["imac", "acc"],
  ["acc", "pro"],
  ["pro", "surface"],
  ["surface", "air"],
  ["air", "ipad"],
];

export function IotBackdrop() {
  const layerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const scaleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  const byId = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    []
  );
  const edges = useMemo(
    () =>
      edgePairs.map(([a, b], i) => {
        const na = byId[a];
        const nb = byId[b];
        return {
          key: `${a}-${b}`,
          x1: na.x,
          y1: na.y,
          x2: nb.x,
          y2: nb.y,
          dur: (4 + (i % 5) * 1.1).toFixed(1),
          delay: ((i % 6) * 0.9).toFixed(1),
        };
      }),
    [byId]
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    const layer = layerRef.current;
    if (!wrap || !layer) return;
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;

    let pctX = 50;
    let pctY = 50;
    let tX = 0;
    let tY = 0;
    let cX = 0;
    let cY = 0;
    const REST_BLUR = 1;
    const sc = nodes.map(() => 1);
    const bl = nodes.map(() => REST_BLUR);
    let raf = 0;
    let running = false;

    const loop = () => {
      cX += (tX - cX) * 0.07;
      cY += (tY - cY) * 0.07;
      layer.style.transform = `translate3d(${(cX * -16).toFixed(2)}px, ${(
        cY * -12
      ).toFixed(2)}px, 0) scale(1.05)`;

      let moving = Math.abs(tX - cX) > 0.002 || Math.abs(tY - cY) > 0.002;
      nodes.forEach((n, i) => {
        const d = Math.hypot(pctX - n.x, pctY - n.y);
        const near = d < 16 ? 1 - d / 16 : 0; // 0..1
        const targetSc = 1 + near * 0.5;
        const targetBl = REST_BLUR - near * (REST_BLUR - 0.05);
        sc[i] += (targetSc - sc[i]) * 0.16;
        bl[i] += (targetBl - bl[i]) * 0.16;
        const el = scaleRefs.current[i];
        if (el) {
          el.style.transform = `scale(${sc[i].toFixed(3)})`;
          el.style.opacity = (0.7 + near * 0.3).toFixed(3);
          el.style.filter = `blur(${bl[i].toFixed(2)}px)`;
        }
        if (Math.abs(targetSc - sc[i]) > 0.004 || Math.abs(targetBl - bl[i]) > 0.01)
          moving = true;
      });

      if (moving) raf = requestAnimationFrame(loop);
      else running = false;
    };
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      pctX = ((e.clientX - r.left) / r.width) * 100;
      pctY = ((e.clientY - r.top) / r.height) * 100;
      tX = (e.clientX - r.left) / r.width - 0.5;
      tY = (e.clientY - r.top) / r.height - 0.5;
      kick();
    };
    const onLeave = () => {
      tX = 0;
      tY = 0;
      pctX = -999;
      pctY = -999;
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
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
    >
      {/* ambient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(44rem 24rem at 50% -14%, color-mix(in srgb, var(--brand) 10%, transparent), transparent 70%)",
        }}
      />

      <div
        ref={layerRef}
        className="absolute inset-0 will-change-transform"
        style={{
          maskImage:
            "radial-gradient(78% 74% at 50% 44%, transparent 0%, transparent 30%, #000 62%, #000 88%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(78% 74% at 50% 44%, transparent 0%, transparent 30%, #000 62%, #000 88%, transparent 100%)",
        }}
      >
        {/* wires + travelling light — kept whisper-faint */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-brand"
        >
          <g stroke="currentColor" fill="none" strokeLinecap="round">
            {edges.map((e) => (
              <line
                key={e.key}
                className="iot-edge"
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                strokeWidth={1}
                strokeOpacity={0.12}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {edges.map((e) => (
              <line
                key={`w-${e.key}`}
                className="iot-wire-pulse"
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                pathLength={1}
                strokeWidth={2.5}
                strokeOpacity={0.6}
                vectorEffect="non-scaling-stroke"
                style={
                  {
                    ["--dur" as string]: `${e.dur}s`,
                    ["--delay" as string]: `${e.delay}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </g>
        </svg>

        {/* device thumbnails — tiny, borderless, soft-focus (sharpen on hover) */}
        {nodes.map((n, i) => (
          <div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div
              className="iot-node"
              style={
                {
                  ["--f" as string]: `${6 + (i % 4)}s`,
                  ["--fd" as string]: `${(i % 5) * 0.6}s`,
                } as React.CSSProperties
              }
            >
              <div
                ref={(el) => {
                  scaleRefs.current[i] = el;
                }}
                className="relative opacity-70 will-change-transform"
                style={{ filter: "blur(1px)" }}
              >
                <div className="iot-node-glow absolute -inset-1.5 rounded-xl bg-brand/25 blur-md" />
                {n.hub ? (
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white shadow-[0_3px_10px_rgba(29,78,216,0.35)]">
                    <Wifi className="h-4 w-4" strokeWidth={2.4} />
                  </div>
                ) : (
                  <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-surface shadow-[0_3px_10px_rgba(16,24,40,0.14)]">
                    <ProductImage
                      src={
                        n.category ? getCategoryImages(n.category)[0] : undefined
                      }
                      category={n.category ?? "accessories"}
                      alt={n.label}
                      className="h-full w-full"
                      iconClassName="h-3.5 w-3.5"
                      sizes="32px"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
