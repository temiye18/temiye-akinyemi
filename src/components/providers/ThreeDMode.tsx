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
 * Global 2D / 3D view mode. In 3D, content blocks tilt toward the pointer with a
 * gentle idle drift (see <Tilt>). Default is 2D — the calm default is never
 * compromised; 3D is an opt-in, remembered per browser.
 */
export default function ThreeDProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    try {
      setEnabledState(localStorage.getItem("view-mode") === "3d");
    } catch {
      /* ignore */
    }
  }, []);

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
