import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PostHogProvider } from "@/lib/posthog/provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { CookieConsentBanner } from "@/components/analytics/cookie-consent-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: "SerpVive | AI-Powered Content Decay Monitor",
  description:
    "SerpVive monitors your blog, detects posts losing traffic, and tells you exactly what to fix to recover rankings.",
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
    title: "SerpVive | AI-Powered Content Decay Monitor",
    description:
      "SerpVive monitors your blog, detects posts losing traffic, and tells you exactly what to fix to recover rankings.",
    url: "https://serpvive.com",
    siteName: "SerpVive",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SerpVive | AI-Powered Content Decay Monitor",
    description:
      "SerpVive monitors your blog, detects posts losing traffic, and tells you exactly what to fix.",
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
        <GoogleAnalytics />
        <PostHogProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </PostHogProvider>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
