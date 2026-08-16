import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import { about } from "@/lib/content";

export default function About() {
  return (
    <section
      id="about"
      className="border-t border-[var(--color-line)] px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto grid w-full max-w-[1600px] gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
        <div>
          <Reveal className="mb-10" y={12}>
            <p className="eyebrow flex items-center gap-3 text-[var(--color-faint)]">
              <span className="h-px w-8 bg-[var(--color-line-strong)]" />
              About
            </p>
          </Reveal>

          {/* KINETIC type gets velocity-reactive treatment in Phase 3; the
              masked reveal is the Phase 1 stand-in. */}
          <MaskText
            as="h2"
            text={about.statement}
            className="text-[clamp(1.6rem,3.4vw,3rem)] font-medium leading-[1.15] tracking-tight"
            stagger={0.02}
          />
        </div>

        <div className="flex flex-col gap-10 lg:pt-20">
          {about.paragraphs.map((para, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="text-[var(--color-muted)]">{para}</p>
            </Reveal>
          ))}

          <Reveal delay={0.2}>
            <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-[var(--color-line)] pt-8">
              {about.facts.map((f) => (
                <div key={f.k}>
                  <dt className="eyebrow mb-2 text-[var(--color-faint)]">{f.k}</dt>
                  <dd className="text-sm text-[var(--color-ink)]">{f.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
