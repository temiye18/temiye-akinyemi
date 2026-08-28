/**
 * Shared assets for generated Open Graph cards (home + per-project). Fonts and
 * the monogram are read once at module load; palette mirrors the dark theme in
 * globals.css. Keeping this in one place means every social card stays on the
 * same warm-monochrome system.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const fontsDir = join(process.cwd(), "assets", "fonts");
const [geist, geistMono, fraunces, markRaw] = await Promise.all([
  readFile(join(fontsDir, "Geist-SemiBold.ttf")),
  readFile(join(fontsDir, "GeistMono-Medium.ttf")),
  readFile(join(fontsDir, "Fraunces-Italic.ttf")),
  readFile(join(process.cwd(), "src", "app", "icon.svg"), "base64"),
]);

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** Monogram mark as an inline data URI for use as an <img src>. */
export const markSrc = `data:image/svg+xml;base64,${markRaw}`;

export const OG = {
  ground: "#0f0e0c",
  ink: "#f2eee4",
  muted: "#a69f92",
  faint: "#857e70",
  line: "rgba(240, 236, 228, 0.12)",
};

export const ogFonts = [
  { name: "Geist", data: geist, weight: 600 as const, style: "normal" as const },
  {
    name: "Geist Mono",
    data: geistMono,
    weight: 500 as const,
    style: "normal" as const,
  },
  {
    name: "Fraunces",
    data: fraunces,
    weight: 500 as const,
    style: "italic" as const,
  },
];
