import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import ScrollFade from "@/components/motion/ScrollFade";
import HeroBackdrop from "@/components/hero/HeroBackdrop";
import { site } from "@/lib/content";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col overflow-hidden px-6 pb-20 pt-28 sm:px-10 lg:px-16"
    >
      {/* Fogged glass over a warm cursor-reactive field. The headline below is
          painted into it; the rest of the copy sits crisp on the glass. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <HeroBackdrop />
      </div>

      <ScrollFade className="mx-auto my-auto w-full max-w-[1360px]">
        <div className="relative w-fit">
          <h1
            data-glass-text
            className="text-[clamp(2.5rem,8vw,7rem)] font-medium leading-[0.96] tracking-[-0.035em]"
          >
            <span className="block">{site.name},</span>
            <span className="block">
              software{" "}
              <span className="italic font-normal text-[var(--color-muted)]">
                engineer.
              </span>
            </span>
          </h1>
        </div>

        <Reveal delay={0.5} className="mt-10 max-w-[54ch]">
          <p className="text-lg text-[var(--color-muted)] sm:text-xl">
            I build production web apps across healthcare, AI marketplaces, and
            consumer platforms, and I care about how each one feels.
          </p>
        </Reveal>

        <Reveal delay={0.65} className="mt-14">
          <Magnetic>
            <a
              href="#work"
              data-cursor-target
              className="group inline-flex items-center gap-3 border-b border-[var(--color-line-strong)] pb-1.5 text-[0.82rem] font-medium uppercase tracking-[0.14em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)]"
            >
              Selected Work
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={15}
                strokeWidth={1.75}
                className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-1"
              />
            </a>
          </Magnetic>
        </Reveal>

        {/* meta — below the fold of the headline, not a kicker above it */}
        <Reveal delay={0.8} className="mt-12 sm:mt-16 lg:mt-20">
          <dl className="flex flex-wrap gap-x-12 gap-y-4 border-t border-[var(--color-line)] pt-6">
            {[
              { k: "Discipline", v: site.role },
              { k: "Practicing since", v: String(site.since) },
              { k: "Based", v: site.location },
            ].map((m) => (
              <div key={m.k}>
                <dt className="eyebrow mb-1.5">{m.k}</dt>
                <dd className="text-sm text-[var(--color-ink)]">{m.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </ScrollFade>

      {/* ambient scroll cue */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block">
        <span className="eyebrow">Scroll</span>
      </div>
    </section>
  );
}
