import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://serpvive.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://serpvive.com/privacy-policy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://serpvive.com/terms-of-service",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
