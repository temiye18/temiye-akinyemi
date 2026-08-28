import type { MetadataRoute } from "next";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME } from "@/lib/seo";

// Warm near-black to match the default (dark) theme ground in globals.css.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: DEFAULT_TITLE,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0f0e0c",
    theme_color: "#0f0e0c",
    icons: [{ src: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
  };
}
