"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { LogoFull } from "@/components/ui/Logo";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <LogoFull className="w-40" />
          <p className="mt-3 text-xs text-muted">Sign in to manage the store</p>
        </div>

        {!isFirebaseConfigured ? (
          <p className="rounded-xl bg-surface-muted p-4 text-sm text-muted">
            Firebase isn&apos;t configured yet. Add your project credentials to
            <code className="mx-1 rounded bg-white px-1.5 py-0.5 text-xs">.env.local</code>
            to enable the admin dashboard.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink/70">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink/70">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand/60"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <AnimatedButton
              type="submit"
              variant="primary"
              disabled={submitting}
              className="w-full disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </AnimatedButton>
          </form>
        )}
      </div>
    </div>
  );
}
