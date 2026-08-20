"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useLenis } from "lenis/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Menu01Icon,
  Cancel01Icon,
  Briefcase01Icon,
  UserCircleIcon,
  SparklesIcon,
  WorkHistoryIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { nav, site } from "@/lib/content";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Mode2D3DToggle from "@/components/ui/Mode2D3DToggle";
import DashboardToggle from "@/components/ui/DashboardToggle";
import { useUIMode } from "@/components/providers/UIMode";

// section ids in document order; index 0 (hero) means "no link active"
const SECTIONS = ["top", "work", "about", "capabilities", "experience", "contact"];

const NAV_ICONS: Record<string, typeof Menu01Icon> = {
  "#work": Briefcase01Icon,
  "#about": UserCircleIcon,
  "#capabilities": SparklesIcon,
  "#experience": WorkHistoryIcon,
  "#contact": Mail01Icon,
};

/**
 * Floating console nav. Contained capsules rather than a full-width bar, with a
 * pill indicator that tracks the current section as you scroll (and previews on
 * hover). Stays flat while the content orbits behind it in 3D.
 */
export default function Nav() {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const { dashboard } = useUIMode();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const listRef = useRef<HTMLUListElement>(null);

  // indicator position driven by motion values (not React state), so measuring
  // the DOM after render never triggers a re-render
  const pillLeft = useMotionValue(0);
  const pillWidth = useMotionValue(0);
  const pillOpacity = useMotionValue(0);
  const springCfg = { stiffness: 400, damping: 34 };
  const sLeft = useSpring(pillLeft, springCfg);
  const sWidth = useSpring(pillWidth, springCfg);
  const sOpacity = useSpring(pillOpacity, { stiffness: 300, damping: 30 });

  // active section
  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(
      Boolean,
    ) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = SECTIONS.indexOf(e.target.id);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // which nav link the active section maps to (hero -> none)
  const activeNavIndex = nav.findIndex(
    (item) => item.href === `#${SECTIONS[active]}`,
  );
  const target = hovered ?? (activeNavIndex >= 0 ? activeNavIndex : null);

  // position the pill under the target link (motion values, no re-render)
  useEffect(() => {
    if (target === null) {
      pillOpacity.set(0);
      return;
    }
    const el = linkRefs.current[target];
    const list = listRef.current;
    if (!el || !list) return;
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    pillLeft.set(er.left - lr.left);
    pillWidth.set(er.width);
    pillOpacity.set(1);
  }, [target, pillLeft, pillWidth, pillOpacity]);

  // lock scroll while the mobile menu is open
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [open, lenis]);

  // close the mobile menu, then smooth-scroll to the target
  const goMobile = (href: string) => {
    setOpen(false);
    requestAnimationFrame(() => {
      lenis?.start();
      lenis?.scrollTo(href, { offset: -80 });
    });
  };

  const glass = "liquid-glass liquid-glass-interactive relative rounded-full";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          {/* brand */}
          <a
            href="#top"
            data-cursor-target
            className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--color-ink)]"
          >
            {site.name.split(" ")[0]}
            <span className="italic text-[var(--color-muted)]">.</span>
          </a>

          {/* links — floating capsule with a tracking indicator (site mode only) */}
          <div
            className={`${glass} hidden p-1.5 ${dashboard ? "" : "md:block"}`}
          >
            <ul ref={listRef} className="relative flex items-center">
              <motion.span
                aria-hidden
                className="absolute inset-y-0 rounded-full bg-[var(--color-accent-soft)]"
                style={
                  reduce
                    ? { left: pillLeft, width: pillWidth, opacity: pillOpacity }
                    : { left: sLeft, width: sWidth, opacity: sOpacity }
                }
              />
              {nav.map((item, i) => {
                const isActive = activeNavIndex === i;
                const showIcon = isActive || hovered === i;
                return (
                  <li key={item.href} className="relative z-10">
                    <a
                      ref={(el) => {
                        linkRefs.current[i] = el;
                      }}
                      href={item.href}
                      data-cursor-target
                      onPointerEnter={() => setHovered(i)}
                      onPointerLeave={() => setHovered(null)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${
                        isActive
                          ? "text-[var(--color-ink)]"
                          : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      <HugeiconsIcon
                        icon={NAV_ICONS[item.href]}
                        size={13}
                        strokeWidth={1.7}
                        className={`transition-[opacity,transform] duration-300 ease-[var(--ease-out-expo)] ${
                          showIcon
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-1 opacity-0"
                        }`}
                      />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* controls */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center sm:flex">
              <DashboardToggle />
            </div>
            {!dashboard && (
              <div className="hidden items-center lg:flex">
                <Mode2D3DToggle />
              </div>
            )}
            <div className="hidden items-center sm:flex">
              <ThemeToggle />
            </div>

            {/* mobile menu button */}
            <button
              type="button"
              data-cursor-target
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={`${glass} grid h-10 w-10 place-items-center text-[var(--color-ink)] md:hidden`}
            >
              <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={1.6} />
            </button>
          </div>
        </nav>
      </header>

      {/* mobile overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-[var(--color-ground)] px-6 pb-10 pt-5 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                {site.name.split(" ")[0]}
                <span className="italic text-[var(--color-muted)]">.</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-ink)]"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.6} />
              </button>
            </div>

            <ul className="mt-auto flex flex-col gap-1">
              {nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      goMobile(item.href);
                    }}
                    className="flex items-center gap-4 border-b border-[var(--color-line)] py-4 font-[family-name:var(--font-display)] text-[2.5rem] leading-none tracking-tight"
                  >
                    <span className="eyebrow text-[var(--color-faint)]">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <HugeiconsIcon
                      icon={NAV_ICONS[item.href]}
                      size={22}
                      strokeWidth={1.5}
                      className="text-[var(--color-muted)]"
                    />
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4">
              {/* switching surface here also closes the menu, so the chosen
                  surface is revealed instead of sitting under this overlay */}
              <div onClick={() => setOpen(false)} className="w-fit">
                <DashboardToggle />
              </div>
              <div className="flex items-center justify-between">
                <Mode2D3DToggle />
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
