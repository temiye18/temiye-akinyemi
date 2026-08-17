import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function shotUrl(url: string) {
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

/**
 * Vercel-style landing-page preview: a browser-chrome frame showing the live
 * site's landing page (a screenshot capture, so no iframe-blocking), that opens
 * the real site on click. Prefers a self-hosted `image`; otherwise captures live.
 */
export default function LivePreview({
  url,
  image,
  title,
}: {
  url: string;
  image?: string;
  title: string;
}) {
  const src = image ?? shotUrl(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-target
      aria-label={`Open ${title} live`}
      className="group block overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] transition-colors duration-300 hover:border-[var(--color-line-strong)]"
    >
      {/* browser chrome */}
      <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-line-strong)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-line-strong)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-line-strong)]" />
        </div>
        <span className="flex-1 truncate rounded-full bg-[var(--color-ground)] px-3 py-1 text-center font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-faint)]">
          {domainOf(url)}
        </span>
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          size={16}
          strokeWidth={1.7}
          className="text-[var(--color-muted)] transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-ink)]"
        />
      </div>

      {/* landing-page preview */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-ground)]">
        <Image
          src={src}
          alt={`${title} landing page`}
          fill
          unoptimized={!image}
          sizes="(max-width: 1024px) 100vw, 1100px"
          className="object-cover object-top transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
        />
      </div>
    </a>
  );
}
