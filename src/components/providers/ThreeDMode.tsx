"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Ctx = { enabled: boolean; setEnabled: (v: boolean) => void };

const ThreeDContext = createContext<Ctx>({
  enabled: false,
  setEnabled: () => {},
});

export function useThreeD() {
  return useContext(ThreeDContext);
}

/**
 * Global 2D / 3D view mode. In 3D the whole page floats as one plane that
 * orbits gently when idle (see <SpacePlane>). It is a distinct viewing mode,
 * not an overlay: in 3D the scroll-pinned coverflow yields to a calm horizontal
 * scroll so the two never fight over the same layout. Default is 2D; the choice
 * is remembered per browser.
 */
export default function ThreeDProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabledState] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("view-mode") === "3d";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.viewMode = enabled ? "3d" : "2d";
  }, [enabled]);

  const setEnabled = (v: boolean) => {
    setEnabledState(v);
    try {
      localStorage.setItem("view-mode", v ? "3d" : "2d");
    } catch {
      /* ignore */
    }
  };

  return (
    <ThreeDContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </ThreeDContext.Provider>
  );
}
