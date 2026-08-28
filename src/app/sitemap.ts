import type { MetadataRoute } from "next";
import { projects } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

// Only indexable, canonical URLs: the homepage and each statically-generated
// case study. No noindex, redirect, or private routes exist to exclude.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: absoluteUrl(`/work/${project.slug}`),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
