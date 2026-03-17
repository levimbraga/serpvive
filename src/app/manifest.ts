import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SerpVive",
    short_name: "SerpVive",
    description: "AI-Powered Content Decay Monitor — detect decay, diagnose causes, recover rankings.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0A0E1A",
    theme_color: "#3B82F6",
    icons: [
      { src: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { src: "/og-icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/og-icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
