"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import { markAdminSession } from "@/lib/adminSession";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { LogoFull } from "@/components/ui/Logo";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=70";

function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const dest = params.get("from") || "/admin";

  function finish() {
    markAdminSession();
    router.replace(dest);
  }

  // Firebase remembers the session longer than the `ph_admin` cookie lives —
  // if the user is still signed in, restore the cookie and go straight in.
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (user) => {
      if (user) finish();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      finish();
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    if (!auth) return;
    setGoogleBusy(true);
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      finish();
    } catch {
      setError("Google sign-in was cancelled or failed.");
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${BG_IMAGE}")` }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-br from-panel-dark/90 via-panel-dark/80 to-brand/40"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/15 bg-surface/95 p-8 shadow-xl backdrop-blur">
        <div className="mb-6">
          <LogoFull className="w-40" />
          <p className="mt-3 text-xs text-muted">Sign in to manage the store</p>
        </div>

        {!isFirebaseConfigured ? (
          <p className="rounded-xl bg-surface-muted p-4 text-sm text-muted">
            Firebase isn&apos;t configured yet. Add your project credentials to
            <code className="mx-1 rounded bg-surface px-1.5 py-0.5 text-xs">
              .env.local
            </code>
            to enable the admin dashboard.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleBusy || submitting}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand/50 disabled:opacity-60"
            >
              <GoogleGlyph className="h-4 w-4" />
              {googleBusy ? "Opening Google…" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-1.5 block text-xs font-medium text-ink/70"
                >
                  Email
                </label>
                <input
                  id="admin-email"
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-xs font-medium text-ink/70"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    required
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    aria-pressed={showPw}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <AnimatedButton
                type="submit"
                variant="primary"
                isLoading={submitting}
                disabled={googleBusy}
                className="w-full"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </AnimatedButton>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginCard />
    </Suspense>
  );
}
