/**
 * A looping ambient playlist with equal-power-ish crossfades. Two <audio>
 * elements ping-pong through a shared AnalyserNode (so the visualizer keeps
 * reading the sound): the current track fades out while the next fades in over
 * the last few seconds, then the loop repeats. Same-origin files only, so the
 * analyser is never tainted. Created lazily on the first user gesture.
 */
type Slot = {
  el: HTMLAudioElement;
  gain: GainNode;
  index: number; // which track is loaded, or -1
};

export class AmbientPlaylist {
  private ctx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private slots: Slot[] = [];
  private active = 0;
  private raf = 0;
  private transitioning = false;
  private running = false;

  constructor(
    private tracks: string[],
    private volume = 0.5,
    private crossfade = 5, // seconds
  ) {}

  getAnalyser() {
    return this.analyserNode;
  }

  private build() {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;
    analyser.connect(ctx.destination);
    this.analyserNode = analyser;

    for (let i = 0; i < 2; i++) {
      const el = new Audio();
      el.preload = "auto";
      el.loop = false;
      el.setAttribute("aria-hidden", "true");
      document.body.appendChild(el);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(el).connect(gain).connect(analyser);
      this.slots.push({ el, gain, index: -1 });
    }
  }

  private load(slot: number, trackIndex: number) {
    const s = this.slots[slot];
    if (s.index !== trackIndex) {
      s.el.src = this.tracks[trackIndex];
      s.el.load();
      s.index = trackIndex;
    }
  }

  private ramp(gain: GainNode, target: number, secs: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(target, t + secs);
  }

  async start() {
    if (!this.ctx) this.build();
    const ctx = this.ctx!;
    if (ctx.state === "suspended") await ctx.resume();

    if (this.slots[this.active].index < 0) {
      // fresh start: first track from the top
      this.active = 0;
      this.load(0, 0);
      const s = this.slots[0];
      s.el.currentTime = 0;
      await s.el.play(); // rejects (→ caller falls back) if it can't load
      this.running = true;
      this.ramp(s.gain, this.volume, 1.5);
      // preload the next track into the idle slot
      this.load(1, 1 % this.tracks.length);
    } else {
      // resume where we paused
      this.running = true;
      const s = this.slots[this.active];
      if (s.el.paused) await s.el.play();
      this.ramp(s.gain, this.volume, 1.2);
    }
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.monitor);
  }

  private monitor = () => {
    if (!this.running) return;
    const el = this.slots[this.active].el;
    const left = el.duration - el.currentTime;
    if (
      !this.transitioning &&
      isFinite(el.duration) &&
      el.duration > 0 &&
      left <= this.crossfade
    ) {
      void this.crossfadeToNext();
    }
    this.raf = requestAnimationFrame(this.monitor);
  };

  private async crossfadeToNext() {
    this.transitioning = true;
    const cur = this.active;
    const nxt = 1 - cur;
    const nextTrack = (this.slots[cur].index + 1) % this.tracks.length;

    this.load(nxt, nextTrack);
    const ns = this.slots[nxt];
    ns.el.currentTime = 0;
    try {
      await ns.el.play();
    } catch {
      this.transitioning = false;
      return;
    }
    this.ramp(ns.gain, this.volume, this.crossfade);
    this.ramp(this.slots[cur].gain, 0, this.crossfade);
    this.active = nxt;

    // once the outgoing track is silent, park it and preload what comes after
    const outgoing = this.slots[cur].el;
    window.setTimeout(() => {
      if (this.active !== cur) {
        outgoing.pause();
        outgoing.currentTime = 0;
        this.load(cur, (nextTrack + 1) % this.tracks.length);
      }
      this.transitioning = false;
    }, this.crossfade * 1000 + 300);
  }

  async stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    for (const s of this.slots) this.ramp(s.gain, 0, 1);
    window.setTimeout(() => {
      if (!this.running) for (const s of this.slots) s.el.pause();
    }, 1100);
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    for (const s of this.slots) {
      s.el.pause();
      s.el.remove();
    }
    this.slots = [];
    try {
      void this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.ctx = null;
  }
}
