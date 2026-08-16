import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import { site } from "@/lib/content";

export default function Contact() {
  return (
    <section
      id="contact"
      className="border-t border-[var(--color-line)] px-6 pb-16 pt-28 sm:px-10 lg:px-16 lg:pt-40"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <Reveal className="mb-8" y={12}>
          <p className="eyebrow flex items-center gap-3 text-[var(--color-faint)]">
            <span className="h-px w-8 bg-[var(--color-line-strong)]" />
            Contact
          </p>
        </Reveal>

        <h2 className="max-w-[16ch] text-[clamp(2.5rem,8vw,7rem)] font-medium leading-[0.98] tracking-[-0.02em]">
          <MaskText as="span" text="Let's build" className="block" />
          <MaskText
            as="span"
            text="something rare."
            className="block italic text-[var(--color-accent)]"
            delay={0.12}
          />
        </h2>

        <Reveal delay={0.3} className="mt-12">
          <Magnetic strength={10}>
            <a
              href={`mailto:${site.email}`}
              data-cursor-target
              className="group inline-flex items-center gap-4 text-xl text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)] sm:text-2xl"
            >
              <span className="border-b border-[var(--color-line-strong)] pb-1">
                {site.email}
              </span>
              <span className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                →
              </span>
            </a>
          </Magnetic>
        </Reveal>

        <footer className="mt-28 flex flex-col gap-8 border-t border-[var(--color-line)] pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-target
                className="eyebrow text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
              >
                {s.label}
              </a>
            ))}
          </div>
          <p className="eyebrow text-[var(--color-faint)]">
            © {site.since}–26 {site.name} · Built with Next.js · GSAP · Lenis
          </p>
        </footer>
      </div>
    </section>
  );
}
