/**
 * Tiny shared store bridging the audio source (AmbientSound) and the visualizer
 * (WaveformOverlay): whether sound is playing, and the live AnalyserNode to read
 * the waveform from. useSyncExternalStore-friendly (stable server snapshot).
 */
type AmbientSnapshot = { playing: boolean; analyser: AnalyserNode | null };

const SERVER: AmbientSnapshot = { playing: false, analyser: null };
let snapshot: AmbientSnapshot = { playing: false, analyser: null };
const listeners = new Set<() => void>();

export const ambientState = {
  getSnapshot: () => snapshot,
  getServerSnapshot: () => SERVER,
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  set(next: Partial<AmbientSnapshot>) {
    snapshot = { ...snapshot, ...next };
    for (const l of listeners) l();
  },
};
