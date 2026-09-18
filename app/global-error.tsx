"use client";
import * as React from "react";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "24rem" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>The application failed to load</h1>
            <p style={{ marginTop: "0.5rem", color: "#666" }}>Please try again. If this keeps happening, contact support.</p>
            <button
              onClick={reset}
              style={{ marginTop: "1.5rem", borderRadius: "9999px", backgroundColor: "#0066cc", color: "#fff", padding: "0.6rem 1.5rem", border: "none", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
