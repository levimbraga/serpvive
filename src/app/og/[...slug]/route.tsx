import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const OG_PAGES: Record<string, { title: string; subtitle: string; badge?: string }> = {
  // Comparison pages
  "vs/semrush": {
    title: "Semrush vs SerpVive",
    subtitle: "The honest comparison for content monitoring in 2026",
    badge: "VS",
  },
  "vs/surfer-seo": {
    title: "Surfer SEO vs SerpVive",
    subtitle: "Content creation vs content protection",
    badge: "VS",
  },
  "vs/frase": {
    title: "Frase vs SerpVive",
    subtitle: "Which content decay tool is better in 2026?",
    badge: "VS",
  },
  // Blog posts
  "blog/google-search-console-seo-guide": {
    title: "Google Search Console for SEO",
    subtitle: "The complete 2026 guide to finding content decay in GSC",
    badge: "GUIDE",
  },
  "blog/best-content-audit-tools": {
    title: "7 Best Content Audit Tools",
    subtitle: "Features, pricing, and honest reviews for 2026",
    badge: "REVIEW",
  },
  // Tools
  "tools/decay-calculator": {
    title: "Content Decay Calculator",
    subtitle: "How much revenue are you losing to content decay?",
    badge: "FREE TOOL",
  },
  "resources/content-decay-checklist": {
    title: "15-Step Content Refresh Checklist",
    subtitle: "Diagnose, fix, and recover decaying content",
    badge: "FREE RESOURCE",
  },
  // Default pages
  blog: {
    title: "SerpVive Blog",
    subtitle: "Content decay insights and SEO strategies",
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const key = slug.join("/");
  const page = OG_PAGES[key] ?? {
    title: "SerpVive",
    subtitle: "Protect the traffic you already earned",
  };

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A0E1A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 70px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: Logo + Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.5px",
            }}
          >
            <span>Serp</span>
            <span style={{ color: "#3B82F6" }}>Vive</span>
          </div>
          {page.badge && (
            <div
              style={{
                background: "rgba(59, 130, 246, 0.15)",
                color: "#3B82F6",
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: "6px",
                letterSpacing: "0.5px",
              }}
            >
              {page.badge}
            </div>
          )}
        </div>

        {/* Center: Title + Subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: "#F1F5F9",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: "900px",
            }}
          >
            {page.title}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#94A3B8",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            {page.subtitle}
          </div>
        </div>

        {/* Bottom: URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              color: "#475569",
              fontFamily: "monospace",
            }}
          >
            serpvive.com
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: "#64748B",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22C55E",
              }}
            />
            AI-Powered Content Monitoring
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
