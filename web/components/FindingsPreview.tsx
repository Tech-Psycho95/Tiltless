"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useInView } from "framer-motion";

const findings = [
  { id: 1, title: "Fee Drag", value: 1240, label: "$ paid in fees", type: "currency" },
  { id: 2, title: "Tilt After Losses", value: 2.1, label: "x size after 3+ losses", type: "multiplier" },
  { id: 3, title: "Funding Bleed", value: 310, label: "$ lost on weekends", type: "currency" },
  { id: 4, title: "Size Creep", value: 45, label: "% increase in avg size", type: "percentage" }
];

function Card({ item }: { item: typeof findings[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  // Hover state for glare
  const [hovered, setHovered] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const duration = 1500;
      
      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setAnimatedValue(item.value * easeOutQuart);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, item.value]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  const displayValue = item.type === "currency" 
    ? `$${Math.round(animatedValue).toLocaleString()}`
    : item.type === "multiplier"
    ? `${animatedValue.toFixed(1)}x`
    : `${Math.round(animatedValue)}%`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative w-full h-64 glass-card p-6 flex flex-col justify-between cursor-pointer group"
    >
      {/* Glare effect */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"])} ${useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"])}, rgba(255,255,255,0.1) 0%, transparent 60%)`,
        }}
      />
      
      {/* Glow on hover */}
      <div className="absolute inset-0 -z-10 bg-brand-mint/20 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 rounded-2xl" />

      <h3 className="font-display font-semibold text-xl text-white/80" style={{ transform: "translateZ(30px)" }}>
        {item.title}
      </h3>
      
      <div style={{ transform: "translateZ(50px)" }}>
        <div className={`font-mono text-5xl font-bold tabular-nums-custom mb-2 ${item.title.includes("Tilt") || item.title.includes("Bleed") || item.title.includes("Drag") ? "text-brand-red text-shadow-red" : "text-brand-mint text-glow"}`}>
          {displayValue}
        </div>
        <div className="text-white/50 text-sm">{item.label}</div>
      </div>
    </motion.div>
  );
}

export function FindingsPreview() {
  return (
    <section className="min-h-screen bg-brand-bg py-32 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-16 text-center">
          Insights you won't find on a dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-[1000px]">
          {findings.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
