"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const examples = [
  { label: "0x102a...897f", full: "0x102a618b36c32b338c03526255dcf2a39eb1897f" },
  { label: "0xeadc...9d55", full: "0xeadc152ac1014ace57c6b353f89adf5faffe9d55" },
];

export function FinalCTA() {
  const [address, setAddress] = useState("");
  const goToDemo = () => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  return <motion.section id="final-cta" className="relative overflow-hidden bg-brand-bg px-6 py-32 md:py-44" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}><div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-mint/10 blur-3xl" /><div className="relative mx-auto max-w-3xl text-center"><p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-brand-mint/70">Start with the address</p><h2 className="font-display text-5xl font-bold tracking-tight md:text-7xl">Find the leak.</h2><p className="mx-auto mt-6 max-w-xl text-white/55">Paste a public Hyperliquid address. Get a behavior report grounded in its actual activity.</p><div className="glass-card mx-auto mt-10 flex max-w-xl flex-col gap-2 p-2 sm:flex-row"><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="0x..." className="flex-1 bg-transparent px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-white/35" /><button onClick={goToDemo} className="rounded-xl bg-brand-mint px-6 py-3 text-sm font-semibold text-brand-bg transition hover:bg-brand-mint/90">Run autopsy <ArrowUpRight className="ml-1 inline h-4 w-4" /></button></div><div className="mt-5 flex flex-wrap justify-center gap-2"><span className="mr-1 self-center text-xs text-white/35">Try an example:</span>{examples.map((example) => <button key={example.full} onClick={() => setAddress(example.full)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white/55 transition hover:border-brand-mint/40 hover:text-brand-mint">{example.label}</button>)}</div></div></motion.section>;
}
