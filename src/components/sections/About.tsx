import Reveal from "@/components/motion/Reveal";
import LocalTime from "@/components/ui/LocalTime";
import Portrait from "@/components/ui/Portrait";
import { about, site } from "@/lib/content";

// split the statement so a key phrase carries the signature italic emphasis
const EMPHASIS = "looks and feels";
const [stmtBefore, stmtAfter] = about.statement.split(EMPHASIS);

export default function About() {
  return (
    <section
      id="about"
      className="border-t border-[var(--color-line)] px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto w-full max-w-[1360px]">
        <Reveal className="mb-12" y={12}>
          <p className="eyebrow">About</p>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* portrait — the visual anchor, stretches to the column height */}
          <Reveal y={12} className="lg:h-full">
            <Portrait />
          </Reveal>

          {/* the profile, dense and always visible */}
          <div className="flex flex-col gap-12">
            <Reveal>
              <h2 className="text-[clamp(1.7rem,3.1vw,2.7rem)] font-medium leading-[1.24] tracking-tight text-[var(--color-ink)]">
                {stmtBefore}
                <em className="font-normal italic text-[var(--color-muted)]">
                  {EMPHASIS}
                </em>
                {stmtAfter}
              </h2>
            </Reveal>

            <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
              {about.paragraphs.map((para, i) => (
                <Reveal key={i} delay={0.1 + i * 0.08}>
                  <p className="text-[15px] leading-relaxed text-[var(--color-muted)]">
                    {para}
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15} className="mt-auto">
              <dl className="grid grid-cols-2 gap-x-8 gap-y-7 border-t border-[var(--color-line)] pt-8 sm:grid-cols-4">
                {about.facts.map((f) => (
                  <div key={f.k} className="flex flex-col gap-2">
                    <dt className="eyebrow">{f.k}</dt>
                    <dd className="text-[var(--color-ink)]">{f.v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-7 flex flex-wrap items-center gap-2.5 text-sm text-[var(--color-muted)]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]" />
                {site.status}
                <span className="text-[var(--color-faint)]">·</span>
                <LocalTime />
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
