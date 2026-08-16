"use client";

import { motion, useReducedMotion } from "motion/react";
import { createElement } from "react";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
};

/**
 * Word-by-word masked reveal: each word rises out from under an overflow clip.
 * The classic premium heading reveal. Collapses to plain text for reduced-motion
 * and keeps the full string readable to screen readers either way.
 */
export default function MaskText({
  text,
  as = "span",
  className,
  delay = 0,
  stagger = 0.06,
  once = true,
}: Props) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return createElement(as, { className }, text);
  }

  return createElement(
    as,
    { className, "aria-label": text },
    words.map((word, i) => (
      <span
        key={i}
        aria-hidden
        className="mr-[0.26em] inline-block overflow-hidden pb-[0.12em] align-bottom"
      >
        <motion.span
          className="inline-block"
          initial={{ y: "110%" }}
          whileInView={{ y: 0 }}
          viewport={{ once, margin: "-8% 0px" }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
            delay: delay + i * stagger,
          }}
        >
          {word}
        </motion.span>
      </span>
    )),
  );
}
