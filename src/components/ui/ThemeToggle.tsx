"use client";

import { useSyncExternalStore } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun03Icon, Moon02Icon } from "@hugeicons/core-free-icons";

type Theme = "dark" | "light";

/** Read the current theme straight from the <html> data-theme attribute. */
function useTheme(): Theme {
  return useSyncExternalStore(
    (onChange) => {
      const mo = new MutationObserver(onChange);
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      return () => mo.disconnect();
    },
    () =>
      document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark",
    () => "dark",
  );
}

/**
 * Light/dark toggle. Reflects the theme set pre-paint by the inline script in
 * the document head, flips `data-theme` on <html>, and remembers the choice.
 * The attribute is the single source of truth, so no state is mirrored.
 */
export default function ThemeToggle() {
  const theme = useTheme();

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
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
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-colors duration-300 hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
    >
      {/* icon reflects the theme you'll switch TO */}
      {theme === "dark" ? (
        <HugeiconsIcon icon={Sun03Icon} size={16} strokeWidth={1.6} />
      ) : (
        <HugeiconsIcon icon={Moon02Icon} size={16} strokeWidth={1.6} />
      )}
    </button>
  );
}
