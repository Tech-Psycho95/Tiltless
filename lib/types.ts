// Core types for Tiltless - Hyperliquid trading analysis

export interface HyperliquidFill {
  coin: string;
  px: string; // price as string
  sz: string; // size as string
  side: "B" | "A"; // Buy or Ask (sell)
  time: number; // milliseconds timestamp
  dir: string; // "Buy", "Sell", "Open Long", "Close Short", etc.
  closedPnl: string; // realized PnL as string
  fee: string; // fee as string
  feeToken: string; // "USDC" or "HYPE"
  startPosition: string; // position before fill
  hash: string; // transaction hash
  oid: number; // order ID
  tid: number; // trade ID
  crossed: boolean; // taker order flag
  twapId: number | null; // TWAP order identifier
}

export interface HyperliquidFunding {
  time: number;
  hash: string;
  delta: {
    type: "funding";
    coin: string;
    usdc: string; // positive = received, negative = paid
    szi: string; // position size at funding time
    fundingRate: string;
    nSamples: number;
  };
}

export interface HyperliquidPosition {
  coin: string;
  szi: string; // signed size (positive = long, negative = short)
  entryPx?: string;
  positionValue?: string;
  unrealizedPnl?: string;
  liquidationPx?: string | null;
  leverage?: string;
}

export interface HyperliquidClearinghouseState {
  assetPositions: HyperliquidPosition[];
  marginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
  crossMarginSummary?: {
    accountValue: string;
    totalMarginUsed: string;
  };
}

// Stats engine types

export interface TradeStats {
  totalRealizedPnl: number;
  totalFees: number;
  totalFundingPaid: number;
  totalFundingReceived: number;
  netAfterCosts: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number; // gross profit / gross loss
  largestWin: number;
  largestLoss: number;
}

export interface CoinBreakdown {
  coin: string;
  tradeCount: number;
  realizedPnl: number;
  fees: number;
  netPnl: number;
  winRate: number;
}

export interface FeeDragAnalysis {
  totalFees: number;
  feesAsPercentOfGrossProfit: number;
  highFeeTrades: number; // count where fee > 30% of gross PnL
  highFeeTradeIds: number[];
}

export interface LossStreakBehavior {
  baseline: {
    avgPositionSize: number;
    avgPnl: number;
    tradeCount: number;
  };
  afterOneLoss: {
    avgPositionSize: number;
    avgPnl: number;
    tradeCount: number;
    sizeMultiple: number; // vs baseline
  };
  afterTwoLosses: {
    avgPositionSize: number;
    avgPnl: number;
    tradeCount: number;
    sizeMultiple: number;
  };
  afterThreePlusLosses: {
    avgPositionSize: number;
    avgPnl: number;
    tradeCount: number;
    sizeMultiple: number;
  };
}

export interface TimeAnalysis {
  tradesPerDay: number;
  overtradingDays: number; // days with excessive trades
  bestHourUtc: number;
  worstHourUtc: number;
  bestDayOfWeek: number; // 0 = Sunday
  worstDayOfWeek: number;
}

// Agent tool outputs

export interface OverviewResult {
  stats: TradeStats;
  timeRange: {
    firstTrade: number;
    lastTrade: number;
    daysActive: number;
  };
}

export interface Evidence {
  tradeIds?: number[];
  timeRange?: { start: number; end: number };
  coins?: string[];
  description: string;
}

export interface AgentFinding {
  title: string;
  description: string;
  evidence: Evidence;
}

export interface AutopsyResponse {
  summary: string;
  findings: AgentFinding[];
  suggestion: string;
  stats: TradeStats;
}
