import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen icon. Mirrors src/app/icon.svg (blue field + white "h"
// mark) but as a 180×180 PNG, which Safari needs — it ignores SVG here.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1d4ed8",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 40 40" fill="none">
          <path
            d="M14 8v24M14 22c0-4.4 3-7.2 7.2-7.2s7.2 2.8 7.2 7.2v10"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="30" cy="11" r="3.1" fill="#ffffff" />
        </svg>
      </div>
    ),
    size
  );
}
