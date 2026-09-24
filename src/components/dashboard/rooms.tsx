"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Github01Icon,
  Linkedin01Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import { site, about, projects, capabilities, experience } from "@/lib/content";
import EmailLink from "@/components/ui/EmailLink";
import LocalTime from "@/components/ui/LocalTime";
import SignalGraphic from "@/components/ui/SignalGraphic";
import { shotUrl } from "@/lib/preview";

/**
 * The five rooms of the dashboard house. Each is a full-size composition that
 * fills its panel when the panel is slid open; the house (Dashboard.tsx) owns
 * the track, these own the content. Every room reads from content.ts.
 */

export type RoomProps = {
  index: number;
  go: (i: number) => void;
  enterSite: (href: string) => void;
  next: Room;
};

export type Room = {
  id: string;
  label: string;
  href: string;
  /** a real, labelled count set at the foot of the panel's spine */
  count?: string;
  tone: "surface" | "surface-2" | "surface-3" | "inverse";
  Content: (p: RoomProps) => React.ReactNode;
};


/** A line of names joined by hairline joints. Each joint leads its name and
 *  the row is shifted under a clip, so no line ever starts with a joint. */
function Joined({ items, className = "" }: { items: readonly string[]; className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <ul className="-ml-[0.7rem] flex flex-wrap gap-y-1.5">
        {items.map((it) => (
          <li key={it} className="border-l border-[var(--color-line-strong)] px-[0.65rem] leading-tight">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Shared room frame: title flush to the plane's top edge, body, and a foot
 * with the two ways onward (into the site, or to the next panel).
 * ------------------------------------------------------------------ */
function RoomFrame({
  title,
  children,
  href,
  next,
  index,
  go,
  enterSite,
  wide = false,
}: RoomProps & { title: React.ReactNode; children: React.ReactNode; href: string; wide?: boolean }) {
  const last = index === ROOMS.length - 1;
  return (
    <div className="house-body flex min-h-full flex-col lg:h-full px-5 pb-4 pt-6 sm:px-8 sm:pt-8 lg:px-9 lg:pt-8">
      <h2
        className={`font-[family-name:var(--font-display)] font-medium leading-[1.02] tracking-[-0.025em] text-[var(--color-ink)] ${
          wide ? "max-w-[24ch]" : "max-w-[18ch]"
        } text-[clamp(1.9rem,3.1vw,3.1rem)]`}
      >
        {title}
      </h2>
      <div className="mt-6 flex-1 lg:mt-7" style={{ "--i": 1 } as React.CSSProperties}>
        {children}
      </div>
      <div
        className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--color-line)] pt-3.5"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <button
          type="button"
          onClick={() => enterSite(href)}
          className="house-link inline-flex items-center gap-1.5 text-[0.76rem] text-[var(--color-muted)]"
        >
          Open on the site
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          onClick={() => go(last ? 0 : index + 1)}
          className="house-link group/next inline-flex items-center gap-2 text-[0.76rem] text-[var(--color-muted)]"
        >
          <span>
            {last ? "Back to" : "Next"}{" "}
            <em className="font-[family-name:var(--font-display)] text-[0.95rem] text-[var(--color-ink)]">
              {next.label.toLowerCase()}
            </em>
          </span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={14}
            strokeWidth={1.8}
            className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/next:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Work: an index of four, and a detail plane that slides to the one you
 * point at. The selection is a plane too: it slides behind the list.
 * ------------------------------------------------------------------ */
function WorkRoom(props: RoomProps) {
  const [sel, setSel] = useState(0);
  const intent = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(intent.current), []);

  const hover = (i: number, e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => setSel(i), 90);
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const n = (sel + (e.key === "ArrowDown" ? 1 : -1) + projects.length) % projects.length;
    setSel(n);
    const list = e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
    list[n]?.focus();
  };

  return (
    <RoomFrame
      {...props}
      href="#work"
      title={
        <>
          Selected <em className="font-normal text-[var(--color-muted)]">work.</em>
        </>
      }
    >
      <div
        className="grid border-t border-[var(--color-line)] lg:h-full lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]"
        style={{ "--sel": sel } as React.CSSProperties}
      >
        <div
          role="group"
          aria-label="Projects"
          onKeyDown={onListKey}
          onPointerLeave={() => window.clearTimeout(intent.current)}
          className="relative lg:grid lg:h-full lg:grid-rows-4 lg:border-r lg:border-[var(--color-line)]"
        >
          {/* the selection plane, a quarter of the column, sliding behind the rows */}
          <span aria-hidden className="work-sel pointer-events-none absolute inset-x-0 top-0">
            <span className="absolute inset-y-0 left-0 w-[2px] bg-[var(--color-ink)]" />
          </span>
          {projects.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              aria-pressed={sel === i}
              onClick={() => setSel(i)}
              onPointerEnter={(e) => hover(i, e)}
              className="relative grid h-[4.6rem] w-full grid-cols-[minmax(0,1fr)_auto] content-center items-baseline gap-x-3 border-b border-[var(--color-line)] px-5 text-left lg:h-auto"
            >
              <span className="lean min-w-0 font-[family-name:var(--font-display)] text-[clamp(1.06rem,1.25vw,1.3rem)] leading-tight text-[var(--color-ink)]" data-on={sel === i || undefined}>
                <span className="lean-roman truncate">{p.title}</span>
                <span className="lean-italic truncate italic">{p.title}</span>
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[0.62rem] text-[var(--color-faint)]">{p.year}</span>
              <span className="col-span-2 mt-1 truncate text-[0.76rem] text-[var(--color-muted)]">
                {p.discipline}
              </span>
            </button>
          ))}
        </div>

        {/* the detail planes, one per project, stacked on a vertical track */}
        <div className="relative mt-6 lg:mt-0 lg:overflow-hidden">
          <div className="work-track lg:absolute lg:inset-0">
            {projects.map((p, i) => (
              <article
                key={p.slug}
                inert={sel !== i ? true : undefined}
                aria-hidden={sel !== i || undefined}
                className={`flex flex-col lg:absolute lg:inset-x-0 lg:h-full lg:overflow-y-auto lg:pl-7 lg:pt-5 ${sel === i ? "" : "max-lg:hidden"}`}
                style={{ top: `${i * 100}%` }}
                data-lenis-prevent
              >
                <h3
                  className="font-[family-name:var(--font-display)] text-[clamp(1.6rem,2.2vw,2.2rem)] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)]"
                  style={sel === i ? { viewTransitionName: `title-${p.slug}` } : undefined}
                >
                  {p.title}
                </h3>
                <p className="mt-1.5 text-[0.78rem] text-[var(--color-muted)]">
                  {p.discipline}
                  <span className="text-[var(--color-faint)]">
                    {" · "}
                    {p.role} · {p.timeline}
                  </span>
                </p>
                <p className="mt-4 max-w-[58ch] text-[0.9rem] leading-relaxed text-[var(--color-ink)]">{p.blurb}</p>
                <ul className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-[0.78rem] leading-snug text-[var(--color-muted)]">
                      <span aria-hidden className="mt-[0.55em] h-px w-2.5 shrink-0 bg-[var(--color-line-strong)]" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Joined items={p.stack} className="mt-4 text-[0.74rem] text-[var(--color-muted)]" />
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 pb-1">
                  <Link href={`/work/${p.slug}`} className="house-btn" data-variant="solid">
                    <span>Read the case</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.8} />
                  </Link>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="house-link inline-flex items-center gap-1 text-[0.78rem] text-[var(--color-muted)]">
                      Live site
                      <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={1.8} />
                    </a>
                  )}
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noopener noreferrer" className="house-link inline-flex items-center gap-1 text-[0.78rem] text-[var(--color-muted)]">
                      Source
                      <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={1.8} />
                    </a>
                  )}
                </div>
                <div className="relative mt-5 aspect-[16/10] w-full overflow-hidden border border-[var(--color-line-strong)] bg-[var(--color-ground)] lg:mb-5 lg:aspect-auto lg:min-h-[9rem] lg:flex-1">
                  <div
                    className="house-still absolute inset-0"
                    style={sel === i ? { viewTransitionName: `shot-${p.slug}` } : undefined}
                  >
                    {p.url ? (
                      <Image
                        src={p.preview ?? shotUrl(p.url)}
                        alt={`${p.title} landing page`}
                        fill
                        unoptimized={!p.preview}
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover object-top"
                      />
                    ) : (
                      <SignalGraphic />
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </RoomFrame>
  );
}

/* ------------------------------------------------------------------ *
 * About: the statement, the two paragraphs, and the facts as a row of
 * joined cells.
 * ------------------------------------------------------------------ */
const EMPHASIS = "looks and feels";
const [stmtBefore, stmtAfter] = about.statement.split(EMPHASIS);

function AboutRoom(props: RoomProps) {
  return (
    <RoomFrame
      {...props}
      href="#about"
      wide
      title={
        <span className="block text-[clamp(1.45rem,2.05vw,2.15rem)] leading-[1.22] tracking-[-0.015em]">
          {stmtBefore}
          <em className="font-normal text-[var(--color-muted)]">{EMPHASIS}</em>
          {stmtAfter}
        </span>
      }
    >
      <div className="flex h-full flex-col justify-end">
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
        {about.paragraphs.map((para) => (
          <p key={para.slice(0, 16)} className="max-w-[46ch] text-[0.86rem] leading-relaxed text-[var(--color-muted)]">
            {para}
          </p>
        ))}
      </div>
      <dl className="mt-7 grid grid-cols-2 border-t border-[var(--color-line)] xl:grid-cols-4">
        {about.facts.map((f, i) => (
          <div
            key={f.k}
            className={`border-b border-[var(--color-line)] py-3.5 pr-4 ${i % 2 ? "border-l pl-4" : ""} ${
              i > 0 ? "xl:border-l xl:pl-4" : ""
            } xl:border-b-0`}
          >
            <dt className="text-[0.7rem] text-[var(--color-faint)]">{f.k}</dt>
            <dd className="mt-1 text-[0.9rem] text-[var(--color-ink)]">{f.v}</dd>
          </div>
        ))}
      </dl>
      </div>
    </RoomFrame>
  );
}

/* ------------------------------------------------------------------ *
 * Capabilities: a ledger of six, then the toolkit set as one joined line.
 * ------------------------------------------------------------------ */
function CapabilitiesRoom(props: RoomProps) {
  return (
    <RoomFrame
      {...props}
      href="#capabilities"
      title={
        <>
          What I <em className="font-normal text-[var(--color-muted)]">bring</em> to the work.
        </>
      }
    >
      <div className="flex h-full flex-col">
      <ul className="border-t border-[var(--color-line)]">
        {capabilities.disciplines.map((d) => (
          <li
            key={d.title}
            className="grid gap-1 border-b border-[var(--color-line)] py-3.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:gap-6"
          >
            <span className="text-[0.9rem] font-medium text-[var(--color-ink)]">{d.title}</span>
            <span className="text-[0.8rem] leading-snug text-[var(--color-muted)]">{d.body}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 grid gap-2 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:gap-6 lg:mt-auto">
        <p className="text-[0.74rem] text-[var(--color-faint)]">Toolkit</p>
        <Joined items={capabilities.toolkit} className="text-[0.84rem] text-[var(--color-ink)]" />
      </div>
      </div>
    </RoomFrame>
  );
}

/* ------------------------------------------------------------------ *
 * Experience: the record, most recent first; the current role says so.
 * ------------------------------------------------------------------ */
function ExperienceRoom(props: RoomProps) {
  return (
    <RoomFrame
      {...props}
      href="#experience"
      title={
        <>
          A <em className="font-normal text-[var(--color-muted)]">record</em> of the work.
        </>
      }
    >
      <ol className="border-t border-[var(--color-line)]">
        {experience.map((r) => {
          const current = /present/i.test(r.period);
          return (
            <li
              key={`${r.company}-${r.period}`}
              className="grid gap-x-6 gap-y-1 border-b border-[var(--color-line)] py-3.5 sm:grid-cols-[minmax(0,10.5rem)_minmax(0,1fr)]"
            >
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed text-[var(--color-faint)]">
                  {r.period}
                </p>
                {current && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[0.7rem] text-[var(--color-ink)]">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]" />
                    Current role
                  </p>
                )}
              </div>
              <div>
                <p className="flex flex-wrap items-baseline gap-x-2.5">
                  <span className="font-[family-name:var(--font-display)] text-[1.15rem] leading-tight text-[var(--color-ink)]">
                    {r.company}
                  </span>
                  <span className="text-[0.76rem] text-[var(--color-muted)]">{r.role}</span>
                </p>
                <p className="mt-1.5 max-w-[66ch] text-[0.8rem] leading-snug text-[var(--color-muted)]">{r.blurb}</p>
                <p className="mt-1.5 text-[0.7rem] text-[var(--color-faint)]">{r.tags.join(" · ")}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </RoomFrame>
  );
}

/* ------------------------------------------------------------------ *
 * Contact: the one solid plane in the house.
 * ------------------------------------------------------------------ */
const SOCIAL_ICONS: Record<string, typeof Github01Icon> = {
  GitHub: Github01Icon,
  LinkedIn: Linkedin01Icon,
  Résumé: File01Icon,
};

function ContactRoom(props: RoomProps) {
  return (
    <RoomFrame
      {...props}
      href="#contact"
      title={
        <span className="block text-[clamp(2.3rem,4.4vw,4.6rem)] leading-[0.98] tracking-[-0.03em]">
          Let&apos;s build
          <em className="block font-normal text-[var(--color-muted)]">something rare.</em>
        </span>
      }
    >
      <div className="flex h-full flex-col justify-end gap-7">
        <div className="house-email">
          <EmailLink email={site.email} />
        </div>
        <div className="grid gap-5 border-t border-[var(--color-line)] pt-5 sm:grid-cols-2">
          <p className="flex items-center gap-2.5 text-[0.82rem] text-[var(--color-muted)]">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-ink)]" />
            <span>
              {site.status}
              <span className="block text-[var(--color-faint)]">
                <LocalTime />
              </span>
            </span>
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
            {site.socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.label] ?? File01Icon;
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="house-link inline-flex items-center gap-2 text-[0.8rem] text-[var(--color-muted)]"
                  >
                    <HugeiconsIcon icon={Icon} size={16} strokeWidth={1.6} />
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </RoomFrame>
  );
}

export const ROOMS: Room[] = [
  { id: "work", label: "Work", href: "#work", count: `${projects.length} projects`, tone: "surface", Content: WorkRoom },
  { id: "about", label: "About", href: "#about", tone: "surface-3", Content: AboutRoom },
  {
    id: "capabilities",
    label: "Capabilities",
    href: "#capabilities",
    count: `${capabilities.disciplines.length} disciplines`,
    tone: "surface-2",
    Content: CapabilitiesRoom,
  },
  {
    id: "experience",
    label: "Experience",
    href: "#experience",
    count: `${experience.length} roles`,
    tone: "surface-3",
    Content: ExperienceRoom,
  },
  { id: "contact", label: "Contact", href: "#contact", tone: "inverse", Content: ContactRoom },
];
