import Nav from "@/components/layout/Nav";
import Hero from "@/components/sections/Hero";
import SelectedWork from "@/components/sections/SelectedWork";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import TelemetryHUD from "@/components/layout/TelemetryHUD";
import SpacePlane from "@/components/layout/SpacePlane";

export default function Home() {
  return (
    <>
      <Nav />
      <TelemetryHUD />
      <SpacePlane>
        <Hero />
        <SelectedWork />
        <About />
        <Capabilities />
        <Experience />
        <Contact />
      </SpacePlane>
    </>
  );
}
