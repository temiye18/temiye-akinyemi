import Nav from "@/components/layout/Nav";
import Hero from "@/components/sections/Hero";
import SelectedWork from "@/components/sections/SelectedWork";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import TelemetryHUD from "@/components/layout/TelemetryHUD";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function Home() {
  return (
    <>
      <Nav />
      <TelemetryHUD />
      <main>
        <Hero />
        <SelectedWork />

        {/* scroll-scrubbed manifesto — words fill from faint to ink */}
        <section className="border-t border-[var(--color-line)] px-6 py-36 sm:px-10 lg:px-16 lg:py-56">
          <div className="mx-auto w-full max-w-[1360px]">
            <ScrollReveal
              text="I build fast, considered software, and I sweat the details other people skip."
              className="max-w-[16ch] font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,5rem)] font-medium leading-[1.06] tracking-tight text-[var(--color-ink)]"
            />
          </div>
        </section>

        <About />
        <Capabilities />
        <Experience />
        <Contact />
      </main>
    </>
  );
}
