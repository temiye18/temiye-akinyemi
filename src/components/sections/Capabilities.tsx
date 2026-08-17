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
import DrawLine from "@/components/motion/DrawLine";
import Toolkit from "@/components/sections/Toolkit";
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
        <div className="mb-20 max-w-[24ch]">
          <Reveal className="mb-6" y={12}>
            <p className="eyebrow">Capabilities</p>
          </Reveal>
          <MaskText
            as="h2"
            text={capabilities.intro}
            className="text-[clamp(1.75rem,4vw,3.25rem)] font-medium leading-[1.1] tracking-tight"
          />
        </div>

        {/* disciplines — no scores, no bars; a hairline draws in on scroll */}
        <div className="grid gap-x-16 gap-y-14 md:grid-cols-2">
          {capabilities.disciplines.map((d, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={d.title} delay={(i % 2) * 0.05}>
                <article>
                  <DrawLine className="mb-6" />
                  <div className="flex items-center gap-3">
                    <HugeiconsIcon
                      icon={Icon}
                      size={20}
                      strokeWidth={1.5}
                      className="text-[var(--color-muted)]"
                    />
                    <h3 className="text-lg font-medium tracking-tight">
                      {d.title}
                    </h3>
                  </div>
                  <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-[var(--color-muted)]">
                    {d.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* toolkit — the stack, as brand marks that bloom under the cursor */}
        <div className="mt-24">
          <Reveal className="mb-6">
            <p className="eyebrow">Toolkit</p>
          </Reveal>
          <Toolkit />
        </div>
      </div>
    </section>
  );
}
