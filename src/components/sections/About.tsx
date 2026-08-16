import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import LocalTime from "@/components/ui/LocalTime";
import { about, site } from "@/lib/content";

const CARD =
  "rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]";

export default function About() {
  return (
    <section
      id="about"
      className="border-t border-[var(--color-line)] px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <Reveal className="mb-12" y={12}>
          <p className="eyebrow">About</p>
        </Reveal>

        {/* bento "at a glance" — mixed sizes break the full-width rhythm */}
        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-[auto_1fr]">
          {/* portrait — spans both rows */}
          <div
            className={`${CARD} relative flex min-h-[22rem] flex-col justify-end overflow-hidden p-7 md:row-span-2`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-10 select-none font-[family-name:var(--font-display)] text-[13rem] leading-none text-[var(--color-line-strong)]"
            >
              T
            </span>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(90% 60% at 50% 120%, color-mix(in srgb, var(--color-ink) 6%, transparent), transparent 70%)",
              }}
            />
            <div className="relative">
              <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
                {site.name}
              </p>
              <p className="eyebrow mt-2">{site.location}</p>
            </div>
          </div>

          {/* statement — wide */}
          <div className={`${CARD} p-8 md:col-span-2`}>
            <MaskText
              as="h2"
              text={about.statement}
              className="text-[clamp(1.35rem,2.6vw,2.1rem)] font-medium leading-[1.2] tracking-tight"
              stagger={0.02}
            />
          </div>

          {/* live status */}
          <Reveal className={`${CARD} flex flex-col justify-between gap-6 p-7`}>
            <p className="eyebrow">Status</p>
            <div>
              <p className="flex items-center gap-2.5 text-sm text-[var(--color-ink)]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]" />
                {site.status}
              </p>
              <p className="mt-2 text-sm text-[var(--color-faint)]">
                <LocalTime />
              </p>
            </div>
          </Reveal>

          {/* quick facts */}
          <Reveal className={`${CARD} p-7`} delay={0.08}>
            <p className="eyebrow mb-6">At a glance</p>
            <dl className="flex flex-col gap-4">
              {about.facts.slice(0, 3).map((f) => (
                <div
                  key={f.k}
                  className="flex items-baseline justify-between gap-4 border-b border-[var(--color-line)] pb-3 last:border-none last:pb-0"
                >
                  <dt className="eyebrow">{f.k}</dt>
                  <dd className="text-right text-sm text-[var(--color-ink)]">
                    {f.v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* the fuller narrative, below the bento */}
        <div className="mt-16 grid gap-8 border-t border-[var(--color-line)] pt-12 lg:grid-cols-2 lg:gap-20">
          {about.paragraphs.map((para, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="text-[var(--color-muted)]">{para}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
