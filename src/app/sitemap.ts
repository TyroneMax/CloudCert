import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cloudcert.com";
const locales = ["en", "zh", "ja", "ko"];

const staticPaths = ["", "/certifications", "/search", "/roadmap"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      const url = path ? `/${locale}${path}` : `/${locale}`;
      entries.push({
        url: `${baseUrl}${url}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "weekly",
        priority: path === "" ? 1 : 0.8,
      });
    }
  }

  return entries;
}
