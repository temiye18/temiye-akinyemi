import { HugeiconsIcon } from "@hugeicons/react";
import {
  SourceCodeIcon,
  ServerStack01Icon,
  AiBrain01Icon,
  Activity01Icon,
  CreditCardIcon,
  DashboardSpeed01Icon,
} from "@hugeicons/core-free-icons";
import {
  siTypescript,
  siReact,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siRedis,
  siSocketdotio,
  siDocker,
  siGooglegemini,
  siTailwindcss,
  siStripe,
} from "simple-icons";
import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import DrawLine from "@/components/motion/DrawLine";
import { capabilities } from "@/lib/content";

const ICONS = [
  SourceCodeIcon,
  ServerStack01Icon,
  AiBrain01Icon,
  Activity01Icon,
  CreditCardIcon,
  DashboardSpeed01Icon,
];

// brand marks for the toolkit, keyed by the tool name in content
const LOGOS: Record<string, { path: string }> = {
  TypeScript: siTypescript,
  React: siReact,
  "Next.js": siNextdotjs,
  "Node.js": siNodedotjs,
  PostgreSQL: siPostgresql,
  Prisma: siPrisma,
  Redis: siRedis,
  "Socket.IO": siSocketdotio,
  Docker: siDocker,
  "Google Gemini": siGooglegemini,
  "Tailwind CSS": siTailwindcss,
  Stripe: siStripe,
};

// hover color per mark. Brands whose identity is black/white keep the theme ink
// so they stay visible on both themes; the rest reveal their real brand hex.
const BRAND: Record<string, string> = {
  TypeScript: "#3178C6",
  React: "#61DAFB",
  "Next.js": "var(--color-ink)",
  "Node.js": "#5FA04E",
  PostgreSQL: "#4169E1",
  Prisma: "var(--color-ink)",
  Redis: "#FF4438",
  "Socket.IO": "var(--color-ink)",
  Docker: "#2496ED",
  "Google Gemini": "#8E75B2",
  "Tailwind CSS": "#06B6D4",
  Stripe: "#635BFF",
};

function ToolMark({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="currentColor"
      aria-hidden
      className="shrink-0"
    >
      <path d={path} />
    </svg>
  );
}

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

        {/* toolkit — the stack, as brand marks */}
        <div className="mt-24">
          <Reveal className="mb-6">
            <p className="eyebrow">Toolkit</p>
          </Reveal>
          <Reveal delay={0.05}>
            <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-3 lg:grid-cols-4">
              {capabilities.toolkit.map((name) => {
                const logo = LOGOS[name];
                return (
                  <li
                    key={name}
                    style={
                      {
                        "--brand": BRAND[name] ?? "var(--color-ink)",
                      } as React.CSSProperties
                    }
                    className="group flex items-center gap-3.5 bg-[var(--color-surface)] px-6 py-6"
                  >
                    {logo && (
                      <span className="text-[var(--color-faint)] transition-[color,transform] duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:[color:var(--brand)]">
                        <ToolMark path={logo.path} />
                      </span>
                    )}
                    <span className="text-sm text-[var(--color-ink)]">
                      {name}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
