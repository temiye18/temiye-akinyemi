import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import LocalTime from "@/components/ui/LocalTime";
import Portrait from "@/components/ui/Portrait";
import { about, site } from "@/lib/content";

const CARD =
  "rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]";

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

        {/* bento "at a glance" — mixed sizes break the full-width rhythm */}
        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-[auto_1fr]">
          {/* portrait — spans both rows */}
          <Reveal className="md:row-span-2" y={12}>
            <Portrait />
          </Reveal>

          {/* statement — wide */}
          <Reveal className="md:col-span-2">
            <div className={`${CARD} h-full p-8`}>
              <MaskText
                as="h2"
                text={about.statement}
                className="text-[clamp(1.35rem,2.6vw,2.1rem)] font-medium leading-[1.2] tracking-tight"
                stagger={0.02}
              />
            </div>
          </Reveal>

          {/* live status */}
          <Reveal>
            <div
              className={`${CARD} flex h-full flex-col justify-between gap-6 p-7`}
            >
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
            </div>
          </Reveal>

          {/* quick facts */}
          <Reveal delay={0.08}>
            <div className={`${CARD} h-full p-7`}>
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
            </div>
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
