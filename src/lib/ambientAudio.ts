/**
 * A small generative lo-fi ambient engine (Web Audio). A soft bass walks the
 * roots of a warm 7th-chord loop (Dm7 - Bbmaj7 - Fmaj7 - Cmaj7) while padded
 * chord voices swell and overlap above it, everything rounded off by a low-mid
 * warmth shelf, a bed of gentle tape hiss, and a short, close feedback-delay.
 * No samples, no loop points, no lyrics: warm and present, but still calm.
 * Created lazily on the first user gesture so it respects autoplay policy.
 */

// warm ii-ish loop in D minor, voiced as 7th chords. bass = root, notes = pads.
const CHORDS: { bass: number; notes: number[] }[] = [
  { bass: 73.42, notes: [146.83, 174.61, 220.0, 261.63] }, // Dm7  (D F A C)
  { bass: 116.54, notes: [220.0, 233.08, 293.66, 349.23] }, // Bbmaj7 (A Bb D F)
  { bass: 87.31, notes: [174.61, 220.0, 261.63, 329.63] }, // Fmaj7 (F A C E)
  { bass: 130.81, notes: [196.0, 246.94, 261.63, 329.63] }, // Cmaj7 (G B C E)
];
const SHIMMER = [440.0, 493.88, 587.33];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wetIn: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sources: AudioScheduledSourceNode[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private suspendId: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private chordIndex = 0;

  private build() {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;

    // master → low-mid warmth shelf → gentle low-pass → out
    const master = ctx.createGain();
    master.gain.value = 0;
    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowshelf";
    warmth.frequency.value = 240;
    warmth.gain.value = 4.5;
    const masterLP = ctx.createBiquadFilter();
    masterLP.type = "lowpass";
    masterLP.frequency.value = 2200; // roll off the brittle highs → warmer
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;
    master.connect(warmth).connect(masterLP).connect(analyser).connect(ctx.destination);
    this.master = master;
    this.analyserNode = analyser;

    // very slow filter drift for movement
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.04;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 340;
    lfo.connect(lfoGain).connect(masterLP.frequency);
    lfo.start();
    this.lfo = lfo;

    // short, damped feedback delay — closer and drier than a big ambient wash
    const wetIn = ctx.createGain();
    const delay = ctx.createDelay(1.2);
    delay.delayTime.value = 0.38;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.34;
    const damp = ctx.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 1400;
    const wetOut = ctx.createGain();
    wetOut.gain.value = 0.38;
    wetIn.connect(delay);
    delay.connect(damp);
    damp.connect(feedback);
    feedback.connect(delay);
    damp.connect(wetOut).connect(master);
    this.wetIn = wetIn;

    // tape-hiss bed for warmth/texture (very low level, fades with master)
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const noiseLP = ctx.createBiquadFilter();
    noiseLP.type = "lowpass";
    noiseLP.frequency.value = 1100;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.006;
    noise.connect(noiseLP).connect(noiseGain).connect(master);
    noise.start();
    this.sources.push(noise);
  }

  private voice(
    freq: number,
    dur: number,
    peak: number,
    pan: number,
    type: OscillatorType,
    lpFreq: number,
    wet: boolean,
  ) {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.wetIn) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = rand(-4, 4);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + rand(0.9, 1.7)); // present swell
    g.gain.linearRampToValueAtTime(0, t + dur);

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = lpFreq;
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;

    osc.connect(g).connect(lp).connect(panner);
    panner.connect(this.master);
    if (wet) panner.connect(this.wetIn);
    osc.start(t);
    osc.stop(t + dur + 0.1);
  }

  private nextChord = () => {
    if (!this.running) return;
    const chord = CHORDS[this.chordIndex % CHORDS.length];
    this.chordIndex++;
    const hold = rand(5, 6.5);

    // soft bass root, kept dry so it stays defined and present
    this.voice(chord.bass, hold + 1.5, 0.15, 0, "sine", 320, false);

    // two or three upper voices, gently detuned and panned
    const notes = chord.notes.slice().sort(() => Math.random() - 0.5);
    const count = Math.random() < 0.5 ? 2 : 3;
    for (let i = 0; i < count; i++) {
      this.voice(notes[i], rand(4, 6), rand(0.055, 0.085), rand(-0.5, 0.5), "triangle", 1150, true);
    }

    // occasional high shimmer
    if (Math.random() < 0.3) {
      this.voice(pick(SHIMMER), rand(5, 7), 0.028, rand(-0.6, 0.6), "sine", 1900, true);
    }

    this.timer = setTimeout(this.nextChord, rand(4200, 5600));
  };

  getAnalyser() {
    return this.analyserNode;
  }

  async start() {
    if (!this.ctx) this.build();
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    if (this.suspendId) {
      clearTimeout(this.suspendId);
      this.suspendId = null;
    }
    if (ctx.state === "suspended") await ctx.resume();

    this.running = true;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.2, t + 2); // warmer + a touch louder

    if (this.timer) clearTimeout(this.timer);
    this.nextChord();
  }

  async stop() {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 1.2); // fade out
    this.suspendId = setTimeout(() => {
      if (!this.running) void ctx.suspend();
    }, 1400);
  }

  dispose() {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
    if (this.suspendId) clearTimeout(this.suspendId);
    try {
      void this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.ctx = null;
  }
}
