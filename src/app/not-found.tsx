import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NotFoundView } from "@/components/layout/NotFoundView";

// Root-level fallback for a completely unmatched URL (as opposed to a
// notFound() call from inside the storefront, which (site)/not-found.tsx
// handles with the full layout). Root not-found.tsx can't rely on any
// route group's layout wrapping it, so the chrome is rendered directly here
// — otherwise a mistyped URL lands on a bare page with no way back in.
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <NotFoundView />
      </main>
      <Footer />
    </>
  );
}
