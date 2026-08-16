import Nav from "@/components/layout/Nav";
import Hero from "@/components/sections/Hero";
import SelectedWork from "@/components/sections/SelectedWork";
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
        <About />
        <Craft />
        <Contact />
      </main>
    </>
  );
}
