import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import HeroBackdrop from "@/components/hero/HeroBackdrop";
import { site } from "@/lib/content";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 sm:px-10 lg:px-16"
    >
      {/* OBSIDIAN cursor-reactive shader field, behind the type. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <HeroBackdrop />
        {/* legibility scrim — keeps the headline readable over the atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(11,12,18,0.75),rgba(11,12,18,0.25)_60%,transparent)]" />
      </div>

      <div className="mx-auto w-full max-w-[1600px]">
        <Reveal className="mb-8" y={12}>
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--color-accent)]" />
            {site.role} · Est. {site.since}
          </p>
        </Reveal>

        <h1 className="text-[clamp(2.75rem,9vw,8.5rem)] font-medium leading-[0.95] tracking-[-0.02em]">
          <MaskText as="span" text="Interfaces that" className="block" />
          <span className="block">
            <MaskText
              as="span"
              text="withhold,"
              className="italic text-[var(--color-accent)]"
              delay={0.12}
            />{" "}
            <MaskText as="span" text="then reward." delay={0.18} />
          </span>
        </h1>

        <Reveal delay={0.5} className="mt-10 max-w-[54ch]">
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
              className="eyebrow group inline-flex items-center gap-3 border-b border-[var(--color-line-strong)] pb-1 text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)]"
            >
              Selected Work
              <span className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-1">
                ↓
              </span>
            </a>
          </Magnetic>
        </Reveal>
      </div>

      {/* ambient scroll cue */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block">
        <span className="eyebrow text-[var(--color-faint)]">Scroll</span>
      </div>
    </section>
  );
}
