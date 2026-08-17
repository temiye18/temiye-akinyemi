/**
 * Site content. Real copy, written plainly. No em dashes.
 */

export const site = {
  name: "Temiye Akinyemi",
  role: "Software Engineer",
  since: 2022,
  location: "Lagos, Nigeria",
  email: "akinyemitemiye18@gmail.com",
  status: "Open to new opportunities",
  socials: [
    { label: "GitHub", href: "https://github.com/temiye18" },
    { label: "LinkedIn", href: "https://linkedin.com/in/akinyemi-temi/" },
    { label: "Résumé", href: "/temiye-akinyemi-resume.pdf" },
  ],
} as const;

export const nav = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Experience", href: "#experience" },
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
    slug: "resume-by-temi",
    title: "Résumé by Temi",
    discipline: "AI resume builder",
    year: "2025",
    stack: ["React 19", "TypeScript", "Google Gemini", "IndexedDB", "Zod"],
    blurb:
      "A browser-based resume builder that turns your details into an ATS-ready PDF, with no account and no server. AI reads your old resume and a built-in scorer tells you how to make it stronger.",
    signature: true,
    role: "Solo project",
    timeline: "2025",
    challenge:
      "Make a resume builder that respects privacy and runs entirely in the browser, while still using AI to parse existing resumes and score them for applicant tracking systems.",
    approach:
      "The whole app runs client-side. Resumes are parsed with Google Gemini, saved locally in IndexedDB, and rendered to PDF in the browser. A schema-driven design lets six templates share one validation and rendering pipeline.",
    result:
      "A private, account-free builder that produces ATS-friendly resumes and grades them on formatting, keywords, action verbs, and how well they match a job description.",
    highlights: [
      "Client-side PDF generation, no server needed",
      "AI parsing of PDF, DOCX, and TXT resumes",
      "ATS scoring for keywords, voice, verbs, and fit",
      "Schema-driven: six templates, one pipeline",
    ],
  },
  {
    index: "02",
    slug: "foodcs",
    title: "FoodCS",
    discipline: "AI marketplace platform",
    year: "2025",
    stack: ["Next.js", "Node.js", "PostgreSQL", "Stripe", "Socket.IO", "Gemini"],
    blurb:
      "An AI-powered marketplace that connects food entrepreneurs with manufacturers and experts, with semantic search, real-time messaging, escrow payments, and digital contracts.",
    signature: false,
    role: "Software Engineer (contract)",
    timeline: "2025 to 2026",
    challenge:
      "Build a marketplace people can trust: find the right expert, talk in real time, and pay safely, all in one place.",
    approach:
      "Three production apps (a customer platform, an admin dashboard, and an Express API) share one PostgreSQL database. Expert matching runs on Gemini embeddings and pgvector for natural-language search, payments use Stripe Connect with scheduled payouts and dispute handling, and Redis, BullMQ, and Socket.IO power background jobs and live messaging.",
    result:
      "A full marketplace shipped end to end, from architecture and database design through backend, frontend, infrastructure, and deployment.",
    highlights: [
      "Natural-language expert matching with Gemini and pgvector",
      "Escrow payments and payouts via Stripe Connect",
      "Real-time messaging with Socket.IO",
      "Background jobs with Redis and BullMQ",
    ],
  },
  {
    index: "03",
    slug: "wifi-health-monitor",
    title: "WiFi Health Monitor",
    discipline: "Desktop monitoring app",
    year: "2024",
    stack: ["C#", "WPF", ".NET 8", "SQLite", "ML.NET"],
    blurb:
      "A Windows app that watches your WiFi health in real time and forecasts network quality using a mix of statistics and machine learning.",
    signature: false,
    role: "Solo project",
    timeline: "2024",
    challenge:
      "Give people a clear, live read on their network quality, and predict problems before they happen.",
    approach:
      "An adaptive forecasting engine switches between linear regression and an ML.NET time-series model depending on how much history is available. An event-driven design coordinates analytics, storage, prediction, monitoring, and charts, backed by SQLite and the Ookla Speedtest CLI.",
    result:
      "Real-time, actionable network health insights with forecasting that adapts to the data on hand.",
    highlights: [
      "Adaptive linear and ML.NET time-series forecasting",
      "Event-driven service architecture",
      "SQLite persistence with live charts",
      "Ookla Speedtest CLI integration",
    ],
  },
  {
    index: "04",
    slug: "sharesafe",
    title: "ShareSafe",
    discipline: "Emergency response app",
    year: "2024",
    stack: ["React Native", "Expo"],
    blurb:
      "A location-aware emergency response app for reporting incidents, verifying them, alerting responders, and letting the community confirm what is real.",
    signature: false,
    role: "Team lead, 3 engineers",
    timeline: "45-day MVP",
    challenge:
      "Ship a trustworthy emergency platform quickly, where reports can be verified and the right responders are alerted.",
    approach:
      "A full emergency lifecycle from report to verification to response to resolution, with geofencing, responder notifications, and community validation. I led a team of three to a production-ready MVP in 45 days.",
    result:
      "A working MVP delivered in 45 days that covers the full incident lifecycle.",
    highlights: [
      "Led a team of three engineers",
      "Production-ready MVP in 45 days",
      "Geofencing and responder alerts",
      "Community-driven incident validation",
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export const about = {
  statement:
    "I build production web applications that people rely on, from healthcare platforms to AI marketplaces, and I care about how every screen looks and feels while I do it.",
  paragraphs: [
    "I'm a software engineer with 3+ years of experience building fullstack web and mobile apps with React, Next.js, TypeScript, Node.js, and PostgreSQL. I've shipped products across healthcare, AI marketplaces, and consumer platforms.",
    "I like owning a product from idea to production: architecture, backend, frontend, and the small interface details that make it feel considered. A lot of that work now involves LLMs, vector search, real-time features, and payments.",
  ],
  facts: [
    { k: "Focus", v: "Fullstack web and AI" },
    { k: "Stack", v: "React, Next.js, Node, Postgres" },
    { k: "Experience", v: "3+ years" },
    { k: "Based", v: "Lagos, Nigeria" },
  ],
};

// Capabilities: real strengths and the concrete toolkit behind them.
export const capabilities = {
  intro: "What I bring to the work.",
  disciplines: [
    {
      title: "Frontend engineering",
      body: "React, Next.js, and TypeScript with reusable design systems that keep interfaces consistent and quick to build on.",
    },
    {
      title: "Fullstack and APIs",
      body: "Node.js and Express services over PostgreSQL, designed for reliable, well-structured data and clean API contracts.",
    },
    {
      title: "AI integration",
      body: "LLMs and vector search in real products: semantic matching, RAG, and natural-language features with Google Gemini and pgvector.",
    },
    {
      title: "Real-time systems",
      body: "Live messaging, presence, and background jobs with Socket.IO, Redis, and BullMQ that stay responsive under load.",
    },
    {
      title: "Payments and infrastructure",
      body: "Escrow and payouts with Stripe Connect, containerized and shipped with Docker, CI/CD, and cloud hosting.",
    },
    {
      title: "Performance and UX",
      body: "Faster loads, smoother interactions, and accessible, responsive interfaces that people actually enjoy using.",
    },
  ],
  toolkit: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "Redis",
    "Socket.IO",
    "Docker",
    "Google Gemini",
    "Tailwind CSS",
    "Stripe",
  ],
};

export type Role = {
  period: string;
  company: string;
  role: string;
  blurb: string;
  tags: string[];
};

export const experience: Role[] = [
  {
    period: "Aug 2024 to Present",
    company: "Cavista",
    role: "Software Engineer",
    blurb:
      "Building and maintaining production healthcare software used by home health, hospice, and palliative care providers. Cut recurring defects by about 15% and shipped reusable UI components that speed up delivery.",
    tags: ["Aurelia.js", "TypeScript", "C#", "REST APIs"],
  },
  {
    period: "Jan 2025 to May 2026",
    company: "FoodCS",
    role: "Software Engineer (Contract)",
    blurb:
      "Architected and delivered an AI-powered marketplace end to end, with semantic expert matching, real-time messaging, escrow payments, and digital contracts.",
    tags: ["Next.js", "Node.js", "PostgreSQL", "Stripe"],
  },
  {
    period: "Jan 2023 to Sep 2024",
    company: "Aufera",
    role: "Frontend Engineer",
    blurb:
      "Built features for a peer-to-peer vehicle-sharing platform and its insurance dashboard, added 17+ reusable components, and introduced TypeScript to the codebase.",
    tags: ["React", "TypeScript", "JavaScript"],
  },
  {
    period: "Aug 2022 to May 2023",
    company: "Harbor Inc. Technologies",
    role: "Frontend Developer",
    blurb:
      "Designed and built a responsive corporate website that lifted engagement by 30%, and cut page load time from seven seconds to two.",
    tags: ["HTML", "CSS", "JavaScript"],
  },
];
