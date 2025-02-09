"use client"
import CTA from "~/components/landing/cta";
import FAQ from "~/components/landing/faq";
import Footer from "~/components/landing/footer";
import Header from "~/components/landing/header";
import Hero from "~/components/landing/hero";
import Particles from "~/components/landing/particles";
import Glow from "@repo/ui/components/ui/glow";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[100vh]">
        {/* Content */}
        <Header />
        <Hero />

        {/* Other */}
        <Particles
          className="absolute inset-0 -z-10"
          quantity={50}
          ease={70}
          size={0.05}
          staticity={40}
          color={"#ffffff"}
        />
        <div className="absolute top-[30px] blur-[100px] h-32 w-[1050px] -left-12 z-[-1]">
          <Glow />
        </div>
        <div className="absolute bottom-[30px] blur-[100px] h-32 w-[1050px] -right-12 z-[-1]">
          <Glow align="right" />
        </div>
      </section>


      {/* TODO: Features, Testimonials */}
      <section className="py-12">
        <FAQ />
      </section>

      <section className="py-12">
        <CTA />
      </section>
      <Footer />
    </>
  );
}
