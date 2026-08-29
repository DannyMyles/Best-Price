"use client";

import { useEffect, useState } from "react";
import { MapPin, Truck, Store } from "lucide-react";
import { counties } from "@/lib/data/counties";
import { deliveryFeeFor, deliveryEtaFor } from "@/lib/data/delivery";
import { formatKES } from "@/lib/format";

const KEY = "pricehub-county";

export function DeliveryEstimator() {
  const [county, setCounty] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setCounty(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function onChange(v: string) {
    setCounty(v);
    try {
      if (v) window.localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
  }

  const fee = county ? deliveryFeeFor("courier", county) : null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <MapPin className="h-4 w-4 text-brand" /> Delivery to your area
      </p>

      <label className="mt-3 block">
        <span className="sr-only">Select your county</span>
        <select
          value={county}
          onChange={(e) => onChange(e.target.value)}
          className="field"
        >
          <option value="">Choose your county…</option>
          {counties.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {county && (
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-ink/80">
              <Truck className="h-4 w-4 text-muted" /> Courier to {county}
            </span>
            <span className="font-semibold text-ink">
              {fee === 0 ? "Free" : formatKES(fee ?? 0)}
            </span>
          </div>
          <p className="text-xs text-muted">
            Arrives in {deliveryEtaFor("courier")}. Pay on delivery available in
            most towns.
          </p>
        </div>
      )}

      <p className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted">
        <Store className="h-3.5 w-3.5 text-success" /> Or collect free from Bihi
        Towers, Nairobi CBD — ready same day.
      </p>
    </div>
  );
}
