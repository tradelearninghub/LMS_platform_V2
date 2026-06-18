import type { MetadataRoute } from "next";
import { query } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.APP_URL ?? "http://localhost:3000";
  const courses = await query("SELECT slug, updated_at FROM courses WHERE status = 'PUBLISHED'").catch(() => []);

  return [
    { url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${url}/courses`, changeFrequency: "weekly", priority: 0.8 },
    ...courses.map((c) => ({
      url: `${url}/courses/${c.slug}`,
      lastModified: c.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
