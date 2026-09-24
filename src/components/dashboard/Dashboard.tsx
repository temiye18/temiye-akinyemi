"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { gsap } from "@/lib/gsap";
import { site } from "@/lib/content";
import { useUIMode } from "@/components/providers/UIMode";
import { useThreeD } from "@/components/providers/ThreeDMode";
import { useSpaceOrbit } from "@/lib/useSpaceOrbit";
import LocalTime from "@/components/ui/LocalTime";
import { ROOMS } from "@/components/dashboard/rooms";

/* ------------------------------------------------------------------ *
 * DIRECTION CONTRACT: Dashboard ("The House")
 *
 * THESIS: One room, partitioned by sliding planes. The dashboard is not a
 *   grid of tiles; it is a small house you operate, where every route is a
 *   position of the panels. Refuses the bento of equal glass cards.
 * OWN-WORLD: Inherited warm monochrome. Tonal planes (surface, surface-2)
 *   joined by honest hairline joints; the moving edge is marked in ink; one
 *   solid plane (Contact) set in the other theme. Square corners, Fraunces
 *   for names and titles with the italic as the one emphasis, Geist Mono only
 *   for keys, counts and years.
 * STORY: A fixed wall holds who (portrait, name, status, a live plan of the
 *   room). Five panels hang on one track: Work, About, Capabilities,
 *   Experience, Contact. Slide them by the edge, flick a trackpad, press 1 to
 *   5, or click the plan; each opens a room at full size.
 * FIRST VIEWPORT: Wall at left (a quarter of the width), the room at right
 *   with Work open and four spines stacked at the right edge. One screen.
 * FORM: Sliding house (Rietveld Schroder), seed 5b8a857e, fused challenger.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with
 *   the finish review, the verdict, and DESIGN.md
 * ------------------------------------------------------------------ */

const N = ROOMS.length;
/** width of a panel's leading edge (its spine), px */
const SPINE = 52;
const STORE = "dash-room";

/** Where panel i sits for a track position t (0..N-1; -1 = all closed).
 *  Panels at or below t are open and stack at the left, one spine apart;
 *  panels above t wait at the right edge; the one in between travels. */
function doorX(i: number, t: number, w: number) {
  const open = i * SPINE;
  const closed = w - (N - i) * SPINE;
  if (t >= i) return open;
  if (t <= i - 1) return closed;
  return closed + (open - closed) * (t - (i - 1));
}

const clampT = (v: number) => Math.min(N - 1, Math.max(0, v));

function initialRoom() {
  try {
    const v = Number(sessionStorage.getItem(STORE));
    return Number.isInteger(v) && v >= 0 && v < N ? v : 0;
  } catch {
    return 0;
  }
}

export default function Dashboard() {
  const { setDashboard } = useUIMode();
  const { enabled: threeD } = useThreeD();
  const lenis = useLenis();
  const reduce = !!useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const doorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const edgeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const planDoorRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const planEdgeRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [room, setRoom] = useState(initialRoom);
  const roomNow = useRef(room);
  const [desk, setDesk] = useState(false);
  // desktop only: panel content rises once the entrance slide has begun
  const [revealed, setRevealed] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [dir, setDir] = useState(1);
  const [hasPhoto, setHasPhoto] = useState(true);

  // track position, width of the room and the plan (all live, no re-render)
  const t = useRef(0);
  const width = useRef(0);
  const planW = useRef(0);
  const tween = useRef<gsap.core.Tween | null>(null);

  // 3D mode: the whole house tilts as one plane, the same orbit the site plane
  // uses. "inline" bakes the perspective into the plane and flattens it: the
  // panels slide within the plane, they never need their own depth, and a
  // preserve-3d tree here cost dropped frames while they moved.
  const tilt = threeD && !reduce;
  useSpaceOrbit(planeRef, tilt, "center", "inline");
  // Flat, each panel rides its own GPU layer. Tilted, every such layer must be
  // flattened into the plane through an offscreen pass each frame, which cost
  // more than simply painting the panels into it; so under the tilt they move
  // on plain 2D transforms and stay in the plane's own layer.
  const layered = useRef(!tilt);

  /** Write every panel (and its twin in the plan) for the current t. */
  const apply = useCallback(() => {
    const w = width.current;
    if (!w) return;
    const tv = t.current;
    const k = planW.current / w;
    for (let i = 0; i < N; i++) {
      const x = doorX(i, tv, w);
      const lit = Math.max(0, 1 - Math.abs(tv - i)).toFixed(3);
      const d = doorRefs.current[i];
      if (d) d.style.transform = layered.current ? `translate3d(${x.toFixed(2)}px,0,0)` : `translateX(${x.toFixed(2)}px)`;
      const e = edgeRefs.current[i];
      if (e) e.style.opacity = lit;
      const p = planDoorRefs.current[i];
      // a plain 2D translate keeps the plan's panels out of their own layers:
      // under the 3D tilt, composited children inside a clip cost a GPU pass
      if (p) p.style.transform = `translateX(${(x * k).toFixed(2)}px)`;
      const pe = planEdgeRefs.current[i];
      if (pe) pe.style.opacity = (0.35 + 0.65 * Number(lit)).toFixed(3);
    }
  }, []);

  // toggling 3D while the house is open re-places the panels in the new mode
  useEffect(() => {
    layered.current = !tilt;
    apply();
  }, [tilt, apply]);

  const measure = useCallback(() => {
    const r = roomRef.current;
    if (!r) return;
    width.current = r.clientWidth;
    planW.current = planRef.current?.clientWidth ?? 0;
    const pw = (width.current - (N - 1) * SPINE) * (planW.current / (width.current || 1));
    planRef.current?.style.setProperty("--mini-w", `${pw.toFixed(2)}px`);
    apply();
  }, [apply]);

  /** Slide the house to room i. Far jumps take a little longer, so the panels
   *  between travel one after another like a train on the track. */
  const go = useCallback(
    (target: number) => {
      const next = Math.round(clampT(target));
      const prev = roomNow.current;
      if (prev !== next) {
        setDir(next > prev ? 1 : -1);
        setAnnounce(`${ROOMS[next].label}, ${next + 1} of ${N}`);
      }
      roomNow.current = next;
      setRoom(next);
      try {
        sessionStorage.setItem(STORE, String(next));
      } catch {}
      if (!desk) return;
      tween.current?.kill();
      const dist = Math.abs(next - t.current);
      if (reduce || dist < 0.001) {
        t.current = next;
        apply();
        return;
      }
      const duration = Math.min(1.35, 0.5 + 0.22 * dist);
      roomRef.current?.style.setProperty("--reveal-delay", `${(duration * 0.45).toFixed(2)}s`);
      tween.current = gsap.to(t, {
        current: next,
        duration,
        ease: "power3.inOut",
        onUpdate: apply,
      });
    },
    [desk, reduce, apply],
  );

  // Desktop is the sliding house; below lg the panels become swipeable
  // sheets. Decided (and the panels placed) before first paint.
  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setDesk(mq.matches);
      if (!mq.matches) {
        tween.current?.kill();
        for (const d of doorRefs.current) if (d) d.style.transform = "";
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Entrance: the room starts bare with every panel closed at the right; the
  // chosen one slides across. Reduced motion lands it in place.
  const entered = useRef(false);
  useLayoutEffect(() => {
    if (!desk) return;
    const first = !entered.current;
    entered.current = true;
    if (first && !reduce) t.current = -1;
    else t.current = roomNow.current;
    measure();
    const ro = new ResizeObserver(measure);
    if (roomRef.current) ro.observe(roomRef.current);
    if (planRef.current) ro.observe(planRef.current);
    let id = 0;
    if (first && !reduce) {
      id = window.setTimeout(() => {
        setRevealed(true);
        go(roomNow.current);
      }, 260);
    } else setRevealed(true);
    return () => {
      ro.disconnect();
      window.clearTimeout(id);
    };
    // go is left out: it changes with desk, which already re-runs this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desk, reduce, measure]);

  useEffect(() => () => void tween.current?.kill(), []);

  // phones: keep the open room's tab in view on the rail
  const railRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (desk) return;
    const tab = railRef.current?.children[room] as HTMLElement | undefined;
    tab?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [room, desk, reduce]);

  // send focus into the house so the keyboard path starts here
  useEffect(() => {
    scrollRef.current?.focus({ preventScroll: true });
  }, []);

  // A sideways flick on a trackpad slides the panels directly, then settles
  // on the nearest room. Vertical wheel stays with the room's own content.
  useEffect(() => {
    const el = roomRef.current;
    if (!el || !desk) return;
    let settle = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.2) return;
      e.preventDefault();
      tween.current?.kill();
      t.current = clampT(t.current + e.deltaX / (width.current - N * SPINE));
      apply();
      window.clearTimeout(settle);
      settle = window.setTimeout(() => go(t.current), 140);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settle);
    };
  }, [desk, apply, go]);

  // Drag a panel by its spine. Past a few pixels the pointer owns the track;
  // on release it settles on the nearest room, carried a little by the flick.
  const drag = useRef<{
    id: number;
    x: number;
    t0: number;
    moved: boolean;
    lx: number;
    lt: number;
    v: number;
  } | null>(null);
  const swallowClick = useRef(false);

  const spineHandlers = (i: number) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!desk || e.button !== 0) return;
      drag.current = { id: e.pointerId, x: e.clientX, t0: t.current, moved: false, lx: e.clientX, lt: e.timeStamp, v: 0 };
    },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x;
      if (!d.moved) {
        if (Math.abs(dx) < 5) return;
        d.moved = true;
        tween.current?.kill();
        d.t0 = t.current;
        d.x = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
      }
      const travel = width.current - N * SPINE;
      t.current = clampT(d.t0 - dx / travel);
      const dt = Math.max(1, e.timeStamp - d.lt);
      d.v = (-(e.clientX - d.lx) / travel / dt) * 1000;
      d.lx = e.clientX;
      d.lt = e.timeStamp;
      apply();
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = drag.current;
      drag.current = null;
      if (!d || !d.moved) return;
      swallowClick.current = true;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
      go(t.current + Math.max(-0.5, Math.min(0.5, d.v * 0.12)));
    },
    onPointerCancel: () => {
      if (drag.current?.moved) go(t.current);
      drag.current = null;
    },
    onClick: () => {
      if (swallowClick.current) {
        swallowClick.current = false;
        return;
      }
      go(i);
    },
  });

  // Phones: swipe the sheet sideways to the next or previous room.
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const sheetHandlers = desk
    ? {}
    : {
        onPointerDown: (e: React.PointerEvent) => {
          if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
        },
        onPointerUp: (e: React.PointerEvent) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s) return;
          const dx = e.clientX - s.x;
          const dy = e.clientY - s.y;
          if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.6) go(room + (dx < 0 ? 1 : -1));
        },
        onPointerCancel: () => {
          swipe.current = null;
        },
      };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= N) {
      e.preventDefault();
      go(n - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(room + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(room - 1);
    }
  };

  // leave the dashboard and land on a section of the scrolling site
  const enterSite = (href: string) => {
    setDashboard(false);
    // let the site become visible and Lenis restart, then glide to the anchor
    let tries = 0;
    const find = () => {
      const el = document.querySelector(href);
      if (el && lenis) {
        lenis.scrollTo(el as HTMLElement, { offset: -80 });
      } else if (el) {
        el.scrollIntoView();
      } else if (tries++ < 8) {
        requestAnimationFrame(find);
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(find));
  };

  return (
    <motion.section
      aria-label="Portfolio dashboard"
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-40 bg-[var(--color-ground)]"
    >
      <div
        ref={scrollRef}
        tabIndex={-1}
        data-lenis-prevent
        className="relative h-full overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-6 pt-[4.5rem] outline-none [-webkit-overflow-scrolling:touch] sm:px-8 sm:pt-24 lg:overflow-hidden lg:px-8 lg:pb-5 lg:pt-[4.75rem]"
      >
        <div
          ref={planeRef}
          className="mx-auto w-full max-w-[1680px] lg:h-full"
        >
          <div data-tilt={tilt || undefined} className="house flex flex-col border border-[var(--color-line-strong)] bg-[var(--color-ground)] lg:grid lg:h-full lg:grid-cols-[minmax(17.5rem,25%)_minmax(0,1fr)]">
            {/* ---------------------------------------------------------- *
             * The wall: the one plane that never moves.
             * ---------------------------------------------------------- */}
            <aside className="house-wall grid grid-cols-[7.5rem_minmax(0,1fr)] border-b border-[var(--color-line-strong)] bg-[var(--color-surface)] sm:grid-cols-[10rem_minmax(0,1fr)] lg:flex lg:min-h-0 lg:flex-col lg:border-b-0 lg:border-r-2">
              <div className="house-rise relative row-span-2 min-h-[9.5rem] overflow-hidden border-r border-[var(--color-line-strong)] lg:min-h-0 lg:flex-1 lg:border-r-0">
                {hasPhoto ? (
                  <Image
                    src="/temiye.png"
                    alt={site.name}
                    fill
                    sizes="(max-width: 1024px) 160px, 25vw"
                    onError={() => setHasPhoto(false)}
                    className="object-cover object-[50%_18%]"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0 grid place-items-center font-[family-name:var(--font-display)] text-[7rem] leading-none text-[var(--color-line-strong)]"
                  >
                    T
                  </span>
                )}
              </div>

              <div className="house-rise p-4 sm:p-5 lg:border-t lg:border-[var(--color-line-strong)]" style={{ "--i": 1 } as React.CSSProperties}>
                <h2 className="font-[family-name:var(--font-display)] text-[1.45rem] font-medium leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)] sm:text-[1.7rem] lg:text-[clamp(1.5rem,1.9vw,2.05rem)]">
                  {site.name},
                  <span className="block font-normal italic text-[var(--color-muted)]">
                    software engineer.
                  </span>
                </h2>
                <p className="mt-3 flex items-start gap-2 text-[0.76rem] leading-snug text-[var(--color-muted)]">
                  <span aria-hidden className="mt-[0.4em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-ink)]" />
                  <span>
                    {site.status}
                    <span className="text-[var(--color-faint)]">
                      {" · "}
                      <LocalTime />
                    </span>
                  </span>
                </p>
              </div>

              {/* the plan: a live drawing of the room, drawn from the same track */}
              <div className="house-rise hidden border-t border-[var(--color-line-strong)] p-5 lg:block" style={{ "--i": 2 } as React.CSSProperties}>
                <div
                  ref={planRef}
                  aria-hidden
                  className="relative h-[5.5rem] overflow-hidden border border-[var(--color-line-strong)] bg-[var(--color-ground)]"
                >
                  {ROOMS.map((r, i) => (
                    <button
                      key={r.id}
                      type="button"
                      tabIndex={-1}
                      ref={(el) => {
                        planDoorRefs.current[i] = el;
                      }}
                      onClick={() => go(i)}
                      data-tone={r.tone}
                      className={`house-mini absolute inset-y-0 left-0 w-[var(--mini-w)] border-l border-[var(--color-line-strong)] ${r.tone === "inverse" ? "plane-inverse" : ""}`}
                    >
                      <span
                        ref={(el) => {
                          planEdgeRefs.current[i] = el;
                        }}
                        className="absolute inset-y-0 left-0 w-px bg-[var(--color-ink)] opacity-35"
                      />
                      <span className="absolute left-[4px] top-[5px] font-[family-name:var(--font-mono)] text-[0.55rem] leading-none text-[var(--color-muted)]">
                        {i + 1}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <p className="font-[family-name:var(--font-display)] text-[1.05rem] italic text-[var(--color-ink)]">
                    {ROOMS[room].label.toLowerCase()}
                  </p>
                  <p className="font-[family-name:var(--font-mono)] text-[0.66rem] tracking-[0.12em] text-[var(--color-faint)] [font-variant-numeric:tabular-nums]">
                    {room + 1} / {N}
                  </p>
                </div>
                <p className="mt-1.5 text-[0.72rem] leading-snug text-[var(--color-muted)]">
                  Drag a panel by its edge, or press 1 to 5.
                </p>
              </div>

              <div className="house-rise col-span-2 border-t border-[var(--color-line-strong)] p-4 sm:p-5 lg:col-auto" style={{ "--i": 3 } as React.CSSProperties}>
                <button type="button" onClick={() => enterSite("#top")} className="house-btn w-full">
                  <span>Enter the site</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.8} />
                </button>
              </div>
            </aside>

            {/* ---------------------------------------------------------- *
             * The room: five panels on one track.
             * ---------------------------------------------------------- */}
            <div className="flex min-h-0 flex-col">
              {/* phones: the track as a rail of spines */}
              <nav ref={railRef} aria-label="Rooms" className="house-rail flex overflow-x-auto border-b border-[var(--color-line-strong)] bg-[var(--color-ground)] lg:hidden">
                {ROOMS.map((r, i) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-controls={`room-${r.id}`}
                    aria-expanded={room === i}
                    className="relative shrink-0 border-r border-[var(--color-line)] px-4 py-3 font-[family-name:var(--font-display)] text-[1rem] lowercase text-[var(--color-muted)] aria-expanded:text-[var(--color-ink)] aria-expanded:italic"
                  >
                    {r.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[var(--color-ink)] transition-transform duration-500 ease-[var(--ease-out-expo)] ${room === i ? "scale-x-100" : "scale-x-0"}`}
                    />
                  </button>
                ))}
              </nav>

              <div
                ref={roomRef}
                className="house-room relative min-h-0 flex-1 bg-[var(--color-ground)]"
                style={{ "--spine": `${SPINE}px`, "--dir": dir } as React.CSSProperties}
                {...sheetHandlers}
              >
                {/* The closed panels run on past the room's right edge. Rather
                    than clip them (a clip over moving layers costs a GPU pass
                    per frame once the house tilts in 3D), a jamb in the ground
                    colour stands beyond the edge and hides them. */}
                <span aria-hidden className="house-jamb hidden lg:block" />
                {ROOMS.map((r, i) => {
                  const Room = r.Content;
                  const current = room === i;
                  return (
                    <div
                      key={r.id}
                      ref={(el) => {
                        doorRefs.current[i] = el;
                      }}
                      data-tone={r.tone}
                      data-active={current || undefined}
                      data-open={(desk ? revealed && current : current) || undefined}
                      data-side={desk && i > room ? "closed" : undefined}
                      style={{ zIndex: i + 1 }}
                      className={`house-door ${r.tone === "inverse" ? "plane-inverse" : ""}`}
                    >
                      <div className="house-door-inner flex">
                        {/* the leading edge: grab it, click it, or press its key */}
                        <button
                          type="button"
                          {...spineHandlers(i)}
                          aria-controls={`room-${r.id}`}
                          aria-expanded={current}
                          aria-label={`${r.label} (key ${i + 1})`}
                          className="house-spine relative hidden w-[var(--spine)] shrink-0 touch-none select-none flex-col items-center justify-between border-r border-[var(--color-line)] py-4 lg:flex"
                        >
                          <span
                            aria-hidden
                            ref={(el) => {
                              edgeRefs.current[i] = el;
                            }}
                            className="absolute inset-y-0 left-0 w-[3px] bg-[var(--color-ink)] opacity-0"
                          />
                          <kbd className="grid h-[1.3rem] w-[1.3rem] place-items-center border border-[var(--color-line-strong)] font-[family-name:var(--font-mono)] text-[0.62rem] text-[var(--color-muted)]">
                            {i + 1}
                          </kbd>
                          <span
                            aria-hidden
                            className="lean rotate-180 font-[family-name:var(--font-display)] text-[1.3rem] lowercase leading-none tracking-[-0.01em] text-[var(--color-muted)] [writing-mode:vertical-rl]"
                            data-on={current || undefined}
                          >
                            <span className="lean-roman">{r.label}</span>
                            <span className="lean-italic italic text-[var(--color-ink)]">{r.label}</span>
                          </span>
                          <span aria-hidden className="rotate-180 text-[0.66rem] tracking-[0.04em] text-[var(--color-muted)] [writing-mode:vertical-rl]">
                            {r.count ?? ""}
                          </span>
                        </button>

                        {/* Only on desktop is a room its own scroller (the panel has a fixed
                            height there). On phones the sheet grows with its content and the
                            page scrolls, so no overflow or overscroll-contain here: an
                            unscrollable container with overscroll-contain swallows every
                            swipe that starts on it. */}
                        <div
                          id={`room-${r.id}`}
                          role="region"
                          aria-label={r.label}
                          inert={desk && !current ? true : undefined}
                          className="house-scroll min-w-0 flex-1 lg:overflow-y-auto lg:overscroll-contain"
                          data-lenis-prevent
                        >
                          <Room
                            index={i}
                            go={go}
                            enterSite={enterSite}
                            next={ROOMS[(i + 1) % N]}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </motion.section>
  );
}
