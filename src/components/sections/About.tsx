import AboutChoreo from "@/components/sections/AboutChoreo";
import LocalTime from "@/components/ui/LocalTime";
import Portrait from "@/components/ui/Portrait";
import { about, site } from "@/lib/content";

// split the statement so a key phrase carries the signature italic emphasis
const EMPHASIS = "looks and feels";
const [stmtBefore, stmtAfter] = about.statement.split(EMPHASIS);

/**
 * About, composed as a gallery wall: the statement is the wall text, the
 * portrait hangs as a framed print, and beside it, level with its lower edge,
 * sits the wall label (name, the facts, and where he is right now), the way a
 * museum labels a work. The paragraphs read beside the print. Its entrance is
 * choreographed in AboutChoreo; the `data-a` hooks are its cues.
 */
export default function About() {
  return (
    <section
      id="about"
      className="border-t border-[var(--color-line)] px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
    >
      <AboutChoreo id="about" />
      <div className="mx-auto w-full max-w-[1360px]">
        {/* the wall text */}
        <h2
          data-a="stmt"
          className="max-w-[34ch] text-[clamp(1.85rem,3.2vw,3.1rem)] font-medium leading-[1.16] tracking-[-0.022em] text-[var(--color-ink)]"
        >
          {stmtBefore}
          <em className="font-normal italic text-[var(--color-muted)]">{EMPHASIS}</em>
          {stmtAfter}
        </h2>

        <div
          data-a="wall"
          className="mt-14 grid gap-12 sm:mt-16 lg:mt-24 lg:grid-cols-12 lg:gap-x-8"
        >
          {/* the print */}
          <div data-a="print" className="lg:col-span-4">
            <Portrait />
          </div>

          <div className="flex flex-col lg:col-span-7 lg:col-start-6 lg:pt-2">
            {/* the reading beside it */}
            <div className="flex max-w-[56ch] flex-col gap-6">
              {about.paragraphs.map((para, i) => (
                <p
                  key={i}
                  data-a="para"
                  className={`text-[1.02rem] leading-[1.7] ${
                    i === 0 ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]"
                  }`}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* the wall label, hung level with the foot of the print */}
            <aside
              data-a="label"
              aria-label={`About ${site.name}`}
              className="mt-14 max-w-[27rem] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-5 pb-4 pt-5 sm:px-6 lg:mt-auto"
            >
              <p
                data-a="name"
                className="font-[family-name:var(--font-display)] text-[1.2rem] leading-tight tracking-[-0.01em] text-[var(--color-ink)]"
              >
                {site.name}
              </p>
              <dl className="relative mt-4">
                {/* each rule is its own element so it can draw across */}
                <span
                  data-a="rule"
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left bg-[var(--color-line)]"
                />
                {about.facts.map((f) => (
                  <div key={f.k} className="relative">
                    <div
                      data-a="row"
                      className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-2.5"
                    >
                      <dt className="text-[0.78rem] text-[var(--color-muted)]">{f.k}</dt>
                      <dd className="text-[0.9rem] text-[var(--color-ink)]">{f.v}</dd>
                    </div>
                    <span
                      data-a="rule"
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--color-line)]"
                    />
                  </div>
                ))}
              </dl>
              <p
                data-a="status"
                className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem] text-[var(--color-muted)]"
              >
                <span
                  data-a="dot"
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]"
                />
                {site.status}
                <span aria-hidden className="text-[var(--color-faint)]">
                  ·
                </span>
                <LocalTime />
              </p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
