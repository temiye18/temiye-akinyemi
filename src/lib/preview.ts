import { projects } from "@/lib/content";

/**
 * Live landing-page screenshot via microlink, sized for a wide preview.
 * Microlink caches captures (about a day) and browsers keep the image too, so
 * a redesigned site can keep showing its old face. A project's
 * `previewVersion` is appended as `v`: microlink ignores it, but it gives the
 * image a new address, so every browser fetches it afresh. Bump it after
 * refreshing microlink's capture (a one-off request with `force=true`).
 */
export function shotUrl(url: string) {
  const params = new URLSearchParams({
    url,
    screenshot: "true",
    embed: "screenshot.url",
    meta: "false",
    "viewport.width": "1280",
    "viewport.height": "800",
    "viewport.deviceScaleFactor": "2",
  });
  const v = projects.find((p) => p.url === url)?.previewVersion;
  if (v) params.set("v", v);
  return `https://api.microlink.io/?${params.toString()}`;
}

export function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
