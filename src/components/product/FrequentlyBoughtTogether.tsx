"use client";

import { useMemo, useState } from "react";
import { Plus, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { ProductImage } from "@/components/ui/ProductImage";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { formatKES } from "@/lib/format";
import { cn } from "@/lib/cn";

export function FrequentlyBoughtTogether({
  main,
  addons,
}: {
  main: Product;
  addons: Product[];
}) {
  const { addItem } = useCart();
  const { push } = useToast();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(addons.map((a) => a.sku))
  );

  const items = useMemo(
    () => [main, ...addons.filter((a) => selected.has(a.sku))],
    [main, addons, selected]
  );
  const total = items.reduce((sum, p) => sum + (p.price ?? 0), 0);

  if (addons.length === 0) return null;

  function toggle(sku: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
  }

  function addAll() {
    items.forEach((p) => addItem(p, 1));
    push({
      type: "success",
      message: `${items.length} items added to cart`,
      action: { label: "View cart", href: "/cart" },
    });
  }

  return (
    <section className="mt-14">
      <h2 className="text-xl font-bold tracking-tight text-ink">
        Frequently bought together
      </h2>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        {/* visual row */}
        <div className="flex flex-wrap items-center gap-3">
          {[main, ...addons].map((p, i) => (
            <div key={p.sku} className="flex items-center gap-3">
              {i > 0 && <Plus className="h-4 w-4 shrink-0 text-muted" />}
              <div
                className={cn(
                  "h-16 w-16 overflow-hidden rounded-xl border",
                  i === 0 || selected.has(p.sku)
                    ? "border-border"
                    : "border-dashed border-border-strong opacity-40"
                )}
              >
                <ProductImage
                  src={p.images?.[0]}
                  category={p.category}
                  alt={p.name}
                  className="h-full w-full"
                  iconClassName="h-6 w-6"
                  sizes="64px"
                />
              </div>
            </div>
          ))}
        </div>

        {/* checklist */}
        <ul className="mt-4 space-y-2 border-t border-border pt-4">
          <li className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-ink">
              <Check className="h-4 w-4 text-success" />
              <span className="font-medium">This item:</span> {main.name}
            </span>
            <span className="shrink-0 font-semibold text-ink">
              {formatKES(main.price)}
            </span>
          </li>
          {addons.map((a) => (
            <li key={a.sku}>
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-ink/80">
                  <input
                    type="checkbox"
                    checked={selected.has(a.sku)}
                    onChange={() => toggle(a.sku)}
                    className="h-4 w-4 rounded border-border-strong text-brand focus:ring-brand"
                  />
                  {a.name}
                </span>
                <span className="shrink-0 font-semibold text-ink">
                  {formatKES(a.price)}
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Total for {items.length} item{items.length > 1 ? "s" : ""}:{" "}
            <span className="text-base font-bold text-ink">
              {formatKES(total)}
            </span>
          </p>
          <AnimatedButton
            variant="primary"
            onClick={addAll}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Add {items.length} to cart
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
}
