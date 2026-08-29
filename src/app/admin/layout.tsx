"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LayoutGrid, Package, Tags, ClipboardList, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LogoMark } from "@/components/ui/Logo";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status } = useAdminAuth();

  if (pathname === "/admin/login") return <>{children}</>;

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (status === "signed-out" || status === "not-admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-ink">
          {status === "not-admin" ? "This account isn't an admin." : "Please sign in to continue."}
        </p>
        <Link
          href="/admin/login"
          className="rounded-full bg-panel-dark px-5 py-2 text-sm font-medium text-white"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-white sm:flex">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <LogoMark className="h-8 w-8 rounded-lg" />
          <span className="text-sm font-semibold text-ink">Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-brand/10 text-brand"
                  : "text-ink/70 hover:bg-surface-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="truncate px-3 pb-2 text-xs text-muted">{user?.email}</p>
          <button
            onClick={async () => {
              if (auth) await signOut(auth);
              router.push("/admin/login");
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-surface-muted"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 sm:hidden">
          <span className="text-sm font-semibold text-ink">PriceHub Admin</span>
          <button
            onClick={async () => {
              if (auth) await signOut(auth);
              router.push("/admin/login");
            }}
            className="text-sm text-muted"
          >
            Sign out
          </button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-white px-3 py-2 sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                pathname === item.href
                  ? "bg-brand text-white"
                  : "bg-surface-muted text-ink/70"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
