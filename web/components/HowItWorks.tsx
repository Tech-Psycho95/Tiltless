"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const steps = [
  {
    title: "Paste address",
    desc: "No wallet connect. No signatures. Just paste a Hyperliquid address.",
  },
  {
    title: "Agent investigates",
    desc: "Our AI pulls public fills, funding rates, and positions, analyzing behavior.",
  },
  {
    title: "Get the autopsy",
    desc: "Read a plain-English breakdown of fee drag, tilt, and hidden leaks.",
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    // Pin the section and animate text reveals
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: 1,
      },
    });

    textRefs.current.forEach((el, index) => {
      if (!el) return;
      tl.to(el, { opacity: 1, y: 0, duration: 1 }, index * 1)
        .to(el, { opacity: 0.2, y: -20, duration: 1 }, (index + 1) * 1);
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={containerRef} className="h-screen w-full flex items-center bg-brand-bg relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(151,252,228,0.05)_0%,rgba(7,9,11,1)_70%)]" />
      
      <div className="max-w-6xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between z-10">
        
        {/* Left text */}
        <div className="w-full md:w-1/2 flex flex-col justify-center h-[50vh] md:h-[80vh] relative">
          {steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => { textRefs.current[i] = el; }}
              className="absolute top-1/2 -translate-y-1/2 opacity-0 transform translate-y-10"
            >
              <div className="text-brand-mint font-mono text-sm mb-4">0{i + 1}</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">{step.title}</h2>
              <p className="text-white/70 text-lg max-w-md">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Right visual placeholder */}
        <div className="w-full md:w-1/2 h-[40vh] md:h-[60vh] glass-card flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay"></div>
           <p className="text-white/30 font-mono text-sm">Visuals synchronized with scroll...</p>
        </div>
      </div>
    </section>
  );
}
