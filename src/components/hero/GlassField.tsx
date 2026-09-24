"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2, Vec4, Color, RenderTarget, Texture } from "ogl";
import { gsap } from "@/lib/gsap";

/**
 * The hero's signature: a pane of fogged glass between the visitor and the name.
 * "Withhold, then reward" made physical.
 *
 * The headline is rasterised from its real DOM layout into two textures (sharp
 * and blurred) and composited behind a condensation layer. A quarter-resolution
 * ping-pong mask records where the glass has been wiped: the pointer (or a
 * finger) stamps soft capsules along its path, and the mask decays back to fog
 * so the glass slowly mists over again. Where the wipe meets the fog, beads of
 * condensation form; each bead is a tiny lens that refracts the scene behind it
 * upside down, lit by the pool of light that follows the pointer.
 *
 * The DOM <h1> stays in place for semantics, selection and search; it is only
 * made fill-transparent (`data-glass="on"`) once the GL layer has drawn it, and
 * restored if the context is ever lost. Fine or coarse pointers both wipe;
 * reduced motion never mounts this (see HeroBackdrop).
 */

const VERT = /* glsl */ `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// Mask pass. R = how clear the glass is (1 wiped, 0 fogged).
const MASK_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uPrev;
  uniform vec2 uRes;
  uniform vec2 uA;
  uniform vec2 uB;
  uniform float uRadius;
  uniform float uStamp;
  uniform float uDecay;
  uniform float uSeed;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float sdSeg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float c = texture2D(uPrev, uv).r;
    // Dithered decay: sub-1/255 steps still accumulate on an 8-bit target.
    c -= uDecay + (hash(gl_FragCoord.xy + uSeed) - 0.5) / 255.0;
    float d = sdSeg(gl_FragCoord.xy, uA * uRes, uB * uRes);
    // a finger never leaves a perfect edge
    float r = uRadius * (0.86 + 0.28 * hash(floor(gl_FragCoord.xy / 3.0)));
    c = max(c, smoothstep(r, r * 0.35, d) * uStamp);
    gl_FragColor = vec4(clamp(c, 0.0, 1.0), 0.0, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uDpr;
  uniform vec3 uGround;
  uniform vec3 uFogCol;
  uniform vec3 uPool;
  uniform vec3 uHaze;
  uniform float uDark;
  uniform float uScrim;
  uniform sampler2D uMask;
  uniform sampler2D uSharp;
  uniform sampler2D uBlur;
  uniform vec4 uRect;
  uniform float uTextAlpha;
  uniform float uFogMax;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  vec2 hash2(vec2 p) {
    return vec2(hash(p), hash(p + 17.31));
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  // The warm field behind the glass, in bottom-left uv.
  vec3 field(vec2 uv) {
    vec2 p = uv; p.x *= uRes.x / uRes.y;
    float t = uTime * 0.035;
    vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t + 4.0));
    float f = fbm(p * 2.2 + q * 1.4 + t * 0.5);
    vec3 col = mix(uGround, uFogCol, smoothstep(0.2, 0.9, f) * 0.7);
    vec2 m = uMouse; m.x *= uRes.x / uRes.y;
    float pool = smoothstep(0.6, 0.0, distance(p, m)) * uHover;
    col = mix(col, uPool, pool * (0.5 + 0.3 * f));
    float vig = smoothstep(1.2, 0.35, distance(uv, vec2(0.5)));
    col = mix(uGround, col, 0.25 + 0.75 * vig);
    // legibility scrim for the copy that sits on the glass (left column)
    col = mix(col, uGround, uScrim * (1.0 - smoothstep(0.0, 0.62, uv.x)));
    return col;
  }

  // Text layers, sampled in top-left device pixels.
  vec4 sharpAt(vec2 ptl) {
    vec2 t = (ptl - uRect.xy) / uRect.zw;
    if (t.x < 0.0 || t.y < 0.0 || t.x > 1.0 || t.y > 1.0) return vec4(0.0);
    return texture2D(uSharp, t);
  }
  vec4 blurAt(vec2 ptl) {
    vec2 t = (ptl - uRect.xy) / uRect.zw;
    if (t.x < 0.0 || t.y < 0.0 || t.x > 1.0 || t.y > 1.0) return vec4(0.0);
    return texture2D(uBlur, t);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 ptl = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);

    vec3 bg = field(uv);
    vec4 ts = sharpAt(ptl);
    vec4 tb = blurAt(ptl);

    float clearAmt = texture2D(uMask, uv).r;
    float fog = (1.0 - clearAmt) * uFogMax;

    // Through clear glass: crisp. Through fog: the blurred name, lifted toward a
    // milky haze that scatters the pointer's light more widely.
    vec3 seenSharp = mix(bg, ts.rgb, ts.a * uTextAlpha);
    vec3 softBg = mix(bg, uFogCol, 0.35);
    vec3 seenBlur = mix(softBg, tb.rgb, tb.a * uTextAlpha * 0.9);
    vec2 m = uMouse; m.x *= uRes.x / uRes.y;
    vec2 pa = uv; pa.x *= uRes.x / uRes.y;
    float scatter = smoothstep(0.95, 0.0, distance(pa, m)) * uHover;
    vec3 haze = uHaze + uPool * scatter * 0.22;
    // fine frosting: condensation is grainy, never a flat tint
    float frost = hash(floor(ptl / (1.6 * uDpr))) * 0.5 + noise(ptl / (5.0 * uDpr)) * 0.5;
    vec3 fogged = mix(seenBlur, haze, 0.46 + frost * 0.12);
    vec3 col = mix(seenSharp, fogged, fog);

    // Condensation beads. Two scales: fine mist beads across the fog, and fat
    // drops gathered where a wipe meets the fog (the edge of the stroke).
    float edge = smoothstep(0.12, 0.42, fog) * smoothstep(0.98, 0.6, fog);
    for (int layer = 0; layer < 2; layer++) {
      float cell = (layer == 0 ? 11.0 : 26.0) * uDpr;
      float presence = layer == 0 ? fog * 0.32 : edge;
      if (presence < 0.02) continue;
      vec2 g = ptl / cell;
      vec2 ip = floor(g);
      vec2 fp = fract(g);
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec2 nb = vec2(float(i), float(j));
          vec2 id = ip + nb + float(layer) * 91.7;
          if (hash(id + 3.1) > presence) continue;
          vec2 o = 0.2 + 0.6 * hash2(id);
          float r = layer == 0 ? mix(0.1, 0.3, hash(id + 7.7)) : mix(0.18, 0.44, hash(id + 7.7));
          vec2 dv = fp - (nb + o);
          float d = length(dv);
          if (d < r) {
            vec2 n2 = dv / r;
            float h = sqrt(max(1.0 - dot(n2, n2), 0.0));
            // a bead is a convex lens: the world behind it appears inverted
            vec2 centre = (ip + nb + o) * cell;
            vec2 look = centre - n2 * r * cell * 3.2;
            vec4 ls = sharpAt(look);
            vec3 inv = mix(bg * 0.92, ls.rgb, ls.a * uTextAlpha);
            float rim = smoothstep(0.55, 1.0, length(n2));
            float rimK = (uDark > 0.5 ? 0.55 : 0.32) * (layer == 0 ? 0.45 : 1.0);
            vec3 drop = mix(inv, uGround, rim * rimK);
            // specular toward the pointer light, plus a fixed sky catch-light
            vec3 L = normalize(vec3(m - vec2(pa.x, pa.y), 0.9));
            vec3 N = normalize(vec3(n2.x, -n2.y, h));
            // mist beads only catch the light where the pointer's glow reaches
            float lit = layer == 0 ? scatter : (0.35 + uHover * 0.65);
            float spec = pow(max(dot(N, L), 0.0), 36.0) * lit;
            spec += pow(max(dot(N, normalize(vec3(-0.45, 0.55, 0.7))), 0.0), 60.0) * (layer == 0 ? 0.18 : 0.55);
            drop += spec * (uDark > 0.5 ? vec3(1.0, 0.96, 0.9) : vec3(1.0));
            float aa = smoothstep(r, r - 0.06, d);
            col = mix(col, drop, aa * (layer == 0 ? 0.55 : 1.0));
          }
        }
      }
    }

    // grain, matches the rest of the world
    col += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.022;
    gl_FragColor = vec4(col, 1.0);
  }
`;

type Pal = { ground: string; fog: string; pool: string; haze: string; dark: boolean };

function palette(): Pal {
  const dark = document.documentElement.getAttribute("data-theme") !== "light";
  return dark
    ? { ground: "#0f0e0c", fog: "#1b1813", pool: "#5b5140", haze: "#26221c", dark }
    : { ground: "#f3efe6", fog: "#e7e0d2", pool: "#cfc6b4", haze: "#f8f5ee", dark };
}

const PAD = 36; // css px of blur spill around the headline texture

type Layout = {
  // headline box, relative to the host, before any ScrollFade translate
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Offset of `el` within `host`, ignoring transforms (so the 3D plane can't skew it). */
function offsetWithin(el: HTMLElement, host: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  const hostParent = host.offsetParent;
  while (node && node !== hostParent && node !== host) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  // host is the backdrop layer, which sits at the hero's origin
  return { x: x - (node === host ? 0 : host.offsetLeft), y: y - (node === host ? 0 : host.offsetTop) };
}

/**
 * Paint the headline exactly where the DOM lays it out, word by word, using each
 * word's own computed font and colour. Width is corrected per word so canvas
 * metrics can never drift from the DOM.
 */
function paintHeadline(h1: HTMLElement, dpr: number, blurPx: number) {
  const box = h1.getBoundingClientRect();
  const bw = h1.offsetWidth;
  const bh = h1.offsetHeight;
  const W = Math.ceil((bw + PAD * 2) * dpr);
  const H = Math.ceil((bh + PAD * 2) * dpr);

  const sharp = document.createElement("canvas");
  sharp.width = W;
  sharp.height = H;
  const ctx = sharp.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const range = document.createRange();
  const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? "";
    const el = node.parentElement;
    if (!el || !text.trim()) continue;
    const cs = getComputedStyle(el);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.fillStyle = cs.color;
    const c2 = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    if ("letterSpacing" in c2) c2.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      const tm = ctx.measureText(m[0]);
      const ascent = tm.fontBoundingBoxAscent ?? tm.actualBoundingBoxAscent;
      const x = r.left - box.left + PAD;
      const baseline = r.top - box.top + PAD + ascent;
      const k = tm.width > 0 ? Math.min(1.08, Math.max(0.92, r.width / tm.width)) : 1;
      ctx.save();
      ctx.translate(x, baseline);
      ctx.scale(k, 1);
      ctx.fillText(m[0], 0, 0);
      ctx.restore();
    }
  }

  // Blurred twin. Canvas filters where supported; otherwise a cheap
  // downsample-and-upsample, which the GPU's linear filter smooths out.
  const blur = document.createElement("canvas");
  const bctx = blur.getContext("2d")!;
  if ("filter" in bctx && typeof (bctx as CanvasRenderingContext2D).filter === "string") {
    blur.width = Math.ceil(W / 2);
    blur.height = Math.ceil(H / 2);
    bctx.filter = `blur(${(blurPx * dpr) / 2}px)`;
    bctx.drawImage(sharp, 0, 0, blur.width, blur.height);
  } else {
    blur.width = Math.max(2, Math.ceil(W / 8));
    blur.height = Math.max(2, Math.ceil(H / 8));
    bctx.imageSmoothingQuality = "high";
    bctx.drawImage(sharp, 0, 0, blur.width, blur.height);
  }
  return { sharp, blur, w: bw + PAD * 2, h: bh + PAD * 2 };
}

export default function GlassField() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const section = host.closest("section");
    const h1 = section?.querySelector<HTMLElement>("[data-glass-text]") ?? null;
    if (!section || !h1) return;
    const fade = h1.closest<HTMLElement>("[data-scroll-fade]");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: false, dpr, antialias: false });
    } catch {
      return; // no WebGL: the DOM headline simply stays visible
    }
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.cssText = "width:100%;height:100%;display:block";
    host.appendChild(canvas);

    const pal = palette();
    const geometry = new Triangle(gl);

    // wipe mask, ping-pong
    const mkTarget = (w: number, h: number) =>
      new RenderTarget(gl, { width: w, height: h, depth: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
    let maskA = mkTarget(4, 4);
    let maskB = mkTarget(4, 4);
    const maskProgram = new Program(gl, {
      vertex: VERT,
      fragment: MASK_FRAG,
      uniforms: {
        uPrev: { value: maskA.texture },
        uRes: { value: new Vec2(4, 4) },
        uA: { value: new Vec2(-1, -1) },
        uB: { value: new Vec2(-1, -1) },
        uRadius: { value: 10 },
        uStamp: { value: 0 },
        uDecay: { value: 0 },
        uSeed: { value: 0 },
      },
    });
    const maskMesh = new Mesh(gl, { geometry, program: maskProgram });

    const texOpts = {
      generateMipmaps: false,
      flipY: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    };
    const sharpTex = new Texture(gl, texOpts);
    const blurTex = new Texture(gl, texOpts);

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new Vec2(1, 1) },
        uMouse: { value: new Vec2(0.5, 0.55) },
        uHover: { value: 0 },
        uDpr: { value: dpr },
        uGround: { value: new Color(pal.ground) },
        uFogCol: { value: new Color(pal.fog) },
        uPool: { value: new Color(pal.pool) },
        uHaze: { value: new Color(pal.haze) },
        uDark: { value: pal.dark ? 1 : 0 },
        uScrim: { value: 0.72 },
        uMask: { value: maskA.texture },
        uSharp: { value: sharpTex },
        uBlur: { value: blurTex },
        uRect: { value: new Vec4(0, 0, 1, 1) },
        uTextAlpha: { value: 1 },
        uFogMax: { value: 1 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    // ---- layout + textures -------------------------------------------------
    let layout: Layout = { x: 0, y: 0, w: 1, h: 1 };
    let texW = 1;
    let texH = 1;
    let ready = false;
    let radiusCss = 60;

    const repaint = () => {
      const { sharp, blur, w, h } = paintHeadline(h1, dpr, 9);
      sharpTex.image = sharp;
      blurTex.image = blur;
      sharpTex.needsUpdate = true;
      blurTex.needsUpdate = true;
      texW = w;
      texH = h;
    };

    const measure = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h);
      program.uniforms.uRes.value.set(canvas.width, canvas.height);
      const mw = Math.max(4, Math.round(canvas.width / 4));
      const mh = Math.max(4, Math.round(canvas.height / 4));
      if (maskA.width !== mw || maskA.height !== mh) {
        maskA = mkTarget(mw, mh);
        maskB = mkTarget(mw, mh);
        maskProgram.uniforms.uRes.value.set(mw, mh);
      }
      radiusCss = Math.min(96, Math.max(50, Math.min(w, h) * 0.085));
      const o = offsetWithin(h1, host);
      layout = { x: o.x, y: o.y, w: h1.offsetWidth, h: h1.offsetHeight };
      repaint();
    };

    const applyPalette = () => {
      const p = palette();
      program.uniforms.uGround.value = new Color(p.ground);
      program.uniforms.uFogCol.value = new Color(p.fog);
      program.uniforms.uPool.value = new Color(p.pool);
      program.uniforms.uHaze.value = new Color(p.haze);
      program.uniforms.uDark.value = p.dark ? 1 : 0;
      // text colours come from the DOM, so wait a frame for the theme to apply
      requestAnimationFrame(repaint);
    };
    const mo = new MutationObserver(applyPalette);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // ---- intro: one unseen finger swipes the name clear --------------------
    let introDone = false;
    let introStart = -1;
    const INTRO_MS = 1700;
    const startIntro = () => {
      if (introStart < 0) introStart = performance.now() + 250;
    };
    const w = window as Window & { __preloaderDone?: boolean };
    if (w.__preloaderDone) startIntro();
    window.addEventListener("preloader:done", startIntro);
    const introFallback = window.setTimeout(startIntro, 6500);

    // ---- input ---------------------------------------------------------------
    const target = new Vec2(0.5, 0.55);
    const current = new Vec2(0.5, 0.55);
    let hover = 0;
    let hoverTarget = 0;
    // pending stroke segment, in css px within the host
    let strokeFrom: { x: number; y: number } | null = null;
    let strokeTo: { x: number; y: number } | null = null;
    let lastPt: { x: number; y: number } | null = null;

    const toHost = (cx: number, cy: number) => {
      const r = host.getBoundingClientRect();
      return { x: cx - r.left, y: cy - r.top, inside: cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom, r };
    };
    const push = (x: number, y: number) => {
      if (!strokeFrom) strokeFrom = lastPt ?? { x, y };
      strokeTo = { x, y };
      lastPt = { x, y };
    };
    const onMove = (e: PointerEvent) => {
      const p = toHost(e.clientX, e.clientY);
      target.set(p.x / p.r.width, 1 - p.y / p.r.height);
      hoverTarget = p.inside ? 1 : 0;
      if (p.inside && introDone) push(p.x, p.y);
      else lastPt = null;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const p = toHost(t.clientX, t.clientY);
      if (p.inside && introDone) push(p.x, p.y);
    };
    const onTouchEnd = () => (lastPt = null);
    const onLeave = () => {
      hoverTarget = 0;
      lastPt = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    // ---- frame ---------------------------------------------------------------
    let raf = 0;
    let running = true;
    let last = performance.now();
    const t0 = last;
    let seed = 0;

    const stampMask = (a: { x: number; y: number }, b: { x: number; y: number }, decay: number, stamp: number) => {
      const W = host.clientWidth;
      const H = host.clientHeight;
      maskProgram.uniforms.uPrev.value = maskA.texture;
      maskProgram.uniforms.uA.value.set(a.x / W, 1 - a.y / H);
      maskProgram.uniforms.uB.value.set(b.x / W, 1 - b.y / H);
      maskProgram.uniforms.uRadius.value = (radiusCss * dpr) / 4;
      maskProgram.uniforms.uStamp.value = stamp;
      maskProgram.uniforms.uDecay.value = decay;
      maskProgram.uniforms.uSeed.value = (seed = (seed + 1) % 997);
      renderer.render({ scene: maskMesh, target: maskB });
      const tmp = maskA;
      maskA = maskB;
      maskB = tmp;
    };

    let introPrev: { x: number; y: number } | null = null;
    let introE = 0;
    // the Z: 0..0.5 sweeps right along line one, 0.5..1 back along line two
    const introPath = (e: number) => {
      const x0 = layout.x - 30;
      const x1 = layout.x + layout.w + 30;
      const yA = layout.y + layout.h * 0.27;
      const yB = layout.y + layout.h * 0.74;
      if (e < 0.5) {
        const u = e / 0.5;
        return { x: x0 + (x1 - x0) * u, y: yA + Math.sin(u * Math.PI) * layout.h * 0.04 };
      }
      const u = (e - 0.5) / 0.5;
      return { x: x1 - (x1 - x0) * u, y: yB - Math.sin(u * Math.PI) * layout.h * 0.04 };
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      hover += (hoverTarget - hover) * 0.05;

      // Scripted intro: one hand wipes the glass the way people do, across the
      // first line and back along the second, so the whole name comes clear.
      // The path is sub-stepped so a slow device still draws the full Z rather
      // than jumping corner to corner between frames.
      let decay = introDone ? dt * 0.085 : 0;
      if (!introDone && introStart > 0 && now >= introStart) {
        const k = Math.min(1, (now - introStart) / INTRO_MS);
        const eNow = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        const r0 = radiusCss;
        radiusCss = Math.max(r0, layout.h * 0.3);
        let prev = introPrev ?? introPath(introE);
        for (let e = introE + 0.03; e < eNow; e += 0.03) {
          const pt = introPath(e);
          stampMask(prev, pt, 0, 1);
          prev = pt;
        }
        const end = introPath(eNow);
        stampMask(prev, end, 0, 1);
        radiusCss = r0;
        introPrev = end;
        introE = eNow;
        if (k >= 1) {
          introDone = true;
          introPrev = null;
        }
      }

      if (strokeFrom && strokeTo) {
        stampMask(strokeFrom, strokeTo, decay, 1);
        decay = 0;
        strokeFrom = null;
        strokeTo = null;
      }
      if (decay > 0) stampMask({ x: -999, y: -999 }, { x: -999, y: -999 }, decay, 0);

      // follow the ScrollFade departure without touching layout
      const fy = fade ? Number(gsap.getProperty(fade, "y")) || 0 : 0;
      const fo = fade ? Number(gsap.getProperty(fade, "opacity")) : 1;
      program.uniforms.uRect.value.set(
        (layout.x - PAD) * dpr,
        (layout.y + fy - PAD) * dpr,
        texW * dpr,
        texH * dpr,
      );
      program.uniforms.uTextAlpha.value = Number.isFinite(fo) ? fo : 1;

      program.uniforms.uMask.value = maskA.texture;
      program.uniforms.uMouse.value.set(current.x, current.y);
      program.uniforms.uHover.value = hover;
      program.uniforms.uTime.value = (now - t0) / 1000;
      renderer.render({ scene: mesh });

      if (!ready) {
        ready = true;
        h1.dataset.glass = "on";
      }
      raf = requestAnimationFrame(loop);
    };

    const start = async () => {
      await document.fonts?.ready;
      if (!running) return;
      measure();
      raf = requestAnimationFrame(loop);
    };
    start();

    const ro = new ResizeObserver(() => {
      if (texW > 1) measure();
    });
    ro.observe(host);
    ro.observe(h1);

    const io = new IntersectionObserver(([entry]) => {
      const was = running;
      running = entry.isIntersecting;
      if (running && !was) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(host);

    const onLost = (e: Event) => {
      e.preventDefault();
      delete h1.dataset.glass;
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(introFallback);
      mo.disconnect();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("preloader:done", startIntro);
      document.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      delete h1.dataset.glass;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}
