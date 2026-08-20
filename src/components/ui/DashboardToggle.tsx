"use client";

import { useUIMode } from "@/components/providers/UIMode";

/** Segmented Site / Dashboard surface control. */
export default function DashboardToggle() {
  const { dashboard, setDashboard } = useUIMode();

  const base =
    "px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.14em] rounded-full transition-colors duration-300";
  const activeCls = "bg-[var(--color-ink)] text-[var(--color-ground)]";
  const idleCls = "text-[var(--color-faint)] hover:text-[var(--color-ink)]";

  return (
    <div
      role="group"
      aria-label="Surface mode"
      className="liquid-glass liquid-glass-interactive relative flex items-center rounded-full p-0.5"
    >
      <button
        type="button"
        data-cursor-target
        aria-pressed={!dashboard}
        onClick={() => setDashboard(false)}
        className={`${base} ${!dashboard ? activeCls : idleCls}`}
      >
        Site
      </button>
      <button
        type="button"
        data-cursor-target
        aria-pressed={dashboard}
        onClick={() => setDashboard(true)}
        className={`${base} ${dashboard ? activeCls : idleCls}`}
      >
        Dashboard
      </button>
    </div>
  );
}
