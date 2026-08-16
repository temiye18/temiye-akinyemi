import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import { experience } from "@/lib/content";

export default function Experience() {
  return (
    <section
      id="experience"
      className="border-t border-[var(--color-line)] px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Reveal className="mb-6" y={12}>
              <p className="eyebrow">Experience</p>
            </Reveal>
            <MaskText
              as="h2"
              text="A record of the work."
              className="text-[clamp(1.75rem,4vw,3.25rem)] font-medium leading-[1.1] tracking-tight"
            />
          </div>
          <Reveal delay={0.15}>
            <span className="eyebrow">
              {experience.length.toString().padStart(2, "0")} — Roles
            </span>
          </Reveal>
        </div>

        <ol className="mx-auto max-w-[1000px]">
          {experience.map((r, i) => (
            <Reveal key={`${r.company}-${r.period}`} delay={(i % 2) * 0.05}>
              <li className="group grid grid-cols-1 gap-x-12 gap-y-4 border-t border-[var(--color-line)] py-9 last:border-b sm:grid-cols-[13rem_1fr]">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="mt-2 inline-block h-1.5 w-1.5 flex-none rounded-full bg-[var(--color-line-strong)] transition-colors duration-300 group-hover:bg-[var(--color-ink)]"
                  />
                  <span className="eyebrow pt-0.5">{r.period}</span>
                </div>

                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="text-2xl font-medium tracking-tight sm:text-[1.7rem]">
                      {r.company}
                    </h3>
                    <span className="text-sm text-[var(--color-muted)]">
                      {r.role}
                    </span>
                  </div>
                  <p className="mt-3 max-w-[56ch] text-[var(--color-muted)]">
                    {r.blurb}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                    {r.tags.map((t) => (
                      <li key={t} className="eyebrow">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
