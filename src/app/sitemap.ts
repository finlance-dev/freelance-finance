import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://finlance.co", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://finlance.co/login", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://finlance.co/signup", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
