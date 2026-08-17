/**
 * Pure-CSS monochrome "signal" graphic used where a project has no live site:
 * static concentric rings, a dotted field, a crosshair, and emanating pings.
 * No canvas, so nothing to crash; theme-aware via tokens; reduced-motion shows
 * the static rings without the pings.
 */
export default function SignalGraphic() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* dotted field */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-line-strong) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* crosshair */}
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[var(--color-line)]" />
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--color-line)]" />

      {/* static concentric rings */}
      {[34, 58, 82].map((s) => (
        <span
          key={s}
          style={{ height: `${s}%` }}
          className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-line)]"
        />
      ))}

      {/* emanating pings (wrapper centres; inner spans scale) */}
      <div className="absolute left-1/2 top-1/2 aspect-square h-[82%] -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{ animationDelay: `${-i * 1.6}s` }}
            className="signal-ring absolute inset-0 rounded-full border border-[var(--color-ink)]"
          />
        ))}
      </div>

      {/* centre node */}
      <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-line-strong)]" />
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-ink)]" />
    </div>
  );
}
