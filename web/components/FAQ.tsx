"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  ["Is it read-only?", "Yes. Tiltless only reads public Hyperliquid activity. It cannot place trades or sign transactions."],
  ["Do I connect my wallet?", "No. Paste a Hyperliquid address. No wallet connection, private key, or signature is required."],
  ["Is this financial advice?", "No. It describes past trading behavior and patterns. It does not provide buy, sell, or position advice."],
  ["How much history is analyzed?", "The analyzer uses the fills and funding data available through its public-data fetch. Large histories may be capped; the report should say when data is thin."],
  ["Why can't it see my sub-accounts or vaults?", "The queried address is analyzed on its own. Sub-accounts, vaults, and other addresses are not automatically combined."],
  ["What's computed by AI vs code?", "The stats engine computes the numbers deterministically. The AI calls those tools and turns the evidence into readable findings."],
  ["Is my data stored?", "There are no user accounts or database. Wallet data is fetched for the request; the app does not persist a user profile."],
  ["What's next for the project?", "Shareable cards, wallet comparison, tilt alerts, and more exchange support are planned, not shipped."],
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <motion.section id="faq" className="relative z-10 bg-brand-bg px-6 py-28 md:py-36" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}>
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-brand-mint/70">FAQ</p>
        <h2 className="mb-10 font-display text-4xl font-bold md:text-5xl">Straight answers.</h2>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {items.map(([question, answer], index) => {
            const isOpen = open === index;
            return <div key={question}><button className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-medium text-white/85" onClick={() => setOpen(isOpen ? null : index)} aria-expanded={isOpen}>{question}<ChevronDown className={`h-4 w-4 shrink-0 text-brand-mint transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} /></button>{isOpen && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="max-w-2xl pb-5 pr-8 text-sm leading-relaxed text-white/50">{answer}</motion.p>}</div>;
          })}
        </div>
      </div>
    </motion.section>
  );
}
