"use client";

import { useSyncExternalStore } from "react";
import { AmbientAudio } from "@/lib/ambientAudio";
import { AmbientPlaylist } from "@/lib/ambientPlaylist";
import { ambientState } from "@/lib/ambientState";

// Looping playlist: plays the first track, then crossfades into the next as it
// ends, and repeats. Falls back to the generative pad if none can load.
const TRACKS = ["/something-there.mp3", "/winterwide.mp3"];
const TRACK_VOLUME = 0.5;

/**
 * App-lifetime ambient sound, decoupled from any one button so the control can
 * live in the nav (desktop deck and mobile menu alike) and the sound carries
 * across route changes. Off by default: autoplay policy, and no one should be
 * ambushed by audio. Publishes playing state and the live analyser through
 * `ambientState` for the WaveformOverlay.
 */
let playlist: AmbientPlaylist | null = null;
let gen: AmbientAudio | null = null;
let busy = false;

async function startPlaylist(): Promise<boolean> {
  try {
    if (!playlist) playlist = new AmbientPlaylist(TRACKS, TRACK_VOLUME);
    await playlist.start();
    ambientState.set({ playing: true, analyser: playlist.getAnalyser() });
    return true;
  } catch {
    return false;
  }
}

async function startGen() {
  if (!gen) gen = new AmbientAudio();
  await gen.start();
  ambientState.set({ playing: true, analyser: gen.getAnalyser() });
}

export async function toggleSound() {
  if (busy) return;
  busy = true;
  try {
    if (ambientState.getSnapshot().playing) {
      ambientState.set({ playing: false });
      await playlist?.stop();
      await gen?.stop();
    } else if (!(await startPlaylist())) {
      await startGen();
    }
  } finally {
    busy = false;
  }
}

export function useSoundPlaying() {
  return useSyncExternalStore(
    ambientState.subscribe,
    () => ambientState.getSnapshot().playing,
    () => false,
  );
}
