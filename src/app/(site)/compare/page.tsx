"use client";

import Link from "next/link";
import { X, Plus, GitCompareArrows } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useProducts } from "@/hooks/useProducts";
import { useMounted } from "@/hooks/useMounted";
import { ProductImage } from "@/components/ui/ProductImage";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { StockPill } from "@/components/ui/StockPill";
import { AnimatedLinkButton } from "@/components/ui/AnimatedButton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ComparePage() {
  const { skus, remove, clear } = useCompare();
  const { products: all } = useProducts();
  const { addItem } = useCart();
  const { push } = useToast();
  const mounted = useMounted();

  const products = skus
    .map((sku) => all.find((p) => p.sku === sku))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const specLabels = Array.from(
    new Set(products.flatMap((p) => p.specs.map((s) => s.label)))
  );

  if (!mounted) {
    return (
      <div className="section py-10 sm:py-14">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-6 h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="section flex flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-muted">
          <GitCompareArrows className="h-6 w-6" />
        </span>
        <h1 className="text-xl font-semibold text-ink">Nothing to compare yet</h1>
        <p className="max-w-sm text-sm text-muted">
          Tap the compare icon on any product card to line up to four items side
          by side.
        </p>
        <AnimatedLinkButton href="/products" variant="dark" className="mt-1">
          Browse products
        </AnimatedLinkButton>
      </div>
    );
  }

  return (
    <div className="section py-8 sm:py-12">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Compare ({products.length})
        </h1>
        <button
          onClick={clear}
          className="text-sm font-medium text-muted hover:text-danger"
        >
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <tbody>
            {/* image + name */}
            <tr className="border-b border-border">
              <Th />
              {products.map((p) => (
                <td
                  key={p.sku}
                  className="border-l border-border p-4 align-top"
                >
                  <div className="relative">
                    <button
                      onClick={() => remove(p.sku)}
                      aria-label={`Remove ${p.name}`}
                      className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-surface text-muted shadow-sm hover:text-danger"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <Link href={`/products/${p.slug}`}>
                      <div className="aspect-square w-full overflow-hidden rounded-xl bg-surface-muted">
                        <ProductImage
                          src={p.images?.[0]}
                          category={p.category}
                          alt={p.name}
                          className="h-full w-full"
                          iconClassName="h-10 w-10"
                          sizes="200px"
                        />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold text-ink hover:text-brand">
                        {p.name}
                      </p>
                    </Link>
                  </div>
                </td>
              ))}
            </tr>

            <Row label="Price">
              {products.map((p) => (
                <Cell key={p.sku}>
                  <Price price={p.price} compareAtPrice={p.compareAtPrice} />
                </Cell>
              ))}
            </Row>

            <Row label="Rating">
              {products.map((p) => (
                <Cell key={p.sku}>
                  {p.rating != null ? (
                    <Rating value={p.rating} count={p.reviewCount} />
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </Cell>
              ))}
            </Row>

            <Row label="Availability">
              {products.map((p) => (
                <Cell key={p.sku}>
                  <StockPill product={p} />
                </Cell>
              ))}
            </Row>

            {specLabels.map((label) => (
              <Row key={label} label={label}>
                {products.map((p) => {
                  const v = p.specs.find((s) => s.label === label)?.value;
                  return (
                    <Cell key={p.sku}>
                      {v ?? <span className="text-muted">—</span>}
                    </Cell>
                  );
                })}
              </Row>
            ))}

            <tr>
              <Th />
              {products.map((p) => (
                <td key={p.sku} className="border-l border-border p-4">
                  <button
                    onClick={() => {
                      addItem(p, 1);
                      push({
                        type: "success",
                        message: `${p.name} added to cart`,
                        action: { label: "View cart", href: "/cart" },
                      });
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-strong"
                  >
                    <Plus className="h-4 w-4" /> Add to cart
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th() {
  return (
    <th className="sticky left-0 z-10 w-32 bg-surface p-4 text-left align-top text-xs font-semibold uppercase tracking-wide text-muted" />
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <th className="sticky left-0 z-10 bg-surface p-4 text-left align-top text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </th>
      {children}
    </tr>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-l border-border p-4 align-top text-sm text-ink/85">
      {children}
    </td>
  );
}
