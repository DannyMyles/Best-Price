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
  adminAllProducts,
  adminDeleteProduct,
  adminUpdateProduct,
} from "@/lib/api/products";
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
  } = useAdminData<Product[]>(KEY, adminAllProducts);
  const products = useMemo(() => data ?? [], [data]);

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = useCallback(() => {
    refresh();
  }, [refresh]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminDeleteProduct(pendingDelete.id!);
      mutate(products.filter((p) => p.id !== pendingDelete.id));
      push({ type: "success", message: `Deleted “${pendingDelete.name}”` });
      setPendingDelete(null);
    } catch {
      push({ type: "error", message: "Couldn't delete — try again" });
    } finally {
      setDeleting(false);
    }
  }

  async function toggleActive(p: Product) {
    setBusyId(p.id ?? null);
    const next = p.active === false;
    try {
      await adminUpdateProduct(p.id!, { active: next });
      mutate(
        products.map((x) => (x.id === p.id ? { ...x, active: next } : x))
      );
      push({
        type: "success",
        message: next ? "Product is now visible" : "Product hidden from storefront",
      });
    } catch {
      push({ type: "error", message: "Couldn't update visibility" });
    } finally {
      setBusyId(null);
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

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : error ? (
        <div className="rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-danger">
          Couldn&apos;t load products — is the backend running?{" "}
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
                    key={p.id}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <Link
                      href={`/admin/products/${p.id}`}
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
              No products yet. Add your first one or import a CSV.
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
                      key={p.id}
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
                          disabled={busyId === p.id}
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
                            href={`/admin/products/${p.id}`}
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
        body="This permanently removes the product from the store. Its photos are deleted with it. Hide it instead if you might sell it again."
        confirmLabel="Delete product"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
