"use client";

import Link from "next/link";
import {
  Package,
  Tags,
  ClipboardList,
  Star,
  Wallet,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { adminStats, type AdminStats } from "@/lib/api/stats";
import { useAdminData } from "@/hooks/useAdminData";
import { formatKES } from "@/lib/format";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

export default function AdminOverviewPage() {
  const { data: stats, error } = useAdminData<AdminStats>("admin:stats", adminStats);

  const recent = stats?.recentOrders ?? [];
  const lowStock = stats?.lowStock ?? [];

  const cards = [
    { href: "/admin/products", label: "Products", icon: Package, value: stats?.products },
    { href: "/admin/categories", label: "Categories", icon: Tags, value: stats?.categories },
    {
      href: "/admin/orders",
      label: "Pending orders",
      icon: ClipboardList,
      value: stats?.pendingOrders,
      alert: (stats?.pendingOrders ?? 0) > 0,
    },
    {
      href: "/admin/orders",
      label: "Awaiting payment",
      icon: Wallet,
      value: stats?.awaitingPayment,
      alert: (stats?.awaitingPayment ?? 0) > 0,
    },
    {
      href: "/admin/reviews",
      label: "Reviews to approve",
      icon: Star,
      value: stats?.pendingReviews,
      alert: (stats?.pendingReviews ?? 0) > 0,
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Overview</h1>
      <p className="mt-1 text-sm text-muted">Manage your catalogue and orders.</p>

      {error && (
        <p className="mt-6 rounded-xl border border-danger/30 bg-white p-4 text-sm text-danger">
          Couldn&apos;t load the dashboard numbers — is the backend running?
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="chamfer relative col-span-2 border border-border bg-panel-dark p-5 text-white lg:col-span-1">
          <span className="circuit-tick right-3 top-3 rotate-90 text-accent/60" />
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Wallet className="h-4.5 w-4.5" />
          </div>
          <p className="mt-4 text-2xl font-semibold">
            {stats ? formatKES(stats.revenue) : "—"}
          </p>
          <p className="text-sm text-white/70">Revenue (orders marked paid)</p>
        </div>

        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`chamfer border bg-white p-5 transition-colors hover:border-brand/40 ${
              c.alert ? "border-warning/40" : "border-border"
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                c.alert
                  ? "bg-warning-050 text-warning"
                  : "bg-surface-muted text-brand"
              }`}
            >
              <c.icon className="h-4.5 w-4.5" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-ink">
              {c.value ?? "—"}
            </p>
            <p className="text-sm text-muted">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="chamfer border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              All orders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {recent.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {o.customerName}
                    </p>
                    <p className="text-xs text-muted">
                      {o.ref} · {fmtDate(o.createdAt)} · {o.status}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-ink">
                    {formatKES(o.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="chamfer border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <AlertTriangle className="h-4 w-4 text-warning" /> Low stock
            </h2>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              Products <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {!stats ? (
            <p className="mt-3 text-sm text-muted">—</p>
          ) : lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Everything is comfortably stocked.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="truncate font-medium text-ink hover:text-brand"
                  >
                    {p.name}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      (p.stockCount ?? 0) <= 0
                        ? "bg-danger text-white"
                        : "bg-warning-050 text-warning"
                    }`}
                  >
                    {p.stockCount} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
