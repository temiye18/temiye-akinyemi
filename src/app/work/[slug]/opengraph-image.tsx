import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/lib/content";
import { markSrc, OG, OG_CONTENT_TYPE, OG_SIZE, ogFonts } from "@/lib/og-assets";

// A distinct share card per case study, in the same warm-monochrome system as
// the home card: discipline eyebrow, project title, italic-Fraunces descriptor,
// and the stack along the base.
export const alt = "Case study";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: OG.ground,
          backgroundImage:
            "radial-gradient(circle at 16% 10%, rgba(242,238,228,0.08), transparent 52%)",
          fontFamily: "Geist Mono",
          padding: "80px 88px 72px 88px",
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
            <img src={markSrc} width={58} height={58} alt="" />
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
            Case study
          </span>
        </div>

        {/* headline block */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 17,
              letterSpacing: 5,
              color: OG.faint,
              textTransform: "uppercase",
              marginBottom: 22,
            }}
          >
            {project.index} · {project.year}
          </span>
          <div
            style={{
              display: "flex",
              fontFamily: "Geist",
              fontWeight: 600,
              fontSize: 84,
              lineHeight: 0.96,
              letterSpacing: -2,
              color: OG.ink,
              maxWidth: 980,
            }}
          >
            {project.title}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 42,
              marginTop: 22,
              color: OG.muted,
            }}
          >
            {project.discipline}
          </div>
        </div>

        {/* bottom bar: the stack */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${OG.line}`,
            paddingTop: 24,
          }}
        >
          <span
            style={{
              fontSize: 18,
              letterSpacing: 1,
              color: OG.muted,
              overflow: "hidden",
            }}
          >
            {project.stack.join("  ·  ")}
          </span>
          <span style={{ fontSize: 18, letterSpacing: 1, color: OG.faint }}>
            Temiye Akinyemi
          </span>
        </div>
      </div>
    ),
    { ...size, fonts: ogFonts },
  );
}
