"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

type Ctx = { enabled: boolean; setEnabled: (v: boolean) => void };

const ThreeDContext = createContext<Ctx>({
  enabled: false,
  setEnabled: () => {},
});

export function useThreeD() {
  return useContext(ThreeDContext);
}

// External store for the persisted view mode. useSyncExternalStore renders the
// server snapshot (2D) during hydration, then re-renders with the client
// snapshot right after, with no mismatch warning. That is what keeps the toggle
// in step with the actual mode on refresh (the old localStorage-in-useState
// initializer diverged from SSR and React left the toggle stuck on 2D).
const listeners = new Set<() => void>();

function read3d() {
  try {
    return localStorage.getItem("view-mode") === "3d";
  } catch {
    return false;
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === "view-mode") cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
function writeMode(v: boolean) {
  document.documentElement.dataset.viewMode = v ? "3d" : "2d";
  try {
    localStorage.setItem("view-mode", v ? "3d" : "2d");
  } catch {
    /* ignore */
  }
  for (const l of listeners) l();
}

/**
 * Global 2D / 3D view mode. In 3D the whole page floats as one plane that orbits
 * gently when idle (see <SpacePlane>). The choice is remembered per browser and,
 * with the pre-paint script in <head>, restored before first paint so the dotted
 * field never flashes.
 */
export default function ThreeDProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const enabled = useSyncExternalStore(subscribe, read3d, () => false);

  return (
    <ThreeDContext.Provider value={{ enabled, setEnabled: writeMode }}>
      {children}
    </ThreeDContext.Provider>
  );
}
