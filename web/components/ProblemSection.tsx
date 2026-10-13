"use client";

import { Activity, Droplets, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const painPoints = [
  {
    icon: TrendingDown,
    title: "Fee drag",
    description: "Small fees compound until a profitable-looking week is flat.",
    visual: "fees",
  },
  {
    icon: Activity,
    title: "Trading on tilt",
    description: "Losses change your next trade before your plan catches up.",
    visual: "tilt",
  },
  {
    icon: Droplets,
    title: "Funding bleed",
    description: "Time in a position can quietly turn into a recurring leak.",
    visual: "funding",
  },
];

function MiniVisual({ type }: { type: string }) {
  if (type === "fees") {
    return (
      <div className="relative h-16 overflow-hidden rounded-xl bg-black/20 p-3">
        <svg viewBox="0 0 240 50" className="h-full w-full" aria-hidden="true">
          <path d="M0 8 C28 12 30 15 55 18 S90 19 116 28 S160 30 190 39 S220 38 240 46" fill="none" stroke="#FF5C5C" strokeWidth="2" strokeDasharray="5 5" className="animate-[dash_2.5s_linear_infinite]" />
          <path d="M0 8 C28 12 30 15 55 18 S90 19 116 28 S160 30 190 39 S220 38 240 46 L240 50 L0 50Z" fill="url(#feeFade)" opacity=".25" />
          <defs><linearGradient id="feeFade" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#FF5C5C" /><stop offset="1" stopColor="#FF5C5C" stopOpacity="0" /></linearGradient></defs>
        </svg>
      </div>
    );
  }

  if (type === "tilt") {
    return (
      <div className="flex h-16 items-end gap-2 rounded-xl bg-black/20 p-3" aria-hidden="true">
        {[18, 25, 22, 32, 42, 51, 58].map((height, index) => (
          <div key={index} className={`flex-1 rounded-t-sm ${index > 3 ? "bg-brand-red/80" : "bg-white/20"}`} style={{ height: `${height}px`, animation: `bar-rise 1.8s ease-in-out ${index * 80}ms infinite alternate` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-16 items-center gap-3 rounded-xl bg-black/20 px-4" aria-hidden="true">
      <div className="relative h-9 w-5">
        <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-mint/80" />
        <div className="absolute left-1/2 top-3 h-6 w-px -translate-x-1/2 bg-brand-mint/80 animate-pulse" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-brand-mint/60 to-transparent" />
      <span className="font-mono text-xs text-white/40">repeating</span>
    </div>
  );
}

export function ProblemSection() {
  return (
    <motion.section
      id="problem"
      className="relative z-10 bg-brand-bg px-6 py-28 md:py-36"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-brand-mint/70">The problem</p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">PnL tells you the score. Not why you&apos;re losing.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.article
                key={point.title}
                className="glass-card glass-card-hover group p-6"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon className="mb-10 h-5 w-5 text-brand-mint" />
                <h3 className="mb-2 font-display text-2xl font-semibold">{point.title}</h3>
                <p className="mb-6 min-h-12 text-sm leading-relaxed text-white/55">{point.description}</p>
                <MiniVisual type={point.visual} />
              </motion.article>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
