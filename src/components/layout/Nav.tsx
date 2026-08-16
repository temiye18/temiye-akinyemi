"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { nav, site } from "@/lib/content";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Mode2D3DToggle from "@/components/ui/Mode2D3DToggle";

// section ids in document order; index 0 (hero) means "no link active"
const SECTIONS = ["top", "work", "about", "capabilities", "experience", "contact"];

/**
 * Floating console nav. Contained capsules rather than a full-width bar, with a
 * pill indicator that tracks the current section as you scroll (and previews on
 * hover). Stays flat while the content orbits behind it in 3D.
 */
export default function Nav() {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const listRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0, shown: false });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  // position the pill under the target link
  useEffect(() => {
    if (target === null) {
      setPill((p) => ({ ...p, shown: false }));
      return;
    }
    const el = linkRefs.current[target];
    const list = listRef.current;
    if (!el || !list) return;
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setPill({ left: er.left - lr.left, width: er.width, shown: true });
  }, [target, scrolled]);

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

  const capsule =
    "rounded-full border backdrop-blur-md transition-colors duration-500";
  const capsuleTone = scrolled
    ? "border-[var(--color-line-strong)] bg-[color-mix(in_srgb,var(--color-ground)_72%,transparent)]"
    : "border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-ground)_45%,transparent)]";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          {/* brand */}
          <a
            href="#top"
            data-cursor-target
            className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--color-ink)]"
          >
            {site.name.split(" ")[0]}
            <span className="italic text-[var(--color-muted)]">.</span>
          </a>

          {/* links — floating capsule with a tracking indicator */}
          <div className={`${capsule} ${capsuleTone} hidden p-1.5 md:block`}>
            <ul ref={listRef} className="relative flex items-center">
              <motion.span
                aria-hidden
                className="absolute inset-y-0 rounded-full bg-[var(--color-accent-soft)]"
                initial={false}
                animate={{
                  left: pill.left,
                  width: pill.width,
                  opacity: pill.shown ? 1 : 0,
                }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 34 }
                }
              />
              {nav.map((item, i) => {
                const isActive = activeNavIndex === i;
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
                      className={`block px-4 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${
                        isActive
                          ? "text-[var(--color-ink)]"
                          : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* controls */}
          <div className="flex items-center gap-3">
            <div className={`${capsule} ${capsuleTone} hidden items-center gap-1 p-1 sm:flex`}>
              <Mode2D3DToggle />
              <span className="h-4 w-px bg-[var(--color-line)]" />
              <ThemeToggle />
            </div>

            {/* mobile menu button */}
            <button
              type="button"
              data-cursor-target
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={`${capsule} ${capsuleTone} grid h-10 w-10 place-items-center text-[var(--color-ink)] md:hidden`}
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
                    className="flex items-baseline gap-4 border-b border-[var(--color-line)] py-4 font-[family-name:var(--font-display)] text-[2.5rem] leading-none tracking-tight"
                  >
                    <span className="eyebrow text-[var(--color-faint)]">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="mt-10 flex items-center justify-end gap-2">
              <Mode2D3DToggle />
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
