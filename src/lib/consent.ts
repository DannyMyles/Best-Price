export const CONSENT_KEY = "pricehub-cookie-consent";
export const CONSENT_EVENT = "pricehub:consent";

export type ConsentValue = "all" | "essential";

export function getConsent(): ConsentValue | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** Re-opens the cookie banner (e.g. from a "Cookie settings" footer link). */
export function openConsent() {
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: "open" }));
}

/** True only when the visitor has opted in to non-essential (analytics)
 *  cookies — check this before loading GA / Pixel etc. */
export function hasAnalyticsConsent(): boolean {
  return getConsent() === "all";
}
