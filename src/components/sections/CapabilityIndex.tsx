"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
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
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SplitText } from "gsap/SplitText";
import { capabilities } from "@/lib/content";

if (typeof window !== "undefined") gsap.registerPlugin(SplitText);

// brand marks for the toolkit, keyed by the tool name in content (drawn in the
// house ink, never in brand colour)
const LOGOS: Record<string, string> = {
  TypeScript: siTypescript.path,
  React: siReact.path,
  "Next.js": siNextdotjs.path,
  "Node.js": siNodedotjs.path,
  PostgreSQL: siPostgresql.path,
  Prisma: siPrisma.path,
  Redis: siRedis.path,
  "Socket.IO": siSocketdotio.path,
  Docker: siDocker.path,
  "Google Gemini": siGooglegemini.path,
  "Tailwind CSS": siTailwindcss.path,
  Stripe: siStripe.path,
};

const { disciplines, toolkit, intro } = capabilities;

// Which tools each discipline actually uses, read from its own description:
// a tool is linked only where the copy names it, so nothing here is invented.
const LINKS = disciplines.map((d) => toolkit.filter((t) => d.body.includes(t)));
const USED_BY = toolkit.map((t) => LINKS.flatMap((tools, i) => (tools.includes(t) ? [i] : [])));

// the heading's emphasis: the last two words lean into italic
const words = intro.split(" ");
const introHead = words.slice(0, -2).join(" ");
const introTail = words.slice(-2).join(" ");

function Mark({ path, size = 22 }: { path: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}

type Focus = { kind: "discipline" | "tool"; i: number };

/**
 * Capabilities as a working index. Six disciplines set as a ledger, and the
 * toolkit beside them. Point at a discipline (or tap it) and it leans into
 * italic while the tools it uses come up in the toolkit and the rest recede;
 * point at a tool and the disciplines that use it come up instead. Every row
 * also carries its own tools as small marks, so the connection reads on touch
 * and in a screen reader too. All states are opacity only.
 *
 * The entrance plays once: the heading rises line by line, each row's rule
 * draws across as its title arrives, and the toolkit's cells come up in a
 * wave from the first discipline's tools outward.
 */
export default function CapabilityIndex() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(0); // the discipline chosen by click / focus / tap
  const [hover, setHover] = useState<Focus | null>(null);
  const intent = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(intent.current), []);

  const focus: Focus = hover ?? { kind: "discipline", i: pinned };
  const rowLit = (i: number) =>
    focus.kind === "discipline" ? focus.i === i : USED_BY[focus.i].includes(i);
  const toolLit = (t: number) =>
    focus.kind === "tool" ? focus.i === t : LINKS[focus.i].includes(toolkit[t]);

  const point = (f: Focus | null) => {
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => setHover(f), f ? 60 : 120);
  };
  const mouse = (e: React.PointerEvent) => e.pointerType === "mouse";

  // entrance
  useEffect(() => {
    if (reduce) return;
    const root = rootRef.current;
    if (!root) return;
    let split: SplitText | null = null;
    let cancelled = false;
    const ctx = gsap.context(() => {}, root);
    const build = () =>
      ctx.add(() => {
        const q = (s: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-c="${s}"]`));
        const head = q("head")[0];
        if (head) {
          split = SplitText.create(head, { type: "lines", mask: "lines", linesClass: "cap-line" });
          gsap.set(split.lines, { yPercent: 108 });
          gsap.to(split.lines, {
            yPercent: 0,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: { trigger: head, start: "top 82%", once: true },
            onComplete: () => {
              split?.revert();
              split = null;
            },
          });
        }
        const list = q("list")[0];
        const rules = q("rule");
        const rows = q("row");
        if (list) {
          gsap.set(rules, { scaleX: 0 });
          gsap.set(rows, { opacity: 0, y: 14 });
          gsap
            .timeline({ scrollTrigger: { trigger: list, start: "top 80%", once: true } })
            .to(rules, { scaleX: 1, duration: 1, ease: "power3.inOut", stagger: 0.08 }, 0)
            .to(rows, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 }, 0.15);
        }
        const tools = q("tool");
        const grid = q("toolkit")[0];
        if (grid && tools.length) {
          // a wave that starts at the first discipline's tools
          const seeds = LINKS[0].map((t) => toolkit.indexOf(t));
          const cols = 3;
          const order = tools.map((_, t) =>
            Math.min(
              ...seeds.map((s) => Math.hypot((t % cols) - (s % cols), Math.floor(t / cols) - Math.floor(s / cols))),
            ),
          );
          gsap.set(tools, { opacity: 0, y: 12 });
          gsap.to(tools, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "expo.out",
            delay: (i: number) => 0.1 + order[i] * 0.09,
            scrollTrigger: { trigger: grid, start: "top 85%", once: true },
            clearProps: "opacity,transform",
          });
        }
      });
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      build();
      ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
      split?.revert();
      ctx.revert();
    };
  }, [reduce]);

  return (
    <div ref={rootRef} className="cap-index">
      <div className="mb-14 flex flex-col gap-5 sm:mb-20 lg:flex-row lg:items-end lg:justify-between">
        <h2
          data-c="head"
          className="max-w-[20ch] text-[clamp(2rem,4.4vw,4rem)] font-medium leading-[1.04] tracking-[-0.03em]"
        >
          {introHead} <em className="font-normal italic text-[var(--color-muted)]">{introTail}</em>
        </h2>
        <p className="hidden max-w-[30ch] text-sm leading-relaxed text-[var(--color-muted)] lg:pointer-fine:block">
          Point at a discipline to light the tools behind it, or at a tool to see where it
          does its work.
        </p>
      </div>

      <div className="grid gap-16 lg:grid-cols-12 lg:gap-x-10">
        {/* the ledger */}
        <ul
          data-c="list"
          aria-label="Disciplines"
          className="lg:col-span-7"
          onPointerLeave={(e) => mouse(e) && point(null)}
        >
          {disciplines.map((d, i) => {
            const lit = rowLit(i);
            const tools = LINKS[i];
            return (
              <li key={d.title} className="relative">
                <span
                  data-c="rule"
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left bg-[var(--color-line-strong)]"
                />
                <button
                  type="button"
                  data-c="row"
                  data-lit={lit || undefined}
                  aria-pressed={pinned === i}
                  onClick={() => {
                    setPinned(i);
                    setHover(null);
                  }}
                  onFocus={() => setPinned(i)}
                  onPointerEnter={(e) => mouse(e) && point({ kind: "discipline", i })}
                  className="cap-row group grid w-full gap-x-8 gap-y-2 py-6 text-left sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:py-7"
                >
                  <span className="lean font-[family-name:var(--font-display)] text-[clamp(1.45rem,2.3vw,2.1rem)] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]" data-on={lit || undefined}>
                    <span className="lean-roman">{d.title}</span>
                    <span className="lean-italic italic">{d.title}</span>
                  </span>
                  <span className="flex flex-col gap-3">
                    <span className="cap-body text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                      {d.body}
                    </span>
                    {tools.length > 0 && (
                      <span className="cap-marks flex items-center gap-3 text-[var(--color-ink)]">
                        {tools.map((t) => (
                          <Mark key={t} path={LOGOS[t]} size={15} />
                        ))}
                        <span className="sr-only">Uses {tools.join(", ")}</span>
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
          <li aria-hidden className="h-px origin-left bg-[var(--color-line-strong)]" data-c="rule" />
        </ul>

        {/* the toolkit, beside it */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow mb-5">Toolkit</p>
            <ul
              data-c="toolkit"
              aria-label="Toolkit"
              className="grid grid-cols-3 gap-px border border-[var(--color-line)] bg-[var(--color-line)]"
              onPointerLeave={(e) => mouse(e) && point(null)}
            >
              {toolkit.map((name, t) => (
                <li
                  key={name}
                  data-c="tool"
                  data-lit={toolLit(t) || undefined}
                  onPointerEnter={(e) => mouse(e) && point({ kind: "tool", i: t })}
                  className="cap-tool flex aspect-[5/4] flex-col justify-between bg-[var(--color-ground)] p-4 sm:p-5"
                >
                  <span className="text-[var(--color-ink)]">{LOGOS[name] && <Mark path={LOGOS[name]} />}</span>
                  <span className="text-[0.8rem] leading-tight text-[var(--color-ink)]">{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
