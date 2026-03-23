import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/pages/",
        "/settings/",
        "/onboarding/",
        "/admin/",
        "/refreshes/",
        "/feedback/",
        "/api/",
        "/callback",
      ],
    },
    sitemap: "https://serpvive.com/sitemap.xml",
  };
}
