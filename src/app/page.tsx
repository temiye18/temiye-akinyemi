import Nav from "@/components/layout/Nav";
import Hero from "@/components/sections/Hero";
import SelectedWork from "@/components/sections/SelectedWork";
import KineticBand from "@/components/sections/KineticBand";
import About from "@/components/sections/About";
import Craft from "@/components/sections/Craft";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SelectedWork />
        <KineticBand />
        <About />
        <Craft />
        <Contact />
      </main>
    </>
  );
}
