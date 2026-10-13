"use client";

import { motion } from "framer-motion";

const rows = [
  ["Shows numbers", "Explains behavior"],
  ["Static dashboard", "Interactive follow-ups"],
  ["Manual analysis", "Agent investigation"],
  ["One view of PnL", "Evidence across fills, funding, and streaks"],
  ["You find the pattern", "The report points to the pattern"],
];

export function ComparisonSection() {
  return (
    <motion.section id="comparison" className="relative z-10 bg-brand-bg px-6 py-28 md:py-36" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}>
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-brand-mint/70">A different lens</p>
        <h2 className="mb-12 font-display text-4xl font-bold md:text-5xl">Tiltless vs a normal dashboard</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-2 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs uppercase tracking-widest text-white/40 md:px-8"><span>Normal dashboard</span><span className="text-brand-mint/80">Tiltless</span></div>
          {rows.map(([normal, tiltless], index) => <div key={normal} className={`grid grid-cols-2 gap-5 px-5 py-5 text-sm md:px-8 ${index % 2 ? "bg-white/[0.015]" : ""}`}><span className="text-white/50">{normal}</span><span className="text-white/85">{tiltless}</span></div>)}
        </div>
        <p className="mt-5 text-xs text-white/30">A dashboard and an autopsy serve different jobs. Tiltless focuses on explaining past behavior.</p>
      </div>
    </motion.section>
  );
}
