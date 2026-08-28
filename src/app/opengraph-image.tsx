import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/content";
import { markSrc, OG, OG_CONTENT_TYPE, OG_SIZE, ogFonts } from "@/lib/og-assets";

// Home share card. Warm-monochrome editorial split: text left, portrait right
// bleeding into the ground. One signature moment: the role set in italic
// Fraunces. Generated so it always tracks the content source of truth.
export const alt = `${site.name}, ${site.role}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const photoRaw = await readFile(
  join(process.cwd(), "public", "temiye.png"),
  "base64",
);
const photoSrc = `data:image/png;base64,${photoRaw}`;

const PHOTO_W = 430;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: OG.ground,
          backgroundImage:
            "radial-gradient(circle at 16% 12%, rgba(242,238,228,0.08), transparent 50%)",
          fontFamily: "Geist Mono",
          position: "relative",
        }}
      >
        {/* left: text column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "space-between",
            padding: "80px 64px 72px 84px",
          }}
        >
          {/* top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={markSrc} width={60} height={60} alt="" />
              <span style={{ fontSize: 21, letterSpacing: 2, color: OG.muted }}>
                temiyeakinyemi.com
              </span>
            </div>
            <span
              style={{
                fontSize: 15,
                letterSpacing: 6,
                color: OG.faint,
                textTransform: "uppercase",
              }}
            >
              Portfolio
            </span>
          </div>

          {/* headline */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Geist",
                fontWeight: 600,
                fontSize: 96,
                lineHeight: 0.95,
                letterSpacing: -3,
                color: OG.ink,
              }}
            >
              {site.name}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Fraunces",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 48,
                marginTop: 24,
                color: OG.muted,
              }}
            >
              {site.role}
            </div>
          </div>

          {/* bottom bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${OG.line}`,
              paddingTop: 24,
              marginRight: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 7,
                  backgroundColor: OG.ink,
                  display: "flex",
                }}
              />
              <span style={{ fontSize: 20, letterSpacing: 1, color: OG.muted }}>
                {site.location}
              </span>
            </div>
            <span style={{ fontSize: 18, letterSpacing: 1, color: OG.faint }}>
              {site.status}
            </span>
          </div>
        </div>

        {/* right: portrait, bleeding into the ground on its left edge */}
        <div
          style={{
            display: "flex",
            position: "relative",
            width: PHOTO_W,
            height: "100%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc}
            width={PHOTO_W}
            height={OG_SIZE.height}
            alt=""
            style={{
              width: PHOTO_W,
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
          {/* left-edge fade so the portrait melts into the dark ground */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 200,
              display: "flex",
              backgroundImage:
                "linear-gradient(to right, #0f0e0c, rgba(15,14,12,0.55) 45%, rgba(15,14,12,0))",
            }}
          />
          {/* soft top + bottom grounding */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 120,
              display: "flex",
              backgroundImage:
                "linear-gradient(to bottom, rgba(15,14,12,0.7), rgba(15,14,12,0))",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 140,
              display: "flex",
              backgroundImage:
                "linear-gradient(to top, rgba(15,14,12,0.75), rgba(15,14,12,0))",
            }}
          />
        </div>
      </div>
    ),
    { ...size, fonts: ogFonts },
  );
}
