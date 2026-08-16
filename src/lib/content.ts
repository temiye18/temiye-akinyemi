/**
 * Placeholder content for the design-first build. Structure is real; copy and
 * project names are stand-ins to be swapped for Temiye's actual work later.
 * Keep the SHAPE — the components read these fields.
 */

export const site = {
  name: "Temiye Akinyemi",
  role: "Frontend Engineer",
  since: 2022,
  location: "Lagos → Remote",
  email: "hello@temiye.dev", // placeholder
  status: "Available for select work",
  socials: [
    { label: "GitHub", href: "https://github.com" },
    { label: "X / Twitter", href: "https://x.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "Read.cv", href: "https://read.cv" },
  ],
} as const;

export const nav = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Craft", href: "#craft" },
  { label: "Contact", href: "#contact" },
] as const;

export type Project = {
  index: string;
  slug: string;
  title: string;
  discipline: string;
  year: string;
  stack: string[];
  blurb: string;
  signature: boolean; // the one that carries the 3D "Artifact" moment
  role: string;
  timeline: string;
  challenge: string;
  approach: string;
  result: string;
  highlights: string[];
};

export const projects: Project[] = [
  {
    index: "01",
    slug: "aperture",
    title: "Aperture",
    discipline: "Real-time collaborative canvas",
    year: "2025",
    stack: ["WebGL", "CRDT", "WebSocket", "React"],
    blurb:
      "A multiplayer design surface where cursors, selections, and geometry sync at 60fps — presence you can feel, not just see.",
    signature: true,
    role: "Lead frontend engineer",
    timeline: "8 months · 2025",
    challenge:
      "Make a shared canvas feel like one room — every participant's cursor, selection, and edit landing instantly, with no perceptible lag between intent and pixel.",
    approach:
      "A WebGL rendering core decoupled from a CRDT sync layer, with an interpolation buffer that smooths remote cursors and a render loop budgeted to stay under the frame at any participant count.",
    result:
      "Sub-60ms round-trip presence at 40+ concurrent editors, holding a steady 60fps on mid-range hardware.",
    highlights: [
      "Custom WebGL scene graph with dirty-rect redraws",
      "CRDT conflict resolution tuned for interactive latency",
      "Interpolated remote cursors with velocity prediction",
      "Off-main-thread serialization to protect input latency",
    ],
  },
  {
    index: "02",
    slug: "meridian",
    title: "Meridian",
    discipline: "Trading terminal interface",
    year: "2024",
    stack: ["Canvas", "WebGPU", "Streams", "Next.js"],
    blurb:
      "A dense, low-latency market terminal. Thousands of ticks a second rendered without dropping a frame or a keystroke.",
    signature: false,
    role: "Frontend engineer",
    timeline: "6 months · 2024",
    challenge:
      "Render thousands of price ticks per second across dozens of live panels without starving user input or dropping frames.",
    approach:
      "A Canvas/WebGPU rendering pipeline fed by batched streams, with virtualization and a scheduler that yields to input so the UI never stutters under load.",
    result:
      "Steady 60fps under peak market volume with input latency held under one frame.",
    highlights: [
      "GPU-accelerated candlestick and depth rendering",
      "Backpressure-aware stream batching",
      "Virtualized grids for thousands of rows",
      "Input-priority scheduling",
    ],
  },
  {
    index: "03",
    slug: "umbra",
    title: "Umbra",
    discipline: "Generative art platform",
    year: "2024",
    stack: ["GLSL", "Three.js", "GPGPU", "Motion"],
    blurb:
      "Shader-driven generative pieces you can steer in real time — parameters as instruments, the browser as the gallery.",
    signature: false,
    role: "Creative engineer",
    timeline: "4 months · 2024",
    challenge:
      "Let anyone author and perform generative shader pieces live, with parameters that feel like instruments rather than sliders.",
    approach:
      "A GPGPU particle system driven by editable GLSL, with a parameter layer mapped to spring-eased controls and export to high-resolution stills.",
    result:
      "A performable gallery of pieces running at full frame rate, exportable at print resolution.",
    highlights: [
      "GPGPU particle simulation in fragment shaders",
      "Live GLSL editing with hot recompile",
      "Spring-mapped performance controls",
      "High-resolution offscreen export",
    ],
  },
  {
    index: "04",
    slug: "cadence",
    title: "Cadence",
    discipline: "Music visualization app",
    year: "2023",
    stack: ["Web Audio", "Canvas", "GSAP", "React"],
    blurb:
      "Audio-reactive visuals bound to the beat — analysis on the main thread's terms, motion tuned to the ear.",
    signature: false,
    role: "Frontend engineer",
    timeline: "3 months · 2023",
    challenge:
      "Bind visuals tightly to live audio so motion reads as musical, not decorative — on the beat, in time, every time.",
    approach:
      "Web Audio analysis feeding a Canvas render loop, with beat detection smoothed and GSAP timelines quantized to the tempo grid.",
    result:
      "Frame-accurate audio-reactive visuals that hold sync across long sessions.",
    highlights: [
      "FFT analysis with adaptive smoothing",
      "Beat and tempo detection",
      "Tempo-quantized GSAP timelines",
      "Canvas render loop tuned for battery",
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export const about = {
  statement:
    "I build interfaces that behave like they're alive — motion with physics, transitions with intent, and performance held at sixty frames so the craft never breaks character.",
  paragraphs: [
    "Four years deep in the front end, my work sits where engineering meets art direction: WebGL and shaders, scroll-driven storytelling, and the small spring-loaded details that make a screen feel considered.",
    "The through-line is restraint. I spend spectacle once, deliberately, and let precision carry the rest — because taste, not tricks, is what reads as senior.",
  ],
  facts: [
    { k: "Focus", v: "Immersive & interactive UI" },
    { k: "Motion", v: "GSAP · Lenis · Motion · Shaders" },
    { k: "Stack", v: "Next.js · React · TypeScript" },
    { k: "Care", v: "Accessible · 60fps · Reduced-motion" },
  ],
};

export const craft = {
  intro: "How the work holds together.",
  disciplines: [
    {
      title: "Motion with physics",
      body: "Inertia, springs, and velocity-reactive type. Custom easing over defaults — every movement answers why it moves.",
    },
    {
      title: "WebGL & shaders",
      body: "Displacement, distortion, particle fields. One signature moment per project, budgeted to stay under the frame.",
    },
    {
      title: "Scroll as narrative",
      body: "Pinned scenes, masked reveals, and smooth-scroll choreography that turns a page into a sequence.",
    },
    {
      title: "Performance discipline",
      body: "Core Web Vitals defended, transforms only, canvases lazy-loaded. Fast and fancy are not a trade.",
    },
    {
      title: "Accessible by default",
      body: "Reduced-motion honored, semantics intact, keyboard paths real. Spectacle that never taxes the user.",
    },
    {
      title: "Systems, not screens",
      body: "Design tokens shared by CSS and JS; motion primitives reused. The site is a system that scales.",
    },
  ],
};
