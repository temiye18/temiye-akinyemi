"use client";

import { useThreeD } from "@/components/providers/ThreeDMode";

/** Segmented 2D / 3D view-mode control. */
export default function Mode2D3DToggle() {
  const { enabled, setEnabled } = useThreeD();

  const base =
    "px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.14em] rounded-full transition-colors duration-300";
  const activeCls = "bg-[var(--color-ink)] text-[var(--color-ground)]";
  const idleCls = "text-[var(--color-faint)] hover:text-[var(--color-ink)]";

  return (
    <div
      role="group"
      aria-label="View mode"
      className="liquid-glass liquid-glass-interactive relative flex items-center rounded-full p-0.5"
    >
      <button
        type="button"
        data-cursor-target
        aria-pressed={!enabled}
        onClick={() => setEnabled(false)}
        className={`${base} ${!enabled ? activeCls : idleCls}`}
      >
        2D
      </button>
      <button
        type="button"
        data-cursor-target
        aria-pressed={enabled}
        onClick={() => setEnabled(true)}
        className={`${base} ${enabled ? activeCls : idleCls}`}
      >
        3D
      </button>
    </div>
  );
}
