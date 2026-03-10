import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PostHogProvider } from "@/lib/posthog/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SerpVive — Revive Your Rankings | AI-Powered Content Decay Monitor",
  description:
    "SerpVive monitors your blog, detects posts losing traffic, diagnoses WHY with AI, and tells you exactly WHAT to do to recover.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "SerpVive — Revive Your Rankings | AI-Powered Content Decay Monitor",
    description:
      "SerpVive monitors your blog, detects posts losing traffic, diagnoses WHY with AI, and tells you exactly WHAT to do to recover.",
    url: "https://serpvive.com",
    images: [{ url: "/og-icon.png", width: 512, height: 512 }],
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
