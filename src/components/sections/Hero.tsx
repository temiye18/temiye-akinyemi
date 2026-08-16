import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import HeroBackdrop from "@/components/hero/HeroBackdrop";
import LensReveal from "@/components/hero/LensReveal";
import { site } from "@/lib/content";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 sm:px-10 lg:px-16"
    >
      {/* Warm monochrome cursor-reactive field, behind the type. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <HeroBackdrop />
        {/* legibility scrim — theme-aware, keeps the headline readable */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--color-ground)_82%,transparent),color-mix(in_srgb,var(--color-ground)_30%,transparent)_55%,transparent)]" />
      </div>

      <div className="mx-auto w-full max-w-[1600px]">
        <div className="relative w-fit">
          <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-medium leading-[0.96] tracking-[-0.035em]">
            <MaskText as="span" text="Interfaces that" className="block" />
            <span className="block">
              <MaskText
                as="span"
                text="withhold,"
                className="italic font-normal text-[var(--color-muted)]"
                delay={0.12}
              />{" "}
              <MaskText as="span" text="then reward." delay={0.18} />
            </span>
          </h1>
          <LensReveal />
        </div>

        <Reveal delay={0.5} className="mt-10 max-w-[52ch]">
          <p className="text-lg text-[var(--color-muted)] sm:text-xl">
            {site.name} builds enigmatic, immersive, interactive web experiences
            — where the craft is the interface, and the site itself is the
            proof.
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
        <Reveal delay={0.8} className="mt-20">
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
      </div>

      {/* ambient scroll cue */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block">
        <span className="eyebrow">Scroll</span>
      </div>
    </section>
  );
}
