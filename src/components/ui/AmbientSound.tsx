"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { VolumeHighIcon, VolumeOffIcon } from "@hugeicons/core-free-icons";
import { AmbientAudio } from "@/lib/ambientAudio";
import { AmbientPlaylist } from "@/lib/ambientPlaylist";
import { ambientState } from "@/lib/ambientState";

// Looping playlist: plays the first track, then crossfades into the next as it
// ends, and repeats. Falls back to the generative pad if none can load.
const TRACKS = ["/something-there.mp3", "/winterwide.mp3"];
const TRACK_VOLUME = 0.5;

/**
 * A quiet ambient-sound toggle. Off by default (autoplay policy, and no one
 * should be ambushed by audio); one click starts a looping, crossfaded lo-fi
 * playlist through Web Audio. If nothing can load it falls back to a generative
 * lyric-free pad. The active analyser and playing state are published so the
 * WaveformOverlay can visualize the sound. Lives in the layout, so the sound
 * carries across page transitions instead of restarting.
 */
export default function AmbientSound() {
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
      className="group liquid-glass liquid-glass-interactive fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full py-2.5 pl-3.5 pr-4 sm:bottom-6 sm:right-6"
    >
      <HugeiconsIcon
        icon={on ? VolumeHighIcon : VolumeOffIcon}
        size={18}
        strokeWidth={1.8}
        aria-hidden
        className={`shrink-0 transition-colors duration-300 ${
          on
            ? "sound-live text-[var(--color-ink)]"
            : "text-[var(--color-muted)] group-hover:text-[var(--color-ink)]"
        }`}
      />
      <span
        className={`text-[0.7rem] font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${
          on
            ? "text-[var(--color-ink)]"
            : "text-[var(--color-muted)] group-hover:text-[var(--color-ink)]"
        }`}
      >
        {on ? "Sound on" : "Sound off"}
      </span>
    </button>
  );
}
