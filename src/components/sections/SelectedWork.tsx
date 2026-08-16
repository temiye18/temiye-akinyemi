import Link from "next/link";
import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import { projects } from "@/lib/content";

export default function SelectedWork() {
  return (
    <section
      id="work"
      className="border-t border-[var(--color-line)] px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-16 flex items-end justify-between gap-6">
          <MaskText
            as="h2"
            text="Selected Work"
            className="text-[clamp(2rem,5vw,4.5rem)] font-medium leading-none tracking-tight"
          />
          <Reveal delay={0.2}>
            <span className="eyebrow text-[var(--color-faint)]">
              {projects.length.toString().padStart(2, "0")} — Projects
            </span>
          </Reveal>
        </div>

        <ul>
          {projects.map((p, i) => (
            <Reveal key={p.index} delay={i * 0.05}>
              <li>
                <Link
                  href={`/work/${p.slug}`}
                  data-cursor-target
                  className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3 border-t border-[var(--color-line)] py-8 transition-colors last:border-b hover:bg-[var(--color-accent-soft)] sm:grid-cols-[3rem_1fr_auto] sm:gap-x-10 sm:py-10"
                >
                  <span className="eyebrow pt-2 text-[var(--color-faint)] transition-colors group-hover:text-[var(--color-accent)]">
                    {p.index}
                  </span>

                  <div className="min-w-0">
                    <h3
                      style={{ viewTransitionName: `title-${p.slug}` }}
                      className="flex items-center gap-4 text-[clamp(1.75rem,4.5vw,3.75rem)] font-medium leading-[1.05] tracking-tight transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2"
                    >
                      {p.title}
                      {p.signature && (
                        <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-2 py-1 text-[0.6rem] text-[var(--color-accent)]">
                          3D
                        </span>
                      )}
                    </h3>
                    <p className="mt-3 max-w-[52ch] text-[var(--color-muted)]">
                      {p.blurb}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                      {p.stack.map((t) => (
                        <li key={t} className="eyebrow text-[var(--color-faint)]">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="hidden flex-col items-end gap-3 sm:flex">
                    <span className="eyebrow text-[var(--color-muted)]">
                      {p.discipline}
                    </span>
                    <span className="eyebrow text-[var(--color-faint)]">
                      {p.year}
                    </span>
                    <span className="mt-2 text-2xl text-[var(--color-faint)] opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:text-[var(--color-accent)] group-hover:opacity-100">
                      ↗
                    </span>
                  </div>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
