// Shared types for API communication between backend and website

export interface EvidenceItem {
  label: string;
  value: string;
}

export interface Finding {
  title: string;
  severity: "info" | "warn" | "critical";
  explanation: string;
  evidence: EvidenceItem[];
}

export interface DataWindow {
  from: string; // UTC date string
  to: string;   // UTC date string
  fillCount: number;
  capped: boolean;
}

export interface StructuredAutopsy {
  walletType: string;
  dataWindow: DataWindow;
  headline: string;
  summary: string;
  findings: Finding[];
  behaviorNote?: string;
  caveats: string[];
}

export interface AnalysisStats {
  netPnl: number;
  totalFees: number;
  winRate: number; // Already as percentage (13 = 13%)
  maxLossStreak: number;
  avgSizeCreepOverTime: Array<{ label: string; size: number }>;
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface AnalysisData {
  address: string;
  autopsy: StructuredAutopsy;
  stats: AnalysisStats;
  toolCalls: ToolCall[];
  toolCallCount: number;
  duration: number;
}

export type AnalysisResponse =
  | { ok: true; data: AnalysisData }
  | { ok: false; error: string };
