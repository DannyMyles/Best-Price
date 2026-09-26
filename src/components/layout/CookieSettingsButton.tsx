"use client";

import { openConsent } from "@/lib/consent";

export function CookieSettingsButton() {
  return (
    <button
      onClick={openConsent}
      className="text-left transition-colors hover:text-white"
    >
      Cookie settings
    </button>
  );
}
