"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun03Icon, Moon02Icon } from "@hugeicons/core-free-icons";

type Theme = "dark" | "light";

/**
 * Light/dark toggle. Reads the theme set pre-paint by the inline script in the
 * document head (so there's no flash), flips `data-theme` on <html>, and
 * remembers the choice. Dark is the default world.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
    setTheme(current);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-cursor-target
      aria-label={
        mounted
          ? `Switch to ${theme === "dark" ? "light" : "dark"} theme`
          : "Toggle theme"
      }
      className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-colors duration-300 hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
    >
      {/* icon reflects the theme you'll switch TO */}
      {mounted && theme === "dark" ? (
        <HugeiconsIcon icon={Sun03Icon} size={16} strokeWidth={1.6} />
      ) : (
        <HugeiconsIcon icon={Moon02Icon} size={16} strokeWidth={1.6} />
      )}
    </button>
  );
}
