import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Github01Icon,
} from "@hugeicons/core-free-icons";
import { projects, getProject } from "@/lib/content";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  projectJsonLd,
} from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import LivePreview from "@/components/ui/LivePreview";
import PlaceholderGraphic from "@/components/ui/PlaceholderGraphic";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const path = `/work/${project.slug}`;
  const social = `${project.title}, ${project.discipline}`;

  return {
    title: project.title,
    description: project.blurb,
    alternates: { canonical: path },
    // og:image / twitter:image are supplied by the colocated opengraph-image.
    openGraph: {
      type: "article",
      url: absoluteUrl(path),
      title: social,
      description: project.blurb,
    },
    twitter: {
      card: "summary_large_image",
      title: social,
      description: project.blurb,
    },
  };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];

  const sections = [
    { label: "The challenge", body: project.challenge },
    { label: "The approach", body: project.approach },
    { label: "The result", body: project.result },
  ];

  return (
    <main className="px-6 pb-24 pt-28 sm:px-10 lg:px-16">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: project.title, url: `/work/${project.slug}` },
          ]),
          projectJsonLd(project),
        ]}
      />
      <div className="mx-auto w-full max-w-[1100px]">
        <Reveal y={12}>
          <Link
            href="/#work"
            data-cursor-target
            className="eyebrow group inline-flex items-center gap-2 text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={14}
              strokeWidth={1.75}
              className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-x-1"
            />
            Back to work
          </Link>
        </Reveal>

        <header className="mt-12 border-b border-[var(--color-line)] pb-12">
          <h1
            style={{ viewTransitionName: `title-${project.slug}` }}
            className="text-[clamp(2.75rem,10vw,7rem)] font-medium leading-[0.95] tracking-[-0.02em]"
          >
            {project.title}
          </h1>
          <Reveal delay={0.08} y={10}>
            <p className="mt-5 font-[family-name:var(--font-display)] text-[clamp(1.25rem,2.4vw,1.9rem)] italic leading-snug text-[var(--color-muted)]">
              {project.discipline}
            </p>
          </Reveal>

          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { k: "Role", v: project.role },
              { k: "Timeline", v: project.timeline },
              { k: "Year", v: project.year },
              { k: "Stack", v: project.stack.join(" · ") },
            ].map((m) => (
              <div key={m.k}>
                <dt className="eyebrow mb-2 text-[var(--color-faint)]">{m.k}</dt>
                <dd className="text-sm text-[var(--color-ink)]">{m.v}</dd>
              </div>
            ))}
          </dl>

          {(project.url || project.github) && (
            <Reveal delay={0.1} className="mt-10">
              <div className="flex flex-wrap gap-3">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-target
                    className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] px-5 py-2.5 text-sm text-[var(--color-ink)] transition-colors duration-300 hover:bg-[var(--color-ink)] hover:text-[var(--color-ground)]"
                  >
                    Live site
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={15}
                      strokeWidth={1.7}
                      className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-target
                    className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm text-[var(--color-muted)] transition-colors duration-300 hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
                  >
                    <HugeiconsIcon
                      icon={Github01Icon}
                      size={16}
                      strokeWidth={1.6}
                    />
                    Source
                  </a>
                )}
              </div>
            </Reveal>
          )}
        </header>

        {/* Live landing-page preview when there's a URL; otherwise a bespoke
            graphic for projects with no public site. No entrance fade: arriving
            from the index, the hovered preview flies into this frame through a
            shared view transition. */}
        <div className="mt-12">
          {project.url ? (
            <LivePreview
              url={project.url}
              image={project.preview}
              title={project.title}
              transitionName={`shot-${project.slug}`}
            />
          ) : (
            <PlaceholderGraphic
              caption={project.stack.join(" · ")}
              transitionName={`shot-${project.slug}`}
            />
          )}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-12">
            {sections.map((s) => (
              <Reveal key={s.label}>
                <section>
                  <h2 className="eyebrow mb-4 text-[var(--color-muted)]">
                    {s.label}
                  </h2>
                  <p className="text-xl leading-relaxed text-[var(--color-ink)]">
                    {s.body}
                  </p>
                </section>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <aside className="lg:sticky lg:top-28">
              <h2 className="eyebrow mb-5 text-[var(--color-faint)]">
                Highlights
              </h2>
              <ul className="flex flex-col gap-4 border-t border-[var(--color-line)] pt-5">
                {project.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex gap-3 text-sm text-[var(--color-muted)]"
                  >
                    <span className="text-[var(--color-faint)]">·</span>
                    {h}
                  </li>
                ))}
              </ul>
            </aside>
          </Reveal>
        </div>

        {/* Next project */}
        <Reveal className="mt-28">
          <Link
            href={`/work/${next.slug}`}
            data-cursor-target
            className="group flex items-end justify-between gap-6 border-t border-[var(--color-line)] pt-8"
          >
            <div>
              <span className="eyebrow text-[var(--color-faint)]">
                Next project
              </span>
              <MaskText
                as="h2"
                text={next.title}
                className="mt-3 text-[clamp(2rem,6vw,4.5rem)] font-medium leading-none tracking-tight transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2"
              />
            </div>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={30}
              strokeWidth={1.4}
              className="mb-2 text-[var(--color-faint)] transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:text-[var(--color-ink)]"
            />
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
