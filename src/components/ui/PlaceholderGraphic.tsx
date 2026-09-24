import SignalGraphic from "@/components/ui/SignalGraphic";

/** Framed signal graphic used on case pages for projects with no live site. */
export default function PlaceholderGraphic({
  caption,
  transitionName,
}: {
  caption?: string;
  transitionName?: string;
}) {
  return (
    <figure
      style={transitionName ? { viewTransitionName: transitionName } : undefined}
      className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
      <SignalGraphic />
      {caption && (
        <figcaption className="eyebrow pointer-events-none absolute bottom-4 left-4 text-[var(--color-faint)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
