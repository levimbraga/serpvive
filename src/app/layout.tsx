import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PostHogProvider } from "@/lib/posthog/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SerpVive — Revive Your Rankings | AI-Powered Content Decay Monitor",
  description:
    "SerpVive monitors your blog, detects posts losing traffic, diagnoses WHY with AI, and tells you exactly WHAT to do to recover.",
  metadataBase: new URL("https://serpvive.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/og-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/og-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "SerpVive — Revive Your Rankings",
    description:
      "Detect content decay, get AI-powered diagnoses, and recover your rankings with actionable refresh briefs.",
    url: "https://serpvive.com",
    siteName: "SerpVive",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SerpVive — Revive Your Rankings",
    description:
      "AI-powered content decay monitor. Detect decay, diagnose causes, recover rankings.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PostHogProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
