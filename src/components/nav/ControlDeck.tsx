"use client";

import { useSyncExternalStore } from "react";
import { useThreeD } from "@/components/providers/ThreeDMode";
import { useUIMode } from "@/components/providers/UIMode";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { toggleTheme, useTheme } from "@/lib/theme";
import { toggleSound, useSoundPlaying } from "@/lib/sound";
import { DepthGlyph, LayoutGlyph, LensGlyph, SoundGlyph, ThemeGlyph } from "./Glyphs";

/** Platform-correct modifier, resolved after mount (the server renders ⌘). */
export function useModKey() {
  return useSyncExternalStore(
    () => () => {},
    () => (/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "⌘",
  );
}

/**
 * One deck button: a round, quiet target whose glyph carries the state, a
 * hover wash (opacity only), a small "running" dot when the thing it controls
 * is on, and a label that appears after a beat on hover or keyboard focus.
 */
export function DeckButton({
  label,
  pressed,
  running,
  onPress,
  className = "",
  children,
}: {
  label: string;
  pressed?: boolean;
  running?: boolean;
  onPress: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-cursor-target
      aria-label={label}
      aria-pressed={pressed}
      onClick={onPress}
      className={`deck-btn group relative grid h-9 w-9 place-items-center rounded-full text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-ink)] focus-visible:text-[var(--color-ink)] ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[var(--color-accent-soft)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="relative grid place-items-center">{children}</span>
      <span
        aria-hidden
        className={`absolute bottom-[3px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[var(--color-ink)] transition-[opacity,transform] duration-300 ease-[var(--ease-out-expo)] ${
          running ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />
      <span aria-hidden className="deck-tip">
        {label}
      </span>
    </button>
  );
}

const center = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

export function ThemeSwitch() {
  const theme = useTheme();
  const dark = theme === "dark";
  return (
    <DeckButton
      label={dark ? "Switch to light" : "Switch to dark"}
      onPress={(e) => toggleTheme(center(e))}
    >
      <ThemeGlyph dark={dark} />
    </DeckButton>
  );
}

export function DepthSwitch({ className }: { className?: string }) {
  const { enabled, setEnabled } = useThreeD();
  return (
    <DeckButton
      label={enabled ? "Leave 3D space" : "Enter 3D space"}
      pressed={enabled}
      running={enabled}
      onPress={() => setEnabled(!enabled)}
      className={className}
    >
      <DepthGlyph on={enabled} />
    </DeckButton>
  );
}

export function LayoutSwitch() {
  const { dashboard, setDashboard } = useUIMode();
  return (
    <DeckButton
      label={dashboard ? "Back to the site" : "Dashboard view"}
      pressed={dashboard}
      running={dashboard}
      onPress={() => setDashboard(!dashboard)}
    >
      <LayoutGlyph dashboard={dashboard} />
    </DeckButton>
  );
}

export function SoundSwitch() {
  const playing = useSoundPlaying();
  return (
    <DeckButton
      label={playing ? "Mute ambient sound" : "Play ambient sound"}
      pressed={playing}
      running={playing}
      onPress={() => void toggleSound()}
    >
      <SoundGlyph on={playing} />
    </DeckButton>
  );
}

/**
 * The deck: every preference in one enamel capsule (no live backdrop blur: it
 * floats over the animating hero and would re-blur every frame), led by
 * the command-menu trigger.
 */
export default function ControlDeck({
  onOpenPalette,
  className = "",
}: {
  onOpenPalette: () => void;
  className?: string;
}) {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const mod = useModKey();

  return (
    <div
      role="group"
      aria-label="Site controls"
      className={`deck items-center gap-0.5 rounded-full p-1 ${className}`}
    >
      <button
        type="button"
        data-cursor-target
        onClick={onOpenPalette}
        aria-label="Open command menu"
        aria-keyshortcuts="Control+K Meta+K"
        className="group relative mr-1 hidden h-9 items-center gap-2 rounded-full pl-3 pr-1.5 text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-ink)] xl:flex"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[var(--color-accent-soft)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span className="relative">
          <LensGlyph />
        </span>
        <span className="relative text-[0.8rem]">Jump to</span>
        <span className="relative flex items-center gap-1">
          <kbd className="deck-kbd">{mod}</kbd>
          <kbd className="deck-kbd">K</kbd>
        </span>
      </button>
      <span aria-hidden className="mr-1 hidden h-5 w-px bg-[var(--color-line)] xl:block" />

      <ThemeSwitch />
      {fine && <DepthSwitch className="hidden lg:grid" />}
      <LayoutSwitch />
      <SoundSwitch />
    </div>
  );
}
