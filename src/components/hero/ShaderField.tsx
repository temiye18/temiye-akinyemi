"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2 } from "ogl";

/**
 * OBSIDIAN atmosphere — a domain-warped noise field in blue-ink that pools warm
 * sodium-amber light around the pointer, like a lamp moving through fog. Cheap
 * single-pass fragment shader via OGL (a few KB, no Three.js). SSR-disabled by
 * its dynamic import; reduced-motion callers render the static fallback instead.
 */
const VERT = /* glsl */ `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;   // 0..1, eased
  uniform float uHover;  // 0..1 pointer presence

  // hash / value noise
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    vec2 p = uv;
    p.x *= uRes.x / uRes.y;

    float t = uTime * 0.04;
    // domain warp for slow drifting "fog"
    vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t + 4.0));
    float f = fbm(p * 2.2 + q * 1.4 + t * 0.5);

    // base: blue-ink near black, faintly lit by the fog
    vec3 ground = vec3(0.043, 0.047, 0.071);
    vec3 fog = vec3(0.09, 0.10, 0.15);
    vec3 col = mix(ground, fog, smoothstep(0.2, 0.9, f) * 0.6);

    // sodium-amber pool around the pointer
    vec2 m = uMouse;
    m.x *= uRes.x / uRes.y;
    float d = distance(p, m);
    float glow = smoothstep(0.55, 0.0, d) * uHover;
    vec3 amber = vec3(0.90, 0.63, 0.32);
    col += amber * glow * (0.35 + 0.25 * f);

    // vignette so edges fall into darkness
    float vig = smoothstep(1.15, 0.35, distance(uv, vec2(0.5)));
    col *= vig;

    // subtle film grain to kill banding
    float g = hash(gl_FragCoord.xy + uTime) * 0.03 - 0.015;
    col += g;

    gl_FragColor = vec4(col, 1.0);
  }
`;

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
    gl.clearColor(0.043, 0.047, 0.071, 1);
    host.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new Vec2(1, 1) },
        uMouse: { value: new Vec2(0.5, 0.55) },
        uHover: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h);
      program.uniforms.uRes.value.set(gl.canvas.width, gl.canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // eased pointer follow
    const target = new Vec2(0.5, 0.55);
    const current = new Vec2(0.5, 0.55);
    let hover = 0;
    let hoverTarget = 0;

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      hoverTarget = 1;
    };
    // Fade the pool out only when the pointer truly leaves the document, not on
    // every element boundary (pointerout bubbles) — that would flicker the glow.
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

    // pause when the hero scrolls out of view
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
