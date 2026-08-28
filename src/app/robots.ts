import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Everything on this site is public and meant to be indexed. No auth, admin, or
// private routes exist, so nothing is disallowed. Next's internal /_next assets
// are allowed because crawlers need CSS/JS to render the page.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
