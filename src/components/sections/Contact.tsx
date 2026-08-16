import { HugeiconsIcon } from "@hugeicons/react";
import {
  Github01Icon,
  NewTwitterIcon,
  Linkedin01Icon,
  File01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import LocalTime from "@/components/ui/LocalTime";
import { site } from "@/lib/content";

const SOCIAL_ICONS: Record<string, typeof Github01Icon> = {
  GitHub: Github01Icon,
  "X / Twitter": NewTwitterIcon,
  LinkedIn: Linkedin01Icon,
  "Read.cv": File01Icon,
};

export default function Contact() {
  return (
    <section
      id="contact"
      className="border-t border-[var(--color-line)] px-6 pb-16 pt-28 sm:px-10 lg:px-16 lg:pt-40"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <Reveal className="mb-8" y={12}>
          <p className="eyebrow">Contact</p>
        </Reveal>

        <h2 className="max-w-[16ch] text-[clamp(2.5rem,8vw,7rem)] font-medium leading-[0.98] tracking-[-0.03em]">
          <MaskText as="span" text="Let's build" className="block" />
          <MaskText
            as="span"
            text="something rare."
            className="block italic font-normal text-[var(--color-muted)]"
            delay={0.12}
          />
        </h2>

        <Reveal delay={0.3} className="mt-12">
          <Magnetic strength={10}>
            <a
              href={`mailto:${site.email}`}
              data-cursor-target
              className="group inline-flex items-center gap-4 text-xl text-[var(--color-ink)] sm:text-2xl"
            >
              <span className="border-b border-[var(--color-line-strong)] pb-1 transition-colors group-hover:border-[var(--color-ink)]">
                {site.email}
              </span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={22}
                strokeWidth={1.6}
                className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
              />
            </a>
          </Magnetic>
        </Reveal>

        <Reveal delay={0.4} className="mt-7">
          <p className="flex items-center gap-2.5 text-sm text-[var(--color-faint)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]" />
            <LocalTime /> · {site.status.toLowerCase()}
          </p>
        </Reveal>

        <footer className="mt-28 flex flex-col gap-8 border-t border-[var(--color-line)] pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {site.socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.label] ?? File01Icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-target
                  aria-label={s.label}
                  className="group inline-flex items-center gap-2 text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
                >
                  <HugeiconsIcon icon={Icon} size={17} strokeWidth={1.6} />
                  <span className="eyebrow text-inherit">{s.label}</span>
                </a>
              );
            })}
          </div>
          <p className="eyebrow">
            © {site.since}–26 {site.name} · Built with Next.js
          </p>
        </footer>
      </div>
    </section>
  );
}
