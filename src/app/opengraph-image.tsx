import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bally Digital Solutions — The best price on the tech you want";

export default function OpengraphImage() {
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
          background:
            "linear-gradient(135deg, #0b0c0e 0%, #121212 55%, #17181b 140%)",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              background: "linear-gradient(135deg, #1a3d8c 0%, #122c68 68%, #c92b21 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            B
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            <span>Bally Digital</span>
            <span style={{ color: "#c92b21", marginLeft: 16 }}>Solutions</span>
          </div>
        </div>
        <div style={{ marginTop: 36, fontSize: 32, color: "rgba(255,255,255,0.82)" }}>
          The best price on the tech you want
        </div>
        <div style={{ marginTop: 14, fontSize: 22, color: "#4ea6ff" }}>
          Secure M-Pesa payment · Countrywide delivery in Kenya
        </div>
      </div>
    ),
    { ...size }
  );
}
