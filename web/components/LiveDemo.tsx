"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle2, ChevronRight, ChevronDown, AlertCircle, Info, AlertTriangle, XCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from "recharts";
import ReactMarkdown from "react-markdown";
import type { AnalysisData, Finding } from "@/lib/types";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format";
import { validateAddress } from "@/lib/validation";
import { useAuth } from "@/lib/auth";

type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: AnalysisData }
  | { status: "error"; message: string };

const severityConfig = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  warn: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  critical: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

export function LiveDemo() {
  const [address, setAddress] = useState("0x9a8b...4f2e");
  const [state, setState] = useState<AnalysisState>({ status: "idle" });
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [caveatsOpen, setCaveatsOpen] = useState(false);
  const { isAuthenticated, isReady, login, getAccessToken, user } = useAuth();

  // Resume analysis after login if there was a pending one
  useEffect(() => {
    if (isAuthenticated && isReady) {
      const pending = sessionStorage.getItem('pendingAnalysis');
      if (pending) {
        console.log('[LiveDemo] Resuming pending analysis:', pending);
        setAddress(pending);
        // Small delay to ensure token is ready
        setTimeout(() => startAnalysis(), 100);
      }
    }
  }, [isAuthenticated, isReady]);

  const startAnalysis = async () => {
    if (!address) return;

    // Check authentication first
    if (!isReady) {
      setState({ status: "error", message: "Authentication system loading..." });
      return;
    }

    if (!isAuthenticated) {
      // Store the address to resume after login
      sessionStorage.setItem('pendingAnalysis', address);
      login();
      return;
    }

    // Validate and normalize address before sending
    const validation = validateAddress(address);
    if (!validation.valid) {
      setState({
        status: "error",
        message: validation.error,
      });
      return;
    }

    const normalizedAddress = validation.address;

    // Clear old results and start loading
    setState({ status: "loading" });
    setEvidenceOpen(false);
    setCaveatsOpen(false);

    // Log what we're sending
    console.log("[LiveDemo] Sending request:", JSON.stringify({
      address: normalizedAddress,
      originalInput: address,
      length: normalizedAddress.length,
    }));

    try {
      // Get access token
      const token = await getAccessToken();
      if (!token) {
        setState({ status: "error", message: "Failed to get authentication token" });
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ address: normalizedAddress }),
      });

      console.log("[LiveDemo] Response status:", res.status);

      if (!res.ok) {
        // HTTP error
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}: ${res.statusText}` }));
        console.error("[LiveDemo] Error response:", errorData);
        
        // Handle 401 by prompting re-login
        if (res.status === 401) {
          sessionStorage.setItem('pendingAnalysis', address);
          setState({ status: "error", message: "Session expired. Please log in again." });
          setTimeout(() => login(), 2000);
          return;
        }
        
        setState({
          status: "error",
          message: errorData.error || `Request failed with status ${res.status}`,
        });
        return;
      }

      const data = await res.json();
      console.log("[LiveDemo] Success! Received data with stats:", !!data.stats, "autopsy:", !!data.autopsy);

      // Validate response structure
      if (!data.stats || !data.autopsy) {
        setState({
          status: "error",
          message: "Server returned incomplete data. Please try again.",
        });
        return;
      }

      setState({ status: "success", data });
      // Clear pending analysis on success
      sessionStorage.removeItem('pendingAnalysis');
    } catch (e) {
      // Network error or JSON parse error
      console.error("Analysis error:", e);
      setState({
        status: "error",
        message:
          e instanceof Error
            ? e.message.includes("fetch")
              ? "Cannot connect to analysis server. Please ensure the backend is running."
              : e.message
            : "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Helper to check if text contains markdown
  const containsMarkdown = (text: string): boolean => {
    return /[#*_`\[\]]/g.test(text);
  };

  return (
    <section id="demo" className="min-h-screen bg-brand-bg py-24 px-6 relative z-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">See it in action</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Our agent runs deterministic stats code and synthesizes the findings. No BS, just facts.
          </p>
        </div>

        <div className="glass-card p-6 md:p-10 mb-20 relative overflow-hidden group">
          {/* Subtle Glow Polish */}
          <div className="absolute inset-0 -z-10 bg-brand-mint/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Input State */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 relative z-10">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Hyperliquid Address..."
              disabled={state.status === "loading"}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:border-brand-mint/50 focus:bg-white/10 outline-none transition-all duration-300 shadow-[inset_0_0_0_transparent] focus:shadow-[inset_0_0_20px_rgba(151,252,228,0.05)]"
            />
            <button
              onClick={startAnalysis}
              disabled={state.status === "loading" || !address}
              className="bg-brand-mint text-brand-bg font-semibold px-8 py-3 rounded-xl hover:bg-brand-mint/90 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 min-w-[160px] shadow-[0_0_15px_rgba(151,252,228,0.3)] hover:shadow-[0_0_25px_rgba(151,252,228,0.5)]"
            >
              {state.status === "loading" ? "Analyzing..." : "Run Autopsy"}
            </button>
          </div>

          {/* Loading Skeleton */}
          <AnimatePresence>
            {state.status === "loading" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 text-brand-mint font-mono text-sm">
                  <div className="w-4 h-4 rounded-full border-2 border-brand-mint border-t-transparent animate-spin" />
                  Fetching fills & computing deterministics...
                </div>
                <div className="h-24 glass-card bg-white/5 animate-pulse rounded-xl" />
                <div className="h-40 glass-card bg-white/5 animate-pulse rounded-xl" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          <AnimatePresence>
            {state.status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-300 mb-2">Analysis Failed</h3>
                    <p className="text-red-200/80 text-sm leading-relaxed">{state.message}</p>
                  </div>
                </div>
                <button
                  onClick={startAnalysis}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-200 font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success State */}
          <AnimatePresence>
            {state.status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Net PnL",
                      val: formatCurrency(state.data.stats.netPnl),
                      color: (state.data.stats.netPnl ?? 0) < 0 ? "text-brand-red" : "text-brand-mint",
                    },
                    {
                      label: "Total Fees Paid",
                      val: formatCurrency(state.data.stats.totalFees),
                      color: "text-white",
                    },
                    {
                      label: "Win Rate",
                      val: formatPercent(state.data.stats.winRate),
                      color: "text-white",
                    },
                    {
                      label: "Max Loss Streak",
                      val: state.data.stats.maxLossStreak > 0
                        ? `${formatNumber(state.data.stats.maxLossStreak)} trades`
                        : "Not enough data",
                      color: "text-brand-red",
                    },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-brand-mint/30 transition-colors"
                    >
                      <div className="text-white/50 text-xs mb-1 uppercase tracking-wider">
                        {stat.label}
                      </div>
                      <div className={`font-mono text-xl md:text-2xl font-bold ${stat.color}`}>
                        {stat.val}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Autopsy Content */}
                <div className="space-y-6">
                  {/* Header with badges */}
                  <div className="space-y-4">
                    <h3 className="font-display text-3xl font-bold">{state.data.autopsy.headline}</h3>
                    
                    <div className="flex flex-wrap gap-3">
                      {/* Wallet Type Badge */}
                      <span className="px-3 py-1.5 bg-brand-mint/10 border border-brand-mint/30 rounded-full text-sm text-brand-mint font-medium">
                        {state.data.autopsy.walletType}
                      </span>
                      
                      {/* Data Window Badge */}
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 font-mono">
                        {state.data.autopsy.dataWindow.fillCount.toLocaleString()} fills
                        {state.data.autopsy.dataWindow.capped && " (capped)"}
                        {" · "}
                        {state.data.autopsy.dataWindow.from} to {state.data.autopsy.dataWindow.to}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-white/80 leading-relaxed text-lg">
                    {containsMarkdown(state.data.autopsy.summary) ? (
                      <ReactMarkdown>{state.data.autopsy.summary}</ReactMarkdown>
                    ) : (
                      state.data.autopsy.summary
                    )}
                  </p>

                  {/* Findings Cards */}
                  {state.data.autopsy.findings.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-display text-xl font-semibold text-white/90">Key Findings</h4>
                      {state.data.autopsy.findings.map((finding, idx) => {
                        const config = severityConfig[finding.severity];
                        const Icon = config.icon;
                        
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className={`border ${config.border} ${config.bg} rounded-xl p-6`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-1`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h5 className="font-semibold text-lg">{finding.title}</h5>
                                  <span className={`px-2 py-0.5 ${config.bg} ${config.border} border rounded text-xs ${config.color} uppercase tracking-wide`}>
                                    {finding.severity}
                                  </span>
                                </div>
                                <p className="text-white/80 leading-relaxed mb-4">
                                  {containsMarkdown(finding.explanation) ? (
                                    <ReactMarkdown>{finding.explanation}</ReactMarkdown>
                                  ) : (
                                    finding.explanation
                                  )}
                                </p>
                                
                                {/* Evidence Chips */}
                                {finding.evidence.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {finding.evidence.map((ev, evIdx) => (
                                      <div
                                        key={evIdx}
                                        className="px-3 py-1.5 bg-black/30 border border-white/10 rounded-lg text-sm"
                                      >
                                        <span className="text-white/50">{ev.label}:</span>{" "}
                                        <span className="text-white font-mono">{ev.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Behavior Note */}
                  {state.data.autopsy.behaviorNote && (
                    <div className="border border-white/10 bg-white/5 rounded-xl p-6">
                      <h5 className="font-semibold text-white/90 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-brand-mint" />
                        Pattern to Note
                      </h5>
                      <p className="text-white/80 leading-relaxed">
                        {containsMarkdown(state.data.autopsy.behaviorNote) ? (
                          <ReactMarkdown>{state.data.autopsy.behaviorNote}</ReactMarkdown>
                        ) : (
                          state.data.autopsy.behaviorNote
                        )}
                      </p>
                    </div>
                  )}

                  {/* Chart */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <span>Position Size After Losses</span>
                      <span className="text-xs text-white/50 font-normal">(Tilt Metric)</span>
                    </h4>
                    <div className="h-64 w-full">
                      {state.data.stats.avgSizeCreepOverTime &&
                      state.data.stats.avgSizeCreepOverTime.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={state.data.stats.avgSizeCreepOverTime}>
                            <defs>
                              <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF5C5C" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#FF5C5C" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="label" 
                              stroke="#ffffff40"
                              style={{ fontSize: "12px" }}
                            />
                            <YAxis 
                              stroke="#ffffff40"
                              style={{ fontSize: "12px" }}
                              label={{ value: "Position Size ($)", angle: -90, position: "insideLeft", fill: "#ffffff60" }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#07090B",
                                borderColor: "rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                              }}
                              itemStyle={{ color: "#FF5C5C", fontFamily: "monospace" }}
                              formatter={(value: any) => [`$${value.toLocaleString()}`, "Avg Size"]}
                            />
                            <Area
                              type="monotone"
                              dataKey="size"
                              stroke="#FF5C5C"
                              fillOpacity={1}
                              fill="url(#colorSize)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm">
                          <Info className="w-8 h-8 mb-2" />
                          <p>Not enough data to plot position size changes</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Caveats (Collapsible) */}
                  {state.data.autopsy.caveats && state.data.autopsy.caveats.length > 0 && (
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
                      <button
                        onClick={() => setCaveatsOpen(!caveatsOpen)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold text-white/70">
                          <AlertTriangle className="w-4 h-4" /> Caveats & Limitations
                        </span>
                        {caveatsOpen ? (
                          <ChevronDown className="w-4 h-4 text-white/60" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white/60" />
                        )}
                      </button>

                      <AnimatePresence>
                        {caveatsOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 space-y-2">
                              {state.data.autopsy.caveats.map((caveat, idx) => (
                                <p key={idx} className="text-sm text-white/60 leading-relaxed">
                                  • {caveat}
                                </p>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* How the Agent Got This (Collapsible) */}
                  {state.data.toolCalls && state.data.toolCalls.length > 0 && (
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
                      <button
                        onClick={() => setEvidenceOpen(!evidenceOpen)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold text-white/70">
                          <Terminal className="w-4 h-4" /> How the Agent Got This
                        </span>
                        {evidenceOpen ? (
                          <ChevronDown className="w-4 h-4 text-white/60" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white/60" />
                        )}
                      </button>

                      <AnimatePresence>
                        {evidenceOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4">
                              <p className="text-xs text-white/50 mb-3">
                                The agent called {state.data.toolCallCount} functions to gather deterministic stats:
                              </p>
                              <pre className="text-xs font-mono text-brand-mint/70 bg-black/50 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                                {state.data.toolCalls
                                  .map(
                                    (tc) =>
                                      `> ${tc.name}(${JSON.stringify(tc.args)})\n${JSON.stringify(
                                        tc.result,
                                        null,
                                        2
                                      )}\n`
                                  )
                                  .join("\n")}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
