"use client";

import { ArrowDownRight, Check, FileText } from "lucide-react";
import { motion } from "framer-motion";

const findings = [
  { title: "Fee drag is concentrated in small wins.", evidence: ["fee / gross PnL", "small-profit trades"] },
  { title: "Position size rises after a loss streak.", evidence: ["after 3+ losses", "size vs baseline"] },
  { title: "Funding is a recurring cost on held longs.", evidence: ["funding paid", "long positions"] },
];

export function SampleAutopsy() {
  const scrollToInput = () => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });

  return (
    <motion.section
      id="sample"
      className="relative z-10 bg-brand-bg px-6 py-28 md:py-36"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-brand-mint/70">Sample autopsy</p>
            <h2 className="font-display text-4xl font-bold md:text-5xl">A report you can act on.</h2>
          </div>
          <span className="w-fit rounded-full border border-brand-mint/25 bg-brand-mint/5 px-3 py-1 font-mono text-xs text-brand-mint">Example data</span>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 md:px-10">
            <div className="flex items-center gap-3 text-white/60"><FileText className="h-4 w-4 text-brand-mint" /><span className="font-mono text-xs">WALLET AUTOPSY / EXAMPLE</span></div>
            <span className="font-mono text-xs text-white/30">public fills</span>
          </div>
          <div className="grid gap-10 p-6 md:grid-cols-[.8fr_1.2fr] md:p-10">
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-white/35">Summary</p>
              <p className="text-lg leading-relaxed text-white/80">The account is active, but its weakest sessions share a pattern: more size after losses, more trades to recover, and costs that stay elevated.</p>
              <div className="mt-8 flex items-center gap-2 text-sm text-brand-mint"><ArrowDownRight className="h-4 w-4" />Behavior, not a buy or sell signal.</div>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-white/35">Top findings</p>
              <div className="space-y-4">
                {findings.map((finding, index) => (
                  <div key={finding.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-2 flex gap-3"><span className="font-mono text-xs text-brand-mint">0{index + 1}</span><p className="text-sm text-white/80">{finding.title}</p></div>
                    <div className="flex flex-wrap gap-2 pl-7">{finding.evidence.map((chip) => <span key={chip} className="rounded-full bg-white/5 px-2 py-1 font-mono text-[10px] text-white/45">{chip}</span>)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="mb-2 text-xs uppercase tracking-widest text-white/35">One thing to try differently</p>
                <p className="flex gap-2 text-sm text-white/65"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint" />Review size and trade frequency separately after a loss streak.</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[0.02] px-6 py-5 md:px-10">
            <button onClick={scrollToInput} className="rounded-xl bg-brand-mint px-5 py-3 text-sm font-semibold text-brand-bg transition hover:bg-brand-mint/90">Run this on your own wallet</button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
