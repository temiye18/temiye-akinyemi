"use client";

import { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";
import { useUIMode } from "@/components/providers/UIMode";
import Dashboard from "@/components/dashboard/Dashboard";

/**
 * Switches between the scrolling site (default, server-rendered for SEO) and the
 * dashboard overlay. The site stays mounted underneath but goes inert and hidden
 * while the dashboard is up, so nothing behind it is tabbable or scrollable.
 */
export default function Stage({ children }: { children: React.ReactNode }) {
  const { dashboard } = useUIMode();
  const lenis = useLenis();

  // freeze the site's smooth scroll while the overview is open
  useEffect(() => {
    if (dashboard) lenis?.stop();
    else lenis?.start();
    return () => lenis?.start();
  }, [dashboard, lenis]);

  return (
    <>
      <div id="site-root" inert={dashboard || undefined} aria-hidden={dashboard}>
        {children}
      </div>
      <AnimatePresence>{dashboard && <Dashboard key="dashboard" />}</AnimatePresence>
    </>
  );
}
