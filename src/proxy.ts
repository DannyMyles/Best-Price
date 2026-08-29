import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy gate for the admin area.
 *
 * This is NOT the security boundary — that's the Firestore security rules,
 * which reject every privileged read/write from a non-admin regardless of
 * what renders. This only stops the admin *shell* (and its layout flash)
 * from being served to visitors who have never signed in: the login page
 * sets a lightweight `ph_admin` cookie on success and clears it on sign
 * out. A forged cookie gets an empty, non-functional dashboard.
 */
const COOKIE = "ph_admin";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login page itself must stay reachable.
  if (pathname === "/admin/login") return NextResponse.next();

  if (!req.cookies.get(COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
