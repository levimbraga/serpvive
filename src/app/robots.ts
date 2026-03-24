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
        "/demo/",
      ],
    },
    sitemap: "https://serpvive.com/sitemap.xml",
  };
}
