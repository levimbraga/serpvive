import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "SerpVive — AI Content Decay Monitor",
  description:
    "Detect posts losing traffic, diagnose why with AI, and get actionable refresh briefs with micro-drafts.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "SerpVive — AI Content Decay Monitor",
    description:
      "Detect posts losing traffic, diagnose why with AI, and get actionable refresh briefs with micro-drafts.",
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
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
