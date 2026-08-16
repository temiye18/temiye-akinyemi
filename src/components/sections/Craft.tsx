import { HugeiconsIcon } from "@hugeicons/react";
import {
  Atom01Icon,
  CubeIcon,
  MouseScroll01Icon,
  DashboardSpeed01Icon,
  AccessibilityIcon,
  DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";
import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import { craft } from "@/lib/content";

const ICONS = [
  Atom01Icon,
  CubeIcon,
  MouseScroll01Icon,
  DashboardSpeed01Icon,
  AccessibilityIcon,
  DashboardSquare01Icon,
];

export default function Craft() {
  return (
    <section
      id="craft"
      className="border-t border-[var(--color-line)] px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-20 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <MaskText
            as="h2"
            text={craft.intro}
            className="max-w-[18ch] text-[clamp(1.75rem,4vw,3.25rem)] font-medium leading-[1.1] tracking-tight"
          />
          <Reveal delay={0.15}>
            <p className="eyebrow">Principles that guide the work</p>
          </Reveal>
        </div>

        <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {craft.disciplines.map((d, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={d.title} delay={(i % 3) * 0.06}>
                <article className="flex flex-col gap-4">
                  <HugeiconsIcon
                    icon={Icon}
                    size={24}
                    strokeWidth={1.5}
                    className="text-[var(--color-ink)]"
                  />
                  <h3 className="text-lg font-medium tracking-tight">
                    {d.title}
                  </h3>
                  <p className="max-w-[34ch] text-sm leading-relaxed text-[var(--color-muted)]">
                    {d.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
