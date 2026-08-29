"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  fetchAllProducts,
  removeProduct,
  setProductActive,
} from "@/lib/firebase/products";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { useAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/context/ToastContext";
import { formatKES } from "@/lib/format";
import { toCsv } from "@/lib/csv";
import { PRODUCT_CSV_COLUMNS, productToCsvRow } from "@/lib/productCsv";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Product } from "@/lib/types";
import { ImportCsv } from "./ImportCsv";

const LOW_STOCK_THRESHOLD = 5;
const KEY = "admin:products";

export default function AdminProductsPage() {
  const { push } = useToast();
  const {
    data,
    loading,
    error,
    refresh,
    mutate,
  } = useAdminData<Product[]>(KEY, fetchAllProducts, isFirebaseConfigured);
  const products = useMemo(() => data ?? [], [data]);

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const reload = useCallback(() => {
    refresh();
  }, [refresh]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await removeProduct(pendingDelete.slug);
      mutate(products.filter((p) => p.slug !== pendingDelete.slug));
      push({ type: "success", message: `Deleted “${pendingDelete.name}”` });
      setPendingDelete(null);
    } catch {
      push({ type: "error", message: "Couldn't delete — try again" });
    } finally {
      setDeleting(false);
    }
  }

  async function toggleActive(p: Product) {
    setBusySlug(p.slug);
    const next = p.active === false;
    try {
      await setProductActive(p.slug, next);
      mutate(
        products.map((x) => (x.slug === p.slug ? { ...x, active: next } : x))
      );
      push({
        type: "success",
        message: next ? "Product is now visible" : "Product hidden from storefront",
      });
    } catch {
      push({ type: "error", message: "Couldn't update visibility" });
    } finally {
      setBusySlug(null);
    }
  }

  function exportCsv() {
    const rows = [...products]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(productToCsvRow);
    const blob = new Blob([toCsv(rows, [...PRODUCT_CSV_COLUMNS])], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pricehub-products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const lowStock = products
    .filter(
      (p) =>
        typeof p.stockCount === "number" && p.stockCount <= LOW_STOCK_THRESHOLD
    )
    .sort((a, b) => (a.stockCount ?? 0) - (b.stockCount ?? 0));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink">Products</h1>
        <div className="flex flex-wrap items-center gap-2">
          {products.length > 0 && (
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink hover:border-brand/40"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
          <ImportCsv onDone={reload} />
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </div>
      </div>

      {!isFirebaseConfigured ? (
        <EmptyState />
      ) : loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : error ? (
        <div className="rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-danger">
          Couldn&apos;t load products.{" "}
          <button onClick={reload} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : (
        <>
          {lowStock.length > 0 && (
            <div className="mb-6 rounded-2xl border border-warning/30 bg-warning-050 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-warning">
                <AlertTriangle className="h-4 w-4" /> Low stock ({lowStock.length})
              </p>
              <ul className="mt-2 divide-y divide-warning/20">
                {lowStock.map((p) => (
                  <li
                    key={p.sku}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <Link
                      href={`/admin/products/${p.slug}`}
                      className="font-medium text-ink hover:text-brand"
                    >
                      {p.name}
                    </Link>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                        (p.stockCount ?? 0) <= 0
                          ? "bg-danger text-white"
                          : "bg-white text-warning"
                      }`}
                    >
                      {p.stockCount} left
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {products.length === 0 ? (
            <p className="text-sm text-muted">
              No products yet. Add your first one, import a CSV, or run the seed
              script.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Visible</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr
                      key={p.sku}
                      className={p.active === false ? "opacity-55" : undefined}
                    >
                      <td className="px-4 py-3 font-medium text-ink">
                        {p.name}
                        {p.badge && (
                          <span className="ml-2 rounded-full bg-brand-050 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 capitalize text-muted">
                        {p.category.replace(/-/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-ink">{formatKES(p.price)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            typeof p.stockCount === "number"
                              ? p.stockCount <= 0
                                ? "bg-red-100 text-red-600"
                                : p.stockCount <= LOW_STOCK_THRESHOLD
                                  ? "bg-warning-050 text-warning"
                                  : "bg-success/10 text-success"
                              : p.inStock
                                ? "bg-success/10 text-success"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {typeof p.stockCount === "number"
                            ? `${p.stockCount} in stock`
                            : p.inStock
                              ? "In stock"
                              : "Out of stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(p)}
                          disabled={busySlug === p.slug}
                          aria-label={
                            p.active === false
                              ? "Show in storefront"
                              : "Hide from storefront"
                          }
                          className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-brand disabled:opacity-50"
                        >
                          {p.active === false ? (
                            <>
                              <EyeOff className="h-4 w-4" /> Hidden
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" /> Visible
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/products/${p.slug}`}
                            className="text-muted hover:text-brand"
                            aria-label={`Edit ${p.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setPendingDelete(p)}
                            className="text-muted hover:text-red-500"
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        danger
        busy={deleting}
        title={`Delete “${pendingDelete?.name ?? ""}”?`}
        body="This permanently removes the product from Firestore. Hide it instead if you might sell it again."
        confirmLabel="Delete product"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <p className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
      Firebase isn&apos;t configured — add your project credentials to{" "}
      <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">
        .env.local
      </code>{" "}
      to manage products.
    </p>
  );
}
