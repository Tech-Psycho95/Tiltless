"use client";

import { motion } from "framer-motion";

const milestones = [
  ["Now", "Wallet autopsy + chat", "Shipped"],
  ["Next", "Shareable cards + compare two wallets", "Planned"],
  ["Later", "Tilt alerts + more exchanges", "Planned"],
];

export function Roadmap() {
  return <motion.section id="roadmap" className="relative z-10 bg-brand-bg px-6 py-28 md:py-36" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}><div className="mx-auto max-w-6xl"><p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-brand-mint/70">Roadmap</p><h2 className="mb-14 font-display text-4xl font-bold md:text-5xl">Useful first. Broader later.</h2><div className="grid gap-4 md:grid-cols-3">{milestones.map(([when, title, status], index) => <div key={when} className="glass-card relative p-6"><div className="mb-12 flex items-center justify-between"><span className="font-mono text-sm text-brand-mint">{when}</span><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-white/40">{status}</span></div><p className="font-display text-xl font-semibold">{title}</p>{index < 2 && <div className="absolute -right-3 top-1/2 hidden h-px w-2 bg-brand-mint/40 md:block" />}</div>)}</div></div></motion.section>;
}
