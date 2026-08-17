/** Live landing-page screenshot via microlink, sized for a wide preview. */
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
  return `https://api.microlink.io/?${params.toString()}`;
}

export function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
