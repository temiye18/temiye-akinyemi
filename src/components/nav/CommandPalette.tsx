"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { useTransitionRouter } from "next-view-transitions";
import { nav, projects, site } from "@/lib/content";
import { useThreeD } from "@/components/providers/ThreeDMode";
import { useUIMode } from "@/components/providers/UIMode";
import { toggleTheme, useTheme } from "@/lib/theme";
import { toggleSound, useSoundPlaying } from "@/lib/sound";
import { LensGlyph } from "./Glyphs";

type Item = {
  id: string;
  group: "Go to" | "Work" | "Do" | "Preferences";
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void | "stay";
};

/**
 * Rank a candidate: a prefix beats a word start beats a loose subsequence.
 * Returns -1 when the query's letters don't appear in order at all.
 */
function score(query: string, text: string) {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 100 - t.length * 0.01;
  const word = t.indexOf(" " + q);
  if (word >= 0) return 80 - word * 0.1;
  const at = t.indexOf(q);
  if (at >= 0) return 60 - at * 0.1;
  let i = 0;
  for (const ch of t) if (ch === q[i]) i++;
  return i === q.length ? 30 - t.length * 0.01 : -1;
}

/**
 * ⌘K / Ctrl+K. The whole site from the keyboard: every section and case
 * study, the real actions (copy the address, open the résumé, profiles), and
 * every preference. A combobox over a listbox with an active descendant, so
 * focus never leaves the input; Tab is trapped; Escape or the scrim closes and
 * focus returns to where it came from.
 */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette"
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <PaletteBody onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Mounted fresh for each open, so query, cursor and confirmation start clean. */
function PaletteBody({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const router = useTransitionRouter();
  const theme = useTheme();
  const playing = useSoundPlaying();
  const { enabled: threeD, setEnabled: setThreeD } = useThreeD();
  const { dashboard, setDashboard } = useUIMode();

  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const goSection = (id: string) => {
    const scroll = () => {
      const el = document.getElementById(id);
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: id === "top" ? 0 : -80 });
      else el.scrollIntoView();
    };
    if (dashboard) {
      setDashboard(false);
      // let the site un-hide and Lenis restart before gliding
      window.setTimeout(scroll, 120);
    } else scroll();
  };

  const items: Item[] = useMemo(
    () => [
      { id: "top", group: "Go to", label: "Intro", hint: "Section", run: () => goSection("top") },
      ...nav.map((n) => ({
        id: n.href.slice(1),
        group: "Go to" as const,
        label: n.label,
        hint: "Section",
        run: () => goSection(n.href.slice(1)),
      })),
      ...projects.map((p) => ({
        id: `work-${p.slug}`,
        group: "Work" as const,
        label: p.title,
        hint: p.discipline,
        keywords: `${p.discipline} ${p.stack.join(" ")} case study`,
        run: () => router.push(`/work/${p.slug}`),
      })),
      {
        id: "copy-email",
        group: "Do",
        label: "Copy email address",
        hint: site.email,
        keywords: "contact mail hire",
        run: () => {
          navigator.clipboard?.writeText(site.email).then(
            () => setFlash("copy-email"),
            () => setFlash(null),
          );
          return "stay";
        },
      },
      {
        id: "email",
        group: "Do",
        label: "Write me an email",
        keywords: "contact mail hire",
        run: () => {
          window.location.href = `mailto:${site.email}`;
        },
      },
      ...site.socials.map((s) => ({
        id: `social-${s.label}`,
        group: "Do" as const,
        label: s.label === "Résumé" ? "Open résumé" : `Open ${s.label}`,
        hint: s.label === "Résumé" ? "PDF" : "Profile",
        keywords: "resume cv profile",
        run: () => {
          window.open(s.href, "_blank", "noopener,noreferrer");
        },
      })),
      {
        id: "theme",
        group: "Preferences",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        keywords: "theme mode appearance light dark",
        run: () => toggleTheme(),
      },
      {
        id: "dashboard",
        group: "Preferences",
        label: dashboard ? "Back to the site" : "Dashboard view",
        keywords: "overview bento layout",
        run: () => setDashboard(!dashboard),
      },
      {
        id: "3d",
        group: "Preferences",
        label: threeD ? "Leave 3D space" : "Enter 3D space",
        keywords: "depth orbit perspective",
        run: () => setThreeD(!threeD),
      },
      {
        id: "sound",
        group: "Preferences",
        label: playing ? "Mute ambient sound" : "Play ambient sound",
        keywords: "music audio",
        run: () => void toggleSound(),
      },
    ],
    // goSection closes over lenis/dashboard, which are listed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lenis, router, theme, playing, threeD, dashboard, setDashboard, setThreeD],
  );

  const results = useMemo(() => {
    return items
      .map((it) => ({ it, s: Math.max(score(query, it.label), score(query, `${it.label} ${it.keywords ?? ""} ${it.hint ?? ""}`) - 20) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => (query.trim() ? b.s - a.s : 0))
      .map((r) => r.it);
  }, [items, query]);

  // remember and restore focus; hold the page still while open
  useEffect(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    lenis?.stop();
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      lenis?.start();
      returnFocus.current?.focus?.();
    };
  }, [lenis]);

  // keep the active option in view
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const execute = (item: Item | undefined) => {
    if (!item) return;
    const stay = item.run();
    if (stay !== "stay") onClose();
    else window.setTimeout(onClose, 650);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (results.length ? (c + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(results[cursor]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      // focus stays in the field; the list is driven by aria-activedescendant
      e.preventDefault();
    }
  };

  // a group label heads the first result of each group
  const rows = results.map((it, i) => ({
    it,
    head: i === 0 || results[i - 1].group !== it.group ? it.group : null,
  }));

  return (
    <>
          <button
            type="button"
            aria-label="Close command menu"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-[color-mix(in_srgb,var(--color-ground)_72%,transparent)]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            className="palette relative mx-auto mt-[16vh] w-[min(600px,calc(100vw-2rem))] overflow-hidden rounded-2xl"
            initial={reduce ? false : { opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.985 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-5 py-4">
              <span className="text-[var(--color-faint)]">
                <LensGlyph />
              </span>
              <input
                ref={inputRef}
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={results[cursor] ? `opt-${results[cursor].id}` : undefined}
                aria-autocomplete="list"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                placeholder="Where to?"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent font-[family-name:var(--font-display)] text-[1.25rem] text-[var(--color-ink)] outline-none placeholder:italic placeholder:text-[var(--color-faint)] focus-visible:outline-none"
              />
              <kbd className="deck-kbd">Esc</kbd>
            </div>

            <ul
              ref={listRef}
              id="palette-list"
              role="listbox"
              aria-label="Commands"
              className="max-h-[min(52vh,420px)] overflow-y-auto overscroll-contain px-2 py-2"
              data-lenis-prevent
            >
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-[var(--color-muted)]">
                  Nothing by that name. Try a section, a project, or &ldquo;email&rdquo;.
                </li>
              )}
              {rows.map(({ it, head }, i) => {
                const activeRow = i === cursor;
                return (
                  <li key={it.id} role="presentation">
                    {head && (
                      <p aria-hidden className="eyebrow px-3 pb-1.5 pt-3">
                        {head}
                      </p>
                    )}
                    <div
                      id={`opt-${it.id}`}
                      role="option"
                      aria-selected={activeRow}
                      data-index={i}
                      data-cursor-target
                      onPointerMove={() => cursor !== i && setCursor(i)}
                      onClick={() => execute(it)}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-[0.95rem] transition-colors duration-150 ${
                        activeRow ? "bg-[var(--color-accent-soft)] text-[var(--color-ink)]" : "text-[var(--color-muted)]"
                      }`}
                    >
                      <span className={activeRow && it.group === "Work" ? "font-[family-name:var(--font-display)] italic" : ""}>
                        {flash === it.id ? "Copied to clipboard" : it.label}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 truncate text-xs text-[var(--color-faint)]">
                        {it.hint && <span className="hidden truncate sm:inline">{it.hint}</span>}
                        <kbd className={`deck-kbd transition-opacity duration-150 ${activeRow ? "opacity-100" : "opacity-0"}`}>↵</kbd>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between border-t border-[var(--color-line)] px-5 py-2.5 text-[0.72rem] text-[var(--color-faint)]">
              <span className="flex items-center gap-2">
                <kbd className="deck-kbd">↑</kbd>
                <kbd className="deck-kbd">↓</kbd>
                to move
                <kbd className="deck-kbd ml-2">↵</kbd>
                to open
              </span>
              <span className="font-[family-name:var(--font-display)] italic">{site.name}</span>
            </div>
          </motion.div>
    </>
  );
}
