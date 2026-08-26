import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BestPrice Technologies — Quality Technology, Best Prices";

export default function OpengraphImage() {
  const logoBase64 = readFileSync(join(process.cwd(), "public", "bally.png")).toString(
    "base64"
  );
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b1220 0%, #142a52 55%, #1d3a6e 100%)",
        }}
      >
        <img src={logoSrc} width={560} height={186} alt="" />
        <div
          style={{
            marginTop: 44,
            fontSize: 34,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Quality Technology. Best Prices.
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 24,
            color: "#38bdf8",
          }}
        >
          Nairobi CBD · Genuine Devices
        </div>
      </div>
    ),
    { ...size }
  );
}
