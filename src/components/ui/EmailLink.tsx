"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import Magnetic from "@/components/motion/Magnetic";

/**
 * The contact address as two honest actions: open it in a mail client, or copy
 * it (for the many people whose mailto opens the wrong app, or none). The copy
 * confirms in place and is announced to screen readers.
 */
export default function EmailLink({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const addressRef = useRef<HTMLSpanElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard blocked (permissions, insecure context): select the address
      // so a plain Ctrl/Cmd+C finishes the job.
      const el = addressRef.current;
      if (el) window.getSelection()?.selectAllChildren(el);
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <Magnetic strength={10}>
        <a
          href={`mailto:${email}`}
          data-cursor-target
          className="group inline-flex items-center gap-4 text-xl text-[var(--color-ink)] sm:text-2xl"
        >
          <span
            ref={addressRef}
            className="border-b border-[var(--color-line-strong)] pb-1 transition-colors group-hover:border-[var(--color-ink)]"
          >
            {email}
          </span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={22}
            strokeWidth={1.6}
            className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
          />
        </a>
      </Magnetic>

      <button
        type="button"
        onClick={copy}
        data-cursor-target
        aria-label={copied ? "Email address copied" : "Copy email address"}
        className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-sm text-[var(--color-muted)] transition-colors duration-300 hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
      >
        <span className="relative grid h-4 w-4 place-items-center">
          <HugeiconsIcon
            icon={Copy01Icon}
            size={15}
            strokeWidth={1.6}
            className={`absolute transition-[opacity,transform] duration-300 ease-[var(--ease-out-expo)] ${
              copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
            }`}
          />
          <HugeiconsIcon
            icon={Tick02Icon}
            size={15}
            strokeWidth={1.8}
            className={`absolute text-[var(--color-ink)] transition-[opacity,transform] duration-300 ease-[var(--ease-out-expo)] ${
              copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          />
        </span>
        <span aria-hidden>{copied ? "Copied" : "Copy"}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </div>
  );
}
