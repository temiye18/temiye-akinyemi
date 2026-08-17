import { HugeiconsIcon } from "@hugeicons/react";
import {
  SourceCodeIcon,
  ServerStack01Icon,
  AiBrain01Icon,
  Activity01Icon,
  CreditCardIcon,
  DashboardSpeed01Icon,
} from "@hugeicons/core-free-icons";
import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import Meter from "@/components/motion/Meter";
import { capabilities } from "@/lib/content";

const ICONS = [
  SourceCodeIcon,
  ServerStack01Icon,
  AiBrain01Icon,
  Activity01Icon,
  CreditCardIcon,
  DashboardSpeed01Icon,
];

export default function Capabilities() {
  return (
    <section
      id="capabilities"
      className="border-t border-[var(--color-line)] px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto w-full max-w-[1360px]">
        <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Reveal className="mb-6" y={12}>
              <p className="eyebrow">Capabilities</p>
            </Reveal>
            <MaskText
              as="h2"
              text={capabilities.intro}
              className="max-w-[16ch] text-[clamp(1.75rem,4vw,3.25rem)] font-medium leading-[1.1] tracking-tight"
            />
          </div>
        </div>

        <div className="grid gap-x-20 gap-y-16 lg:grid-cols-[1.7fr_1fr]">
          {/* metered disciplines */}
          <div className="flex flex-col gap-11">
            {capabilities.disciplines.map((d, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <Reveal key={d.title} delay={(i % 2) * 0.05}>
                  <article>
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <h3 className="flex items-center gap-3 text-lg font-medium tracking-tight">
                        <HugeiconsIcon
                          icon={Icon}
                          size={19}
                          strokeWidth={1.5}
                          className="text-[var(--color-muted)]"
                        />
                        {d.title}
                      </h3>
                      <span className="eyebrow [font-variant-numeric:tabular-nums]">
                        {d.level}
                      </span>
                    </div>
                    <Meter level={d.level} />
                    <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-[var(--color-muted)]">
                      {d.body}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          {/* toolkit */}
          <Reveal delay={0.1}>
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow mb-6">Toolkit</p>
              <ul className="flex flex-col">
                {capabilities.toolkit.map((tool, i) => (
                  <li
                    key={tool}
                    className="flex items-baseline justify-between gap-4 border-t border-[var(--color-line)] py-3.5 last:border-b"
                  >
                    <span className="text-[var(--color-ink)]">{tool}</span>
                    <span className="eyebrow [font-variant-numeric:tabular-nums]">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
