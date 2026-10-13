"use client";

import { ArrowRight, Bot, Braces, Database, FileText, WalletCards } from "lucide-react";
import { motion } from "framer-motion";

const nodes = [
  { icon: WalletCards, title: "Wallet address", caption: "A public address is all you provide." },
  { icon: Database, title: "Hyperliquid public API", caption: "Fills, funding, and positions come from public data." },
  { icon: Braces, title: "Stats engine", caption: "Deterministic code computes every metric." },
  { icon: Bot, title: "Agent tools", caption: "The agent queries the computed evidence." },
  { icon: FileText, title: "Written autopsy", caption: "Findings are explained in plain English." },
];

export function UnderTheHood() {
  return (
    <motion.section
      id="under-the-hood"
      className="relative z-10 overflow-hidden bg-brand-bg px-6 py-28 md:py-36"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-brand-mint/70">Under the hood</p>
          <h2 className="font-display text-4xl font-bold md:text-5xl">The AI reads the work. It doesn&apos;t do the math.</h2>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <div key={node.title} className="flex flex-1 items-center md:items-stretch">
                <motion.div
                  className="glass-card glass-card-hover w-full p-5"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.14, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Icon className="mb-8 h-5 w-5 text-brand-mint" />
                  <p className="mb-2 font-display font-semibold">{node.title}</p>
                  <p className="text-xs leading-relaxed text-white/45">{node.caption}</p>
                </motion.div>
                {index < nodes.length - 1 && <ArrowRight className="mx-2 hidden w-5 shrink-0 self-center text-brand-mint/40 md:block" />}
              </div>
            );
          })}
        </div>
        <div className="mt-8 rounded-xl border border-brand-mint/20 bg-brand-mint/5 px-5 py-4 text-sm text-brand-mint/90">The AI never does math. It only interprets numbers computed in code.</div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="glass-card p-5">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-brand-mint/70">Guardrail 01</p>
            <p className="font-display text-lg font-semibold">Read-only by design.</p>
            <p className="mt-2 text-sm leading-relaxed text-white/45">No signing. No private keys. Just public wallet activity.</p>
          </div>
          <div className="glass-card p-5">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-brand-mint/70">Guardrail 02</p>
            <p className="font-display text-lg font-semibold">Evidence before language.</p>
            <p className="mt-2 text-sm leading-relaxed text-white/45">The written report can only interpret metrics computed by code.</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
