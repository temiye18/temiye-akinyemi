"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Geometry, Vec2, Vec4, Color, RenderTarget, Texture } from "ogl";
import { gsap } from "@/lib/gsap";
import { offsetWithin, paintHeadline } from "./paintHeadline";

/**
 * The hero as one lit shot: a warm shaft of tungsten light falling through a
 * dark room, haze drifting in it, dust motes that glitter only when they drift
 * into the light (fine and sharp far away, soft bokeh up close). The name stands
 * in the beam, crisp and never covered: where the light rakes across it the
 * letters warm and glint, and their shapes cast volumetric shadow shafts back
 * into the haze.
 *
 * After the preloader the light strikes (a tungsten flicker), the camera dollies
 * in and the beam sweeps across the name while it racks into focus. The pointer
 * is the gaffer's hand: the beam swings toward it and the air (and the dust)
 * parts around it. Scrolling cranes the camera up through the motes.
 *
 * Passes: a quarter-res shadow march (early-outs outside the beam and away from
 * the letters), the room, then the dust as GPU points; plus a small transparent
 * canvas laid exactly over the letters for the glint. Nothing here sits on top
 * of the name except that glint. Reduced motion never mounts it.
 */

// Shared beam: a soft cone from an off-screen light toward a target, with a
// denser axis. All geometry in hero-local CSS px, top-left origin.
const BEAM = /* glsl */ `
  uniform vec2 uLight;
  uniform vec2 uTarget;
  uniform float uSpread;
  uniform float uCore;
  uniform float uAtten;
  float beamAt(vec2 p, out float core) {
    vec2 d = normalize(uTarget - uLight);
    vec2 v = p - uLight;
    float along = dot(v, d);
    core = 0.0;
    if (along <= 0.0) return 0.0;
    float perp = abs(v.x * d.y - v.y * d.x);
    float w = uCore + along * uSpread;
    core = smoothstep(w * 0.5, 0.0, perp);
    return smoothstep(w, w * 0.18, perp) / (1.0 + along * along * uAtten);
  }
`;

const NOISE = /* glsl */ `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
`;

const QUAD_VERT = /* glsl */ `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// Shadow shafts cast by the name: march toward the light through its silhouette.
const SHAFT_FRAG = /* glsl */ `
  precision highp float;
  uniform vec2 uRt;
  uniform vec2 uSize;
  uniform sampler2D uText;
  uniform vec4 uRect;
  uniform float uShaftLen;
  ${BEAM}
  void main() {
    vec2 p = vec2(gl_FragCoord.x, uRt.y - gl_FragCoord.y) / uRt * uSize;
    float core;
    if (beamAt(p, core) < 0.004) { gl_FragColor = vec4(1.0); return; }
    vec2 toL = uLight - p;
    float L = length(toL);
    vec2 dir = toL / L;
    float len = min(L, uShaftLen);
    vec2 e = p + dir * len;
    vec2 lo = uRect.xy;
    vec2 hi = uRect.xy + uRect.zw;
    if (max(p.x, e.x) < lo.x || min(p.x, e.x) > hi.x || max(p.y, e.y) < lo.y || min(p.y, e.y) > hi.y) {
      gl_FragColor = vec4(1.0);
      return;
    }
    float occ = 0.0;
    float w = 1.0;
    for (int i = 1; i <= 36; i++) {
      vec2 tc = (p + dir * (len * float(i) / 36.0) - uRect.xy) / uRect.zw;
      if (tc.x >= 0.0 && tc.y >= 0.0 && tc.x <= 1.0 && tc.y <= 1.0) occ += texture2D(uText, tc).a * w;
      w *= 0.955;
    }
    float trans = exp(-occ * 0.34);
    gl_FragColor = vec4(trans, trans, trans, 1.0);
  }
`;

// The room: haze in the beam, the name's shadows, a dark falloff to the edges.
const ROOM_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform float uDpr;
  uniform vec3 uGround;
  uniform vec3 uShade;
  uniform vec3 uBeamCol;
  uniform float uBeamMix;
  uniform float uIntensity;
  uniform float uZoom;
  uniform vec2 uPan;
  uniform sampler2D uShafts;
  ${BEAM}
  ${NOISE}
  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 size = uRes / uDpr;
    vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
    float core;
    float b = beamAt(p, core);

    // haze drifts through the air, seen through the camera (dolly + pan)
    vec2 hp = ((p - size * 0.5) * uZoom + size * 0.5 + uPan) / size.y;
    float t = uTime * 0.018;
    vec2 q = vec2(fbm(hp * 2.1 + vec2(t, -t * 0.6)), fbm(hp * 2.1 + vec2(-t * 0.7, t) + 5.2));
    float haze = fbm(hp * 2.8 + q * 1.7 + vec2(t * 0.9, t * 0.35));
    haze = 0.3 + 0.95 * smoothstep(0.22, 0.86, haze);

    float trans = texture2D(uShafts, uv).r;
    float vig = smoothstep(1.3, 0.18, length((uv - vec2(0.4, 0.52)) * vec2(1.2, 1.0)));
    vec3 room = mix(uShade, uGround, vig);

    float light = b * (haze * 0.85 + core * 0.35) * trans * uIntensity;
    vec3 col = mix(room, uBeamCol, clamp(light * uBeamMix, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

// The room is soft (haze, a cone of light), so it's shaded at half resolution
// and upscaled here; only the grain needs every pixel.
const COMPOSITE_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uRoom;
  uniform vec2 uRes;
  uniform float uTime;
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  void main() {
    vec3 col = texture2D(uRoom, gl_FragCoord.xy / uRes).rgb;
    col += (hash(gl_FragCoord.xy + fract(uTime) * 71.0) - 0.5) * 0.02;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// Dust: each mote wanders on its own slow path at its own depth.
const DUST_VERT = /* glsl */ `
  attribute vec4 aSeed;
  uniform float uTime;
  uniform vec2 uSize;
  uniform float uDpr;
  uniform float uZoom;
  uniform vec2 uPan;
  uniform float uScroll;
  uniform vec2 uMouse;
  uniform float uStir;
  uniform float uIntensity;
  ${BEAM}
  varying float vAlpha;
  varying float vNear;
  void main() {
    float z = aSeed.z;
    float t = uTime;
    vec2 drift = vec2(
      sin(t * 0.045 + aSeed.w * 6.283) * 0.035 + sin(t * 0.11 + aSeed.x * 9.0) * 0.008,
      cos(t * 0.038 + aSeed.w * 4.1) * 0.03 - t * 0.0035 * (0.3 + z)
    );
    vec2 p = fract(aSeed.xy + drift) * uSize;
    float par = 0.35 + z * 1.1;
    p = (p - uSize * 0.5) * mix(1.0, uZoom, par) + uSize * 0.5 - uPan * par;
    p.y -= uScroll * uSize.y * (0.12 + z * 0.6);
    vec2 dm = p - uMouse;
    float fall = exp(-dot(dm, dm) / (150.0 * 150.0));
    vec2 dn = dm / max(length(dm), 1.0);
    p += (vec2(-dn.y, dn.x) + dn * 0.6) * fall * uStir * 0.6 * (0.35 + z);

    float core;
    float lit = beamAt(p, core) * uIntensity;
    float twinkle = 0.55 + 0.45 * sin(t * (0.6 + aSeed.w) + aSeed.x * 40.0);
    vAlpha = lit * mix(1.0, 0.16, z * z) * twinkle * (0.6 + core * 0.8);
    vNear = z;
    gl_PointSize = mix(1.4, 11.0, z * z * z) * uDpr;
    vec2 clip = p / uSize * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  }
`;

const DUST_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uDust;
  varying float vAlpha;
  varying float vNear;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    // far motes are pin-sharp points; near ones are soft, out-of-focus discs
    float a = mix(exp(-r * r * 5.0), 1.0 - smoothstep(0.55, 1.0, r), vNear);
    a *= vAlpha;
    gl_FragColor = vec4(uDust * a, a);
  }
`;

// Glint: light raking across the letters, drawn only where they are.
const GLINT_FRAG = /* glsl */ `
  precision highp float;
  uniform vec2 uGRes;
  uniform vec2 uOrigin;
  uniform float uDpr;
  uniform sampler2D uText;
  uniform vec3 uGlint;
  uniform float uGlintK;
  uniform float uIntensity;
  ${BEAM}
  void main() {
    vec2 local = vec2(gl_FragCoord.x, uGRes.y - gl_FragCoord.y) / uDpr;
    float t = texture2D(uText, local / (uGRes / uDpr)).a;
    if (t < 0.01) { gl_FragColor = vec4(0.0); return; }
    float core;
    float b = beamAt(uOrigin + local, core);
    float g = t * clamp(b * (0.4 + core * 1.1), 0.0, 1.0) * uIntensity * uGlintK;
    gl_FragColor = vec4(uGlint * g, g);
  }
`;

type Pal = {
  ground: string;
  shade: string;
  beam: string;
  dust: string;
  glint: string;
  beamMix: number;
  glintK: number;
  dark: boolean;
};

function palette(): Pal {
  const dark = document.documentElement.getAttribute("data-theme") !== "light";
  return dark
    ? { ground: "#0f0e0c", shade: "#070605", beam: "#e8d6b4", dust: "#fff1d8", glint: "#ffdfa6", beamMix: 0.32, glintK: 0.55, dark }
    : { ground: "#f3efe6", shade: "#ddd4c3", beam: "#fffcf4", dust: "#8a7657", glint: "#e8c690", beamMix: 0.75, glintK: 0.5, dark };
}

const PAD = 28; // css px around the headline for the glint / shadow texture

export default function BeamField() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const section = host.closest("section");
    const h1 = section?.querySelector<HTMLElement>("[data-hero-name]") ?? null;
    const wrap = h1?.parentElement ?? null;
    if (!section || !h1 || !wrap) return;
    const fade = h1.closest<HTMLElement>("[data-scroll-fade]");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    // If the shot ever runs over budget on a slower GPU it steps its own
    // resolution down rather than starve the page (scrolling included).
    const QUALITY = [1, 0.75, 0.55];
    let quality = 0;
    let back: Renderer;
    let front: Renderer;
    try {
      back = new Renderer({ alpha: false, dpr, antialias: false });
      front = new Renderer({ alpha: true, premultipliedAlpha: true, dpr, antialias: false });
    } catch {
      return; // no WebGL: the static room and the plain name remain
    }
    const gl = back.gl;
    const fgl = front.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.cssText = "width:100%;height:100%;display:block";
    host.appendChild(canvas);
    const glintCanvas = fgl.canvas as HTMLCanvasElement;
    glintCanvas.setAttribute("aria-hidden", "true");
    glintCanvas.style.cssText = `position:absolute;left:${-PAD}px;top:${-PAD}px;pointer-events:none;`;
    wrap.appendChild(glintCanvas);

    let pal = palette();
    const tri = new Triangle(gl);
    const beamUniforms = () => ({
      uLight: { value: new Vec2() },
      uTarget: { value: new Vec2() },
      uSpread: { value: 0.2 },
      uCore: { value: 50 },
      uAtten: { value: 1.1e-7 },
    });

    // shadows
    let shaftRT = new RenderTarget(gl, { width: 4, height: 4, depth: false });
    const textTex = new Texture(gl, { generateMipmaps: false, flipY: false, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
    const shaftProgram = new Program(gl, {
      vertex: QUAD_VERT,
      fragment: SHAFT_FRAG,
      uniforms: {
        uRt: { value: new Vec2(4, 4) },
        uSize: { value: new Vec2(1, 1) },
        uText: { value: textTex },
        uRect: { value: new Vec4(0, 0, 1, 1) },
        uShaftLen: { value: 400 },
        ...beamUniforms(),
      },
    });
    const shaftMesh = new Mesh(gl, { geometry: tri, program: shaftProgram });

    // room
    const roomProgram = new Program(gl, {
      vertex: QUAD_VERT,
      fragment: ROOM_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new Vec2(1, 1) },
        uDpr: { value: dpr },
        uGround: { value: new Color(pal.ground) },
        uShade: { value: new Color(pal.shade) },
        uBeamCol: { value: new Color(pal.beam) },
        uBeamMix: { value: pal.beamMix },
        uIntensity: { value: 0 },
        uZoom: { value: 1 },
        uPan: { value: new Vec2() },
        uShafts: { value: shaftRT.texture },
        ...beamUniforms(),
      },
    });
    const roomMesh = new Mesh(gl, { geometry: tri, program: roomProgram });
    let roomRT = new RenderTarget(gl, { width: 4, height: 4, depth: false });
    const compositeProgram = new Program(gl, {
      vertex: QUAD_VERT,
      fragment: COMPOSITE_FRAG,
      uniforms: {
        uRoom: { value: roomRT.texture },
        uRes: { value: new Vec2(1, 1) },
        uTime: { value: 0 },
      },
    });
    const compositeMesh = new Mesh(gl, { geometry: tri, program: compositeProgram });

    // dust
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const COUNT = fine && window.innerWidth > 900 ? 1600 : 700;
    const seeds = new Float32Array(COUNT * 4);
    for (let i = 0; i < COUNT; i++) {
      seeds[i * 4] = Math.random();
      seeds[i * 4 + 1] = Math.random();
      // most motes are far; a few drift close to the lens
      seeds[i * 4 + 2] = Math.pow(Math.random(), 1.6);
      seeds[i * 4 + 3] = Math.random();
    }
    const dustGeo = new Geometry(gl, { aSeed: { size: 4, data: seeds } });
    const dustProgram = new Program(gl, {
      vertex: DUST_VERT,
      fragment: DUST_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: new Vec2(1, 1) },
        uDpr: { value: dpr },
        uZoom: { value: 1 },
        uPan: { value: new Vec2() },
        uScroll: { value: 0 },
        uMouse: { value: new Vec2(-9999, -9999) },
        uStir: { value: 0 },
        uIntensity: { value: 0 },
        uDust: { value: new Color(pal.dust) },
        ...beamUniforms(),
      },
    });
    const setDustBlend = () =>
      pal.dark ? dustProgram.setBlendFunc(gl.ONE, gl.ONE) : dustProgram.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    setDustBlend();
    const dustMesh = new Mesh(gl, { mode: gl.POINTS, geometry: dustGeo, program: dustProgram });

    // glint
    const glintTex = new Texture(fgl, { generateMipmaps: false, flipY: false, wrapS: fgl.CLAMP_TO_EDGE, wrapT: fgl.CLAMP_TO_EDGE });
    const glintProgram = new Program(fgl, {
      vertex: QUAD_VERT,
      fragment: GLINT_FRAG,
      uniforms: {
        uGRes: { value: new Vec2(1, 1) },
        uOrigin: { value: new Vec2() },
        uDpr: { value: dpr },
        uText: { value: glintTex },
        uGlint: { value: new Color(pal.glint) },
        uGlintK: { value: pal.glintK },
        uIntensity: { value: 0 },
        ...beamUniforms(),
      },
    });
    const glintMesh = new Mesh(fgl, { geometry: new Triangle(fgl), program: glintProgram });

    const beamPrograms = [shaftProgram, roomProgram, dustProgram, glintProgram];

    // ---- layout ----------------------------------------------------------------
    let W = 1;
    let H = 1;
    let textX = 0;
    let textY = 0;
    let texW = 1;
    let texH = 1;
    let heroTop = 0;
    let heroH = 1;

    const paint = () => {
      const { canvas: tc, w, h } = paintHeadline(h1, dpr, PAD);
      // Shadows come from a small copy of the name: linear filtering softens
      // it, so the shafts fall as soft light, not a comb of hard stripes.
      const occ = document.createElement("canvas");
      occ.width = Math.max(2, Math.round(tc.width / 6));
      occ.height = Math.max(2, Math.round(tc.height / 6));
      const octx = occ.getContext("2d")!;
      octx.imageSmoothingQuality = "high";
      octx.drawImage(tc, 0, 0, occ.width, occ.height);
      textTex.image = occ;
      textTex.needsUpdate = true;
      glintTex.image = tc;
      glintTex.needsUpdate = true;
      texW = w;
      texH = h;
      front.setSize(w, h);
      glintProgram.uniforms.uGRes.value.set(glintCanvas.width, glintCanvas.height);
    };

    const measure = () => {
      W = host.clientWidth;
      H = host.clientHeight;
      back.dpr = dpr * QUALITY[quality];
      back.setSize(W, H);
      compositeProgram.uniforms.uRes.value.set(canvas.width, canvas.height);
      const hw = Math.max(4, Math.round(canvas.width / 2));
      const hh = Math.max(4, Math.round(canvas.height / 2));
      if (roomRT.width !== hw || roomRT.height !== hh) {
        roomRT = new RenderTarget(gl, { width: hw, height: hh, depth: false });
        compositeProgram.uniforms.uRoom.value = roomRT.texture;
      }
      roomProgram.uniforms.uRes.value.set(hw, hh);
      roomProgram.uniforms.uDpr.value = hw / W;
      dustProgram.uniforms.uDpr.value = back.dpr;
      dustProgram.uniforms.uSize.value.set(W, H);
      shaftProgram.uniforms.uSize.value.set(W, H);
      const rw = Math.max(4, Math.round(canvas.width / 4));
      const rh = Math.max(4, Math.round(canvas.height / 4));
      if (shaftRT.width !== rw || shaftRT.height !== rh) {
        shaftRT = new RenderTarget(gl, { width: rw, height: rh, depth: false });
        shaftProgram.uniforms.uRt.value.set(rw, rh);
        roomProgram.uniforms.uShafts.value = shaftRT.texture;
      }
      shaftProgram.uniforms.uShaftLen.value = Math.max(W, H) * 0.5;
      const o = offsetWithin(h1, host);
      textX = o.x - PAD;
      textY = o.y - PAD;
      let top = 0;
      let node: HTMLElement | null = section;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      heroTop = top;
      heroH = section.offsetHeight;
      paint();
    };

    const applyPalette = () => {
      pal = palette();
      roomProgram.uniforms.uGround.value = new Color(pal.ground);
      roomProgram.uniforms.uShade.value = new Color(pal.shade);
      roomProgram.uniforms.uBeamCol.value = new Color(pal.beam);
      roomProgram.uniforms.uBeamMix.value = pal.beamMix;
      dustProgram.uniforms.uDust.value = new Color(pal.dust);
      glintProgram.uniforms.uGlint.value = new Color(pal.glint);
      glintProgram.uniforms.uGlintK.value = pal.glintK;
      setDustBlend();
    };
    const mo = new MutationObserver(applyPalette);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // ---- the shot ---------------------------------------------------------------
    // Light enters from beyond the top-left; at rest the beam falls across the
    // name and on toward the lower right.
    const light = { x: 0, y: 0 };
    const rest = () => ({ x: W * 0.68, y: H * 1.02 });
    const aim = { x: 0, y: 0 };
    const aimTarget = { x: 0, y: 0 };
    const pan = { x: 0, y: 0 };
    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999 };
    let stir = 0;
    let hover = 0;

    const onPointer = (cx: number, cy: number) => {
      const r = host.getBoundingClientRect();
      mouse.x = cx - r.left;
      mouse.y = cy - r.top;
      hover = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= r.width && mouse.y <= r.height ? 1 : 0;
    };
    const onMove = (e: PointerEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onPointer(t.clientX, t.clientY);
    };
    const onLeave = () => (hover = 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    // intro: the preloader flies the name into place and announces the landing;
    // that is the cue for the light to strike (the name's own entrance is the
    // preloader's hand-off). Coming back to the page, it strikes straight away.
    let introStart = -1;
    const startIntro = () => {
      if (introStart < 0) introStart = performance.now() + 60;
    };
    const w = window as Window & { __preloaderDone?: boolean };
    if (w.__preloaderDone) startIntro();
    window.addEventListener("preloader:done", startIntro);
    const introFallback = window.setTimeout(startIntro, 12000);

    // a tungsten strike: two quick stutters, then it catches and warms up
    const strike = (s: number) => {
      if (s < 0) return 0;
      if (s < 0.08) return 0.5;
      if (s < 0.16) return 0.06;
      if (s < 0.24) return 0.72;
      if (s < 0.3) return 0.22;
      return Math.min(1, 0.55 + (1 - Math.exp(-(s - 0.3) * 3.2)) * 0.45);
    };
    const easeOut = (k: number) => 1 - Math.pow(1 - k, 4);
    const easeInOut = (k: number) => (k < 0.5 ? 8 * k * k * k * k : 1 - Math.pow(-2 * k + 2, 4) / 2);

    // ---- frame ------------------------------------------------------------------
    let raf = 0;
    let running = true;
    let disposed = false;
    let last = performance.now();
    const t0 = last;
    let frameAcc = 0;
    let frameN = 0;
    let lastDrop = 0;

    const setBeam = (lx: number, ly: number, tx: number, ty: number) => {
      for (const prog of beamPrograms) {
        prog.uniforms.uLight.value.set(lx, ly);
        prog.uniforms.uTarget.value.set(tx, ty);
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = (now - t0) / 1000;
      const s = introStart > 0 ? (now - introStart) / 1000 : -1;

      // light position and the intro sweep across the name
      light.x = -W * 0.2;
      light.y = -H * 0.5;
      const r = rest();
      const sweep = s < 0 ? 0 : easeInOut(Math.min(1, s / 2.4));
      const fromX = W * 0.02;
      const fromY = H * 0.95;
      aimTarget.x = fromX + (r.x - fromX) * sweep;
      aimTarget.y = fromY + (r.y - fromY) * sweep;
      if (sweep >= 1 && hover) {
        // the gaffer's hand: the beam leans toward the pointer
        aimTarget.x += (mouse.x - r.x) * 0.55;
        aimTarget.y += (mouse.y - r.y) * 0.35;
      }
      const k = sweep < 1 ? 1 : 1 - Math.pow(0.001, dt);
      aim.x += (aimTarget.x - aim.x) * k;
      aim.y += (aimTarget.y - aim.y) * k;
      setBeam(light.x, light.y, aim.x, aim.y);

      // camera: the dolly-in, a slow drift, and a little parallax toward the hand
      const dolly = s < 0 ? 1.12 : 1 + 0.12 * (1 - easeOut(Math.min(1, s / 2.8)));
      const tp = { x: Math.sin(time * 0.05) * 10 + (hover ? (mouse.x - W / 2) * 0.03 : 0), y: Math.cos(time * 0.04) * 6 + (hover ? (mouse.y - H / 2) * 0.02 : 0) };
      pan.x += (tp.x - pan.x) * (1 - Math.pow(0.05, dt));
      pan.y += (tp.y - pan.y) * (1 - Math.pow(0.05, dt));

      // the light breathes a little, like a real filament
      const intensity = strike(s) * (0.965 + 0.035 * Math.sin(time * 0.7) * Math.sin(time * 0.23 + 1.3));

      // stirred air from pointer speed, settling when the hand stops
      const v = mouse.px < -9000 ? 0 : Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py);
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      stir += (Math.min(v, 60) - stir) * (v > stir ? 0.25 : 0.04);

      const scroll = Math.min(1, Math.max(0, (window.scrollY - heroTop) / heroH));
      const fy = fade ? Number(gsap.getProperty(fade, "y")) || 0 : 0;

      // shadows (quarter res)
      shaftProgram.uniforms.uRect.value.set(textX, textY + fy, texW, texH);
      back.render({ scene: shaftMesh, target: shaftRT });

      // room + dust
      roomProgram.uniforms.uTime.value = time;
      roomProgram.uniforms.uIntensity.value = intensity;
      roomProgram.uniforms.uZoom.value = dolly;
      roomProgram.uniforms.uPan.value.set(pan.x, pan.y - scroll * H * 0.25);
      back.render({ scene: roomMesh, target: roomRT });
      compositeProgram.uniforms.uTime.value = time;
      back.render({ scene: compositeMesh });
      const du = dustProgram.uniforms;
      du.uTime.value = time;
      du.uZoom.value = dolly;
      du.uPan.value.set(pan.x, pan.y);
      du.uScroll.value = scroll;
      du.uMouse.value.set(hover ? mouse.x : -9999, hover ? mouse.y : -9999);
      du.uStir.value = stir;
      du.uIntensity.value = intensity;
      back.render({ scene: dustMesh, clear: false });

      // glint on the letters, in hero space
      glintProgram.uniforms.uOrigin.value.set(textX, textY + fy);
      glintProgram.uniforms.uIntensity.value = intensity;
      front.render({ scene: glintMesh });

      // over budget for a sustained stretch: step the resolution down once
      frameAcc += dt;
      frameN++;
      if (frameN >= 45) {
        const avg = frameAcc / frameN;
        frameAcc = 0;
        frameN = 0;
        if (avg > 0.0205 && quality < QUALITY.length - 1 && now - lastDrop > 2500) {
          quality++;
          lastDrop = now;
          measure();
        }
      }

      raf = requestAnimationFrame(loop);
    };

    // measure even when paused at birth (a load straight into the dashboard),
    // so the loop can pick up cleanly the moment the site is back on stage
    const start = async () => {
      await document.fonts?.ready;
      if (disposed) return;
      measure();
      aim.x = W * 0.02;
      aim.y = H * 0.95;
      if (running) raf = requestAnimationFrame(loop);
    };
    start();

    const ro = new ResizeObserver(() => {
      if (texW > 1) measure();
    });
    ro.observe(host);
    ro.observe(h1);

    // The top ~112px sits under the nav's ground-coloured fade, so a hero that
    // only shows there is invisible: stop rendering (this is what used to keep
    // the shot running, unseen, all the way to the Work section).
    // Nor while the dashboard covers the site: the hero stays mounted (and
    // "intersecting") under it, and a WebGL frame nobody sees costs the
    // dashboard its own frames.
    let inView = true;
    const onStage = () => document.documentElement.dataset.uiMode !== "dashboard";
    const gate = () => {
      if (disposed) return;
      const was = running;
      running = inView && onStage();
      if (running && !was) {
        last = performance.now();
        frameAcc = 0;
        frameN = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        gate();
      },
      { rootMargin: "-112px 0px 0px 0px" },
    );
    io.observe(host);
    const stage = new MutationObserver(gate);
    stage.observe(document.documentElement, { attributes: true, attributeFilter: ["data-ui-mode"] });

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(introFallback);
      mo.disconnect();
      ro.disconnect();
      io.disconnect();
      stage.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("preloader:done", startIntro);
      document.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      fgl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      glintCanvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}
