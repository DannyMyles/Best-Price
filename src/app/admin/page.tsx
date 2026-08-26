"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Tags, ClipboardList } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { fetchAllProducts } from "@/lib/firebase/products";
import { fetchAllCategories } from "@/lib/firebase/categories";
import { fetchAllOrders } from "@/lib/firebase/orders";

export default function AdminOverviewPage() {
  const [counts, setCounts] = useState<{ products: number; categories: number; pendingOrders: number } | null>(
    null
  );

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    Promise.all([fetchAllProducts(), fetchAllCategories(), fetchAllOrders()]).then(
      ([products, categories, orders]) => {
        setCounts({
          products: products.length,
          categories: categories.length,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
        });
      }
    );
  }, []);

  const cards = [
    { href: "/admin/products", label: "Products", icon: Package, value: counts?.products },
    { href: "/admin/categories", label: "Categories", icon: Tags, value: counts?.categories },
    { href: "/admin/orders", label: "Pending orders", icon: ClipboardList, value: counts?.pendingOrders },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Overview</h1>
      <p className="mt-1 text-sm text-muted">Manage your catalogue and orders.</p>

      {!isFirebaseConfigured && (
        <p className="mt-6 rounded-xl border border-border bg-white p-4 text-sm text-muted">
          Firebase isn&apos;t configured — add your project credentials to{" "}
          <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">.env.local</code>{" "}
          to manage live data.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-border bg-white p-5 transition-colors hover:border-brand/40"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-brand">
              <c.icon className="h-4.5 w-4.5" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-ink">{c.value ?? "—"}</p>
            <p className="text-sm text-muted">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
