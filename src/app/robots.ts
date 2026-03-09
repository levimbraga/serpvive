import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/pages",
        "/settings",
        "/onboarding",
        "/api/",
        "/login",
        "/signup",
      ],
    },
    sitemap: "https://serpvive.com/sitemap.xml",
  };
}
