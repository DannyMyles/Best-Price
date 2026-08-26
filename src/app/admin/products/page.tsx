"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { fetchAllProducts, removeProduct } from "@/lib/firebase/products";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { formatKES } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    fetchAllProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(slug: string) {
    if (!confirm("Delete this product?")) return;
    await removeProduct(slug);
    setProducts((prev) => prev.filter((p) => p.slug !== slug));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {!isFirebaseConfigured ? (
        <EmptyState />
      ) : loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted">No products yet. Add your first one, or run the seed script.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.sku}>
                  <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                  <td className="px-4 py-3 capitalize text-muted">{p.category.replace("-", " ")}</td>
                  <td className="px-4 py-3 text-ink">{formatKES(p.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.inStock ? "bg-success/10 text-success" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.inStock ? "In stock" : "Out of stock"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${p.slug}`} className="text-muted hover:text-brand">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(p.slug)} className="text-muted hover:text-red-500">
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
    </div>
  );
}

function EmptyState() {
  return (
    <p className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
      Firebase isn&apos;t configured — add your project credentials to{" "}
      <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">.env.local</code> to manage products.
    </p>
  );
}
