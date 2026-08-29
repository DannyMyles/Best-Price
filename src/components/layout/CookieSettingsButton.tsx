"use client";

import { openConsent } from "@/lib/consent";

export function CookieSettingsButton() {
  return (
    <button
      onClick={openConsent}
      className="text-left transition-colors hover:text-brand"
    >
      Cookie settings
    </button>
  );
}
