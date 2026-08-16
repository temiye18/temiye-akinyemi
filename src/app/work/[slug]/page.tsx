import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/lib/content";
import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import ArtifactCanvas from "@/components/artifact/ArtifactCanvas";

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
  return {
    title: `${project.title} — Temiye Akinyemi`,
    description: project.blurb,
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
      <div className="mx-auto w-full max-w-[1100px]">
        <Reveal y={12}>
          <Link
            href="/#work"
            data-cursor-target
            className="eyebrow inline-flex items-center gap-2 text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
          >
            ← Back to work
          </Link>
        </Reveal>

        <header className="mt-12 border-b border-[var(--color-line)] pb-12">
          <Reveal className="mb-6" y={12}>
            <p className="eyebrow flex items-center gap-3 text-[var(--color-faint)]">
              <span>{project.index}</span>
              <span className="h-px w-8 bg-[var(--color-line-strong)]" />
              {project.discipline}
            </p>
          </Reveal>

          <h1
            style={{ viewTransitionName: `title-${project.slug}` }}
            className="text-[clamp(2.75rem,10vw,7rem)] font-medium leading-[0.95] tracking-[-0.02em]"
          >
            {project.title}
          </h1>

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
        </header>

        {/* The one 3D Artifact — signature project only */}
        {project.signature && (
          <Reveal className="mt-12">
            <figure className="relative aspect-[16/10] w-full overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)]">
              <ArtifactCanvas />
              <figcaption className="eyebrow pointer-events-none absolute bottom-4 left-4 text-[var(--color-faint)]">
                Drag to turn · WebGL
              </figcaption>
            </figure>
          </Reveal>
        )}

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-12">
            {sections.map((s) => (
              <Reveal key={s.label}>
                <section>
                  <h2 className="eyebrow mb-4 text-[var(--color-accent)]">
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
                    <span className="text-[var(--color-accent)]">—</span>
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
            <span className="pb-2 text-3xl text-[var(--color-faint)] transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:text-[var(--color-accent)]">
              →
            </span>
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
