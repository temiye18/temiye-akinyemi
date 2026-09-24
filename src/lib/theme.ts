"use client";

import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

/** Read the theme straight from <html data-theme> (set pre-paint in layout). */
export function useTheme(): Theme {
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

function apply(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* private mode: the attribute alone still themes this visit */
  }
}

/**
 * Switch theme. Where View Transitions exist (and motion is welcome) the new
 * theme spills out as a circle from `origin` (the switch that was pressed),
 * like light filling a room from one lamp. Colour transitions are suspended
 * for the swap so the snapshot holds the finished palette, not a mid-fade.
 */
export function setTheme(next: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
  };
  if (!doc.startViewTransition || reduce) {
    apply(next);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  root.classList.add("theme-swap");
  const vt = doc.startViewTransition(() => apply(next));
  vt.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        {
          duration: 720,
          easing: "cubic-bezier(0.76, 0, 0.24, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
  vt.finished.finally(() => root.classList.remove("theme-swap"));
}

export function toggleTheme(origin?: { x: number; y: number }) {
  const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  setTheme(current === "dark" ? "light" : "dark", origin);
}
