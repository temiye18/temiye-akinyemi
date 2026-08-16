"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2, Color } from "ogl";

/**
 * Warm-monochrome atmosphere — a domain-warped noise field that pools soft light
 * (dark theme) or soft shadow (light theme) around the pointer, like something
 * moving beneath frosted glass. Cheap single-pass fragment shader via OGL.
 * Theme-driven: it re-reads its palette when `data-theme` flips.
 */
const VERT = /* glsl */ `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;   // 0..1, eased
  uniform float uHover;  // 0..1 pointer presence
  uniform vec3 uGround;
  uniform vec3 uFog;
  uniform vec3 uPool;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float amp = 0.5;
    for (int i = 0; i < 5; i++) { v += amp * noise(p); p *= 2.02; amp *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    vec2 p = uv; p.x *= uRes.x / uRes.y;

    float t = uTime * 0.035;
    vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t + 4.0));
    float f = fbm(p * 2.2 + q * 1.4 + t * 0.5);

    vec3 col = mix(uGround, uFog, smoothstep(0.2, 0.9, f) * 0.7);

    vec2 m = uMouse; m.x *= uRes.x / uRes.y;
    float d = distance(p, m);
    float pool = smoothstep(0.6, 0.0, d) * uHover;
    col = mix(col, uPool, pool * (0.5 + 0.3 * f));

    float vig = smoothstep(1.2, 0.35, distance(uv, vec2(0.5)));
    col = mix(uGround, col, 0.25 + 0.75 * vig);

    float g = hash(gl_FragCoord.xy + uTime) * 0.025 - 0.0125;
    col += g;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Palette per theme. Warm, low-chroma. Dark pools light; light pools shadow.
function palette() {
  const dark = document.documentElement.getAttribute("data-theme") !== "light";
  return dark
    ? { ground: "#0f0e0c", fog: "#1b1813", pool: "#5b5140" }
    : { ground: "#f3efe6", fog: "#e7e0d2", pool: "#cfc6b4" };
}

export default function ShaderField() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new Renderer({
      alpha: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.75),
    });
    const gl = renderer.gl;
    host.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const pal = palette();
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new Vec2(1, 1) },
        uMouse: { value: new Vec2(0.5, 0.55) },
        uHover: { value: 0 },
        uGround: { value: new Color(pal.ground) },
        uFog: { value: new Color(pal.fog) },
        uPool: { value: new Color(pal.pool) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const applyPalette = () => {
      const p = palette();
      program.uniforms.uGround.value = new Color(p.ground);
      program.uniforms.uFog.value = new Color(p.fog);
      program.uniforms.uPool.value = new Color(p.pool);
    };
    const mo = new MutationObserver(applyPalette);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h);
      program.uniforms.uRes.value.set(gl.canvas.width, gl.canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const target = new Vec2(0.5, 0.55);
    const current = new Vec2(0.5, 0.55);
    let hover = 0;
    let hoverTarget = 0;

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      hoverTarget = 1;
    };
    const onLeave = () => (hoverTarget = 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let running = true;
    const start = performance.now();
    const loop = (now: number) => {
      if (!running) return;
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      hover += (hoverTarget - hover) * 0.05;
      program.uniforms.uMouse.value.set(current.x, current.y);
      program.uniforms.uHover.value = hover;
      program.uniforms.uTime.value = (now - start) / 1000;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(
      ([entry]) => {
        const wasRunning = running;
        running = entry.isIntersecting;
        if (running && !wasRunning) raf = requestAnimationFrame(loop);
      },
      { threshold: 0 },
    );
    io.observe(host);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      mo.disconnect();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      const ext = gl.getExtension("WEBGL_lose_context");
      ext?.loseContext();
      gl.canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}
