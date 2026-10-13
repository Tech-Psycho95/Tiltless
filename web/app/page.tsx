"use client";

import Scene3DWrapper from "@/components/canvas/Scene3DWrapper";
import { SmoothScroll } from "@/components/SmoothScroll";
import { HowItWorks } from "@/components/HowItWorks";
import { FindingsPreview } from "@/components/FindingsPreview";
import { LiveDemo } from "@/components/LiveDemo";
import { Footer } from "@/components/Footer";
import { ProblemSection } from "@/components/ProblemSection";
import { SampleAutopsy } from "@/components/SampleAutopsy";
import { UnderTheHood } from "@/components/UnderTheHood";
import { SiteNav } from "@/components/SiteNav";
import { ComparisonSection } from "@/components/ComparisonSection";
import { FAQ } from "@/components/FAQ";
import { Roadmap } from "@/components/Roadmap";
import { FinalCTA } from "@/components/FinalCTA";
import { AuthGate } from "@/components/AuthGate";

export default function Home() {
  return (
    <AuthGate requireAuth={true}>
      <SmoothScroll>
      <main id="top" className="min-h-screen">
        <SiteNav />

        {/* Hero Section Shell */}
        <section className="relative h-screen w-full flex flex-col items-center justify-center pt-20 px-6 overflow-hidden pointer-events-none">
          {/* 3D Scene Background */}
          <div className="absolute inset-0 w-full h-full -z-10 pointer-events-auto">
            <Scene3DWrapper />
          </div>
          
          <div className="z-10 text-center max-w-4xl mx-auto mt-[-10vh] pointer-events-auto">
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Your PnL shows what happened. <br />
              <span className="text-brand-mint text-glow">Tiltless shows why.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto font-sans">
              An AI trading coach that autopsies your Hyperliquid wallet to find fee drag,
              tilt, and hidden leaks.
            </p>
            
            <div className="w-full max-w-xl mx-auto glass-card p-2 flex flex-col sm:flex-row gap-2 relative z-20">
              <input 
                type="text" 
                placeholder="0x..." 
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-white placeholder-white/40 font-mono text-sm"
              />
              <button className="bg-brand-mint text-brand-bg font-semibold px-6 py-3 rounded-xl hover:bg-brand-mint/90 transition-colors">
                Autopsy this wallet
              </button>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="text-sm text-white/50 my-auto mr-2">Try an example:</span>
              <button 
                onClick={() => {
                  const input = document.querySelector('input[placeholder="0x..."]') as HTMLInputElement;
                  if (input) {
                    input.value = "0x102a618b36c32b338c03526255dcf2a39eb1897f";
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                  document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-mono bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-colors hover:border-brand-mint/50"
              >
                0x102a...897f
              </button>
              <button 
                onClick={() => {
                  const input = document.querySelector('input[placeholder="0x..."]') as HTMLInputElement;
                  if (input) {
                    input.value = "0xeadc152ac1014ace57c6b353f89adf5faffe9d55";
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                  document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-mono bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-colors hover:border-brand-mint/50"
              >
                0xeadc...9d55
              </button>
            </div>
          </div>
        </section>

        <ProblemSection />
        <div id="how-it-works"><HowItWorks /></div>
        <div id="findings"><FindingsPreview /></div>
        <SampleAutopsy />
        <LiveDemo />
        <UnderTheHood />
        <ComparisonSection />
        <FAQ />
        <Roadmap />
        <FinalCTA />
        <Footer />
      </main>
    </SmoothScroll>
    </AuthGate>
  );
}
