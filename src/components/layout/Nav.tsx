"use client";

import { useCallback, useEffect, useState } from "react";
import { useUIMode } from "@/components/providers/UIMode";
import Wordmark from "@/components/nav/Wordmark";
import NavIndex from "@/components/nav/NavIndex";
import ControlDeck from "@/components/nav/ControlDeck";
import CommandPalette from "@/components/nav/CommandPalette";
import MobileMenu, { MenuGlyph } from "@/components/nav/MobileMenu";

/**
 * The nav as one quiet instrument: the name on the left (handed up from the
 * hero), the index centred (Fraunces, the current section in italic, a
 * reading rail beneath), and a single control deck on the right holding every
 * preference plus the ⌘K command menu. A three-column grid keeps the index
 * truly centred however wide the name or deck become. Content fades out
 * beneath a ground-coloured scrim before it meets the bar.
 */
export default function Nav() {
  const { dashboard } = useUIMode();
  const [palette, setPalette] = useState(false);
  const [menu, setMenu] = useState(false);

  const closePalette = useCallback(() => setPalette(false), []);
  const closeMenu = useCallback(() => setMenu(false), []);

  // ⌘K / Ctrl+K from anywhere (a modifier chord, so it never steals typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* soft scrim so scrolled content fades out before it meets the nav */}
        <div
          aria-hidden
          className="nav-scrim pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-[linear-gradient(to_bottom,var(--color-ground)_48%,color-mix(in_srgb,var(--color-ground)_62%,transparent)_72%,transparent)]"
        />
        <nav
          aria-label="Primary"
          className="mx-auto grid max-w-[1360px] grid-cols-[1fr_auto] items-center gap-6 px-5 py-4 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-10"
        >
          <div className="justify-self-start">
            <Wordmark forceExpanded={dashboard} />
          </div>

          <div className="hidden lg:block">{!dashboard && <NavIndex />}</div>

          <div className="flex items-center gap-2 justify-self-end">
            <ControlDeck onOpenPalette={() => setPalette(true)} className="hidden md:flex" />
            <button
              type="button"
              data-cursor-target
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              aria-expanded={menu}
              className="deck grid h-10 w-10 place-items-center rounded-full text-[var(--color-ink)] lg:hidden"
            >
              <MenuGlyph open={false} />
            </button>
          </div>
        </nav>
      </header>

      <CommandPalette open={palette} onClose={closePalette} />
      <MobileMenu open={menu} onClose={closeMenu} />
    </>
  );
}
