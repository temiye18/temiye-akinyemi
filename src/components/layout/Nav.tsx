"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/lib/content";
import ThemeToggle from "@/components/ui/ThemeToggle";

/**
 * Fixed top navigation. Condenses (blur + hairline) once the hero is scrolled
 * past. Links are cursor targets for the custom cursor.
 */
export default function Nav() {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        condensed
          ? "border-b border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-ground)_78%,transparent)] backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <a
          href="#top"
          data-cursor-target
          className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--color-ink)]"
        >
          {site.name.split(" ")[0]}
          <span className="text-[var(--color-muted)]">.</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                data-cursor-target
                className="eyebrow text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <span className="eyebrow hidden items-center gap-2 text-[var(--color-muted)] sm:flex">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]" />
            {site.status}
          </span>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
