import CapabilityIndex from "@/components/sections/CapabilityIndex";

/**
 * Capabilities: the disciplines and the toolkit as one working index (see
 * CapabilityIndex). Every word comes from content.ts.
 */
export default function Capabilities() {
  return (
    <section
      id="capabilities"
      className="border-t border-[var(--color-line)] px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto w-full max-w-[1360px]">
        <CapabilityIndex />
      </div>
    </section>
  );
}
