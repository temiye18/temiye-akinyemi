/**
 * Central SEO configuration and JSON-LD builders.
 *
 * One source of truth for the production origin, default metadata, and the
 * structured-data graph. Route files (layout, pages, sitemap, robots) and the
 * JsonLd component all read from here so a new public page never re-derives any
 * of this. Entity copy comes from `content.ts`; this module only frames it for
 * search engines.
 */
import { site, about, capabilities, type Project } from "@/lib/content";

/** Production origin. Canonical host is the `www` subdomain. */
export const SITE_URL = "https://www.temiyeakinyemi.com";
export const SITE_NAME = site.name;
export const DEFAULT_TITLE = `${site.name}, ${site.role}`;
export const DEFAULT_DESCRIPTION =
  "Temiye Akinyemi is a software engineer in Lagos building production web apps across healthcare, AI marketplaces, and consumer platforms.";

/** Resolve a site-relative path to an absolute production URL. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

/** External profile URLs only (skips the local résumé PDF) for `sameAs`. */
const PROFILE_URLS = site.socials
  .map((s) => s.href)
  .filter((href) => /^https?:\/\//.test(href));

const KNOWS_ABOUT = capabilities.disciplines.map((d) => d.title);

const PERSON_ID = absoluteUrl("/#person");
const WEBSITE_ID = absoluteUrl("/#website");

type Node = Record<string, unknown>;

/** The portfolio owner. Reused (by @id reference) across the graph. */
export function personJsonLd(): Node {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    url: SITE_URL,
    jobTitle: site.role,
    email: `mailto:${site.email}`,
    image: absoluteUrl("/temiye.png"),
    description: about.statement,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
    knowsAbout: KNOWS_ABOUT,
    sameAs: PROFILE_URLS,
  };
}

export function websiteJsonLd(): Node {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };
}

/** A case study, modelled as CreativeWork authored by the owner. */
export function projectJsonLd(project: Project): Node {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: `${project.title}, ${project.discipline}`,
    description: project.blurb,
    url: absoluteUrl(`/work/${project.slug}`),
    dateCreated: project.year,
    keywords: project.stack.join(", "),
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    ...(project.url ? { sameAs: project.url } : {}),
  };
}

/** Breadcrumb trail. `items` are ordered root → current. */
export function breadcrumbJsonLd(items: { name: string; url: string }[]): Node {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}
