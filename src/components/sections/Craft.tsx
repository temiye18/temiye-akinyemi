import MaskText from "@/components/motion/MaskText";
import Reveal from "@/components/motion/Reveal";
import { craft } from "@/lib/content";

export default function Craft() {
  return (
    <section
      id="craft"
      className="border-t border-[var(--color-line)] px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-16 max-w-[24ch]">
          <Reveal className="mb-8" y={12}>
            <p className="eyebrow flex items-center gap-3 text-[var(--color-faint)]">
              <span className="h-px w-8 bg-[var(--color-line-strong)]" />
              Craft
            </p>
          </Reveal>
          <MaskText
            as="h2"
            text={craft.intro}
            className="text-[clamp(1.75rem,4vw,3.25rem)] font-medium leading-[1.1] tracking-tight"
          />
        </div>

        <div className="grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2 lg:grid-cols-3">
          {craft.disciplines.map((d, i) => (
            <Reveal key={d.title} delay={(i % 3) * 0.06}>
              <article className="flex h-full flex-col gap-3 bg-[var(--color-ground)] p-8 transition-colors duration-300 hover:bg-[var(--color-surface)]">
                <span className="eyebrow text-[var(--color-faint)]">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <h3 className="text-xl font-medium tracking-tight">{d.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  {d.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
