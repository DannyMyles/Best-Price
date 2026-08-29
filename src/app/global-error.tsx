"use client";

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          background: "#f6f7f9",
          color: "#101828",
        }}
      >
        <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <title>Something went wrong · PriceHub</title>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: "#667085", marginTop: 8 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => retry()}
            style={{
              marginTop: 16,
              borderRadius: 9999,
              background: "#1d4ed8",
              color: "#fff",
              border: 0,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
