import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SerpVive",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48, background: "#07090F", color: "#F1F5F9" }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Privacy Policy</h1>
        <p style={{ color: "#94A3B8" }}>Coming soon.</p>
        <a href="/" style={{ display: "inline-block", marginTop: 24, color: "#3B82F6", textDecoration: "none", fontSize: 14 }}>&larr; Back to home</a>
      </div>
    </div>
  );
}
