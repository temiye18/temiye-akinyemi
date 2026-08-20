"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

type Ctx = { dashboard: boolean; setDashboard: (v: boolean) => void };

const UIModeContext = createContext<Ctx>({
  dashboard: false,
  setDashboard: () => {},
});

export function useUIMode() {
  return useContext(UIModeContext);
}

// External store for the persisted surface mode (the scrolling site vs. the
// dashboard). Same shape as ThreeDMode: useSyncExternalStore renders the server
// snapshot ("site") during hydration, then the client snapshot right after, so
// the toggle never diverges from the actual mode on refresh. A pre-paint script
// in <head> sets data-ui-mode before first paint, and CSS hides the site root
// under it, so a persisted dashboard never flashes the site behind it.
const listeners = new Set<() => void>();

function readDash() {
  try {
    return localStorage.getItem("ui-mode") === "dashboard";
  } catch {
    return false;
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === "ui-mode") cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
function writeMode(v: boolean) {
  document.documentElement.dataset.uiMode = v ? "dashboard" : "site";
  try {
    localStorage.setItem("ui-mode", v ? "dashboard" : "site");
  } catch {
    /* ignore */
  }
  for (const l of listeners) l();
}

/**
 * Global surface mode: the scrolling site (default) or the dashboard overview.
 * Remembered per browser and restored before first paint.
 */
export default function UIModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dashboard = useSyncExternalStore(subscribe, readDash, () => false);

  return (
    <UIModeContext.Provider value={{ dashboard, setDashboard: writeMode }}>
      {children}
    </UIModeContext.Provider>
  );
}
