"use client";

import { Code2, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/5 py-12 px-6 relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        {/* Brand & Trust */}
        <div className="flex flex-col gap-2">
          <div className="font-display font-bold text-xl tracking-tight text-white mb-2">
            Tiltless.
          </div>
          <div className="flex items-center gap-2 text-brand-mint text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Read-only. No wallet connect.</span>
          </div>
          <p className="text-white/40 text-xs max-w-sm mt-2 leading-relaxed">
            Every number is deterministically computed in code by the stats engine, not hallucinated by the AI.
          </p>
        </div>

        {/* Links & Disclaimer */}
        <div className="flex flex-col md:items-end gap-4">
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <Code2 className="w-4 h-4" />
              Source Code
            </a>
            <span className="text-white/20">|</span>
            <span className="text-brand-mint/80 text-sm font-mono bg-brand-mint/10 px-2 py-0.5 rounded border border-brand-mint/20">
              Built for Colosseum
            </span>
          </div>
          
          <p className="text-white/30 text-[10px] md:text-right max-w-sm leading-relaxed uppercase tracking-wider">
            Disclaimer: For informational purposes only. Not financial advice. Past behavior does not guarantee future tilt.
          </p>
        </div>
      </div>
    </footer>
  );
}
