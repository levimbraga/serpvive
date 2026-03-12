import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SerpVive — AI-Powered Content Decay Monitor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "linear-gradient(135deg, #0A0E1A 0%, #111827 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 24 }}>
          <span style={{ fontSize: 72, fontWeight: 800, color: "#FFFFFF", letterSpacing: -2 }}>
            Serp
          </span>
          <span style={{ fontSize: 72, fontWeight: 800, color: "#3B82F6", letterSpacing: -2 }}>
            Vive
          </span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 32, color: "#94A3B8", fontWeight: 500, margin: 0, marginBottom: 40, textAlign: "center", maxWidth: 800 }}>
          AI-Powered Content Decay Monitor
        </p>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Detect Decay", "AI Diagnosis", "Refresh Brief", "Track Results"].map((label) => (
            <div
              key={label}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                color: "#93C5FD",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <p style={{ fontSize: 20, color: "#475569", marginTop: 40, fontWeight: 500 }}>
          serpvive.com
        </p>
      </div>
    ),
    { ...size },
  );
}
