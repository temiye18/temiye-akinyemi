"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { AmbientAudio } from "@/lib/ambientAudio";
import { AmbientPlaylist } from "@/lib/ambientPlaylist";
import { ambientState } from "@/lib/ambientState";

// Looping playlist: plays the first track, then crossfades into the next as it
// ends, and repeats. Falls back to the generative pad if none can load.
const TRACKS = ["/something-there.mp3", "/winterwide.mp3"];
const TRACK_VOLUME = 0.5;

// per-bar animation timing, so the equalizer reads as organic rather than synced
const BARS = [
  { dur: "0.9s", delay: "0s" },
  { dur: "1.3s", delay: "0.18s" },
  { dur: "0.7s", delay: "0.36s" },
  { dur: "1.1s", delay: "0.1s" },
];

/**
 * A quiet ambient-sound toggle. Off by default (autoplay policy, and no one
 * should be ambushed by audio); one click starts a looping, crossfaded lo-fi
 * playlist through Web Audio. If nothing can load it falls back to a generative
 * lyric-free pad. The active analyser and playing state are published so the
 * WaveformOverlay can visualize the sound. Lives in the layout, so the sound
 * carries across page transitions instead of restarting.
 */
export default function AmbientSound() {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  const playlistRef = useRef<AmbientPlaylist | null>(null);
  const genRef = useRef<AmbientAudio | null>(null);

  useEffect(() => {
    return () => {
      playlistRef.current?.dispose();
      genRef.current?.dispose();
    };
  }, []);

  const startPlaylist = async (): Promise<boolean> => {
    try {
      if (!playlistRef.current)
        playlistRef.current = new AmbientPlaylist(TRACKS, TRACK_VOLUME);
      await playlistRef.current.start();
      ambientState.set({
        playing: true,
        analyser: playlistRef.current.getAnalyser(),
      });
      return true;
    } catch {
      return false;
    }
  };

  const startGen = async () => {
    if (!genRef.current) genRef.current = new AmbientAudio();
    await genRef.current.start();
    ambientState.set({ playing: true, analyser: genRef.current.getAnalyser() });
  };

  const stopAll = async () => {
    ambientState.set({ playing: false });
    await playlistRef.current?.stop();
    await genRef.current?.stop();
  };

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (on) {
        await stopAll();
        setOn(false);
      } else {
        const played = await startPlaylist();
        if (!played) await startGen();
        setOn(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-cursor-target
      aria-pressed={on}
      aria-label={on ? "Mute ambient sound" : "Play ambient sound"}
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-ground)_62%,transparent)] px-3.5 py-2 backdrop-blur-md transition-colors duration-300 hover:border-[var(--color-line-strong)] sm:bottom-6 sm:right-6"
    >
      <span
        data-playing={on && !reduce ? "true" : "false"}
        aria-hidden
        className="eq flex h-3.5 items-end gap-[3px]"
      >
        {BARS.map((b, i) => (
          <span
            key={i}
            className="eq-bar h-full w-[2px] rounded-full bg-[var(--color-ink)]"
            style={{ animationDuration: b.dur, animationDelay: b.delay }}
          />
        ))}
      </span>
      <span className="hidden text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors duration-300 group-hover:text-[var(--color-ink)] sm:inline">
        {on ? "Sound on" : "Sound"}
      </span>
    </button>
  );
}
