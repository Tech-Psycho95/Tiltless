// Deterministic stats engine - all numbers computed in code, never by LLM

import {
  HyperliquidFill,
  HyperliquidFunding,
  TradeStats,
  CoinBreakdown,
  FeeDragAnalysis,
  LossStreakBehavior,
  TimeAnalysis,
  OverviewResult,
  Evidence,
} from "./types";

/**
 * Parse string to number safely
 */
function parseNumber(value: string | number): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate comprehensive trading statistics
 */
export function calculateTradeStats(fills: HyperliquidFill[]): TradeStats {
  if (fills.length === 0) {
    return {
      totalRealizedPnl: 0,
      totalFees: 0,
      totalFundingPaid: 0,
      totalFundingReceived: 0,
      netAfterCosts: 0,
      tradeCount: 0,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      largestWin: 0,
      largestLoss: 0,
    };
  }

  let totalRealizedPnl = 0;
  let totalFees = 0;
  let winCount = 0;
  let lossCount = 0;
  let totalWinAmount = 0;
  let totalLossAmount = 0;
  let largestWin = 0;
  let largestLoss = 0;

  fills.forEach((fill) => {
    const pnl = parseNumber(fill.closedPnl);
    const fee = parseNumber(fill.fee);

    totalRealizedPnl += pnl;
    totalFees += fee;

    if (pnl > 0) {
      winCount++;
      totalWinAmount += pnl;
      if (pnl > largestWin) largestWin = pnl;
    } else if (pnl < 0) {
      lossCount++;
      totalLossAmount += Math.abs(pnl);
      if (pnl < largestLoss) largestLoss = pnl;
    }
  });

  const tradeCount = fills.length;
  const winRate = tradeCount > 0 ? winCount / tradeCount : 0;
  const averageWin = winCount > 0 ? totalWinAmount / winCount : 0;
  const averageLoss = lossCount > 0 ? totalLossAmount / lossCount : 0;
  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 0;

  return {
    totalRealizedPnl,
    totalFees,
    totalFundingPaid: 0, // Will be calculated separately from funding data
    totalFundingReceived: 0,
    netAfterCosts: totalRealizedPnl - totalFees,
    tradeCount,
    winCount,
    lossCount,
    winRate,
    averageWin,
    averageLoss,
    profitFactor,
    largestWin,
    largestLoss,
  };
}

/**
 * Calculate funding statistics
 */
export function calculateFundingStats(funding: HyperliquidFunding[]): {
  totalPaid: number;
  totalReceived: number;
  netFunding: number;
} {
  let totalPaid = 0;
  let totalReceived = 0;

  funding.forEach((f) => {
    const amount = parseNumber(f.delta.usdc);
    if (amount < 0) {
      totalPaid += Math.abs(amount);
    } else if (amount > 0) {
      totalReceived += amount;
    }
  });

  return {
    totalPaid,
    totalReceived,
    netFunding: totalReceived - totalPaid,
  };
}

/**
 * Get overview with time range
 */
export function getOverview(
  fills: HyperliquidFill[],
  funding: HyperliquidFunding[]
): OverviewResult {
  const stats = calculateTradeStats(fills);
  const fundingStats = calculateFundingStats(funding);

  // Update stats with funding data
  stats.totalFundingPaid = fundingStats.totalPaid;
  stats.totalFundingReceived = fundingStats.totalReceived;
  stats.netAfterCosts =
    stats.totalRealizedPnl - stats.totalFees + fundingStats.netFunding;

  const timeRange =
    fills.length > 0
      ? {
          firstTrade: fills[fills.length - 1].time, // Fills are newest first
          lastTrade: fills[0].time,
          daysActive: Math.ceil(
            (fills[0].time - fills[fills.length - 1].time) / (1000 * 60 * 60 * 24)
          ),
        }
      : {
          firstTrade: 0,
          lastTrade: 0,
          daysActive: 0,
        };

  return { stats, timeRange };
}

/**
 * Calculate per-coin breakdown
 */
export function getCoinBreakdown(fills: HyperliquidFill[]): CoinBreakdown[] {
  const coinMap = new Map<
    string,
    {
      tradeCount: number;
      realizedPnl: number;
      fees: number;
      wins: number;
      losses: number;
    }
  >();

  fills.forEach((fill) => {
    const coin = fill.coin;
    const pnl = parseNumber(fill.closedPnl);
    const fee = parseNumber(fill.fee);

    const existing = coinMap.get(coin) || {
      tradeCount: 0,
      realizedPnl: 0,
      fees: 0,
      wins: 0,
      losses: 0,
    };

    existing.tradeCount++;
    existing.realizedPnl += pnl;
    existing.fees += fee;
    if (pnl > 0) existing.wins++;
    else if (pnl < 0) existing.losses++;

    coinMap.set(coin, existing);
  });

  const breakdown: CoinBreakdown[] = [];
  coinMap.forEach((data, coin) => {
    const totalTrades = data.wins + data.losses;
    breakdown.push({
      coin,
      tradeCount: data.tradeCount,
      realizedPnl: data.realizedPnl,
      fees: data.fees,
      netPnl: data.realizedPnl - data.fees,
      winRate: totalTrades > 0 ? data.wins / totalTrades : 0,
    });
  });

  // Sort by net PnL descending
  return breakdown.sort((a, b) => b.netPnl - a.netPnl);
}

/**
 * Analyze fee drag
 */
export function getFeeDragAnalysis(fills: HyperliquidFill[]): FeeDragAnalysis {
  const stats = calculateTradeStats(fills);
  const grossProfit = stats.totalRealizedPnl > 0 ? stats.totalRealizedPnl : 0;

  const highFeeTrades: number[] = [];

  fills.forEach((fill) => {
    const pnl = Math.abs(parseNumber(fill.closedPnl));
    const fee = parseNumber(fill.fee);

    if (pnl > 0 && fee > pnl * 0.3) {
      // Fee is more than 30% of gross PnL
      highFeeTrades.push(fill.tid);
    }
  });

  return {
    totalFees: stats.totalFees,
    feesAsPercentOfGrossProfit:
      grossProfit > 0 ? (stats.totalFees / grossProfit) * 100 : 0,
    highFeeTrades: highFeeTrades.length,
    highFeeTradeIds: highFeeTrades,
  };
}

/**
 * Analyze loss-streak behavior (tilt metric)
 */
export function getLossStreakBehavior(fills: HyperliquidFill[]): LossStreakBehavior {
  // Reverse to go chronologically (oldest first)
  const chronological = [...fills].reverse();

  const baseline: number[] = [];
  const afterOneLoss: number[] = [];
  const afterTwoLosses: number[] = [];
  const afterThreePlusLosses: number[] = [];

  let consecutiveLosses = 0;

  chronological.forEach((fill, index) => {
    const pnl = parseNumber(fill.closedPnl);
    const size = Math.abs(parseNumber(fill.sz));

    // Record size based on loss streak
    if (consecutiveLosses === 0) {
      baseline.push(size);
    } else if (consecutiveLosses === 1) {
      afterOneLoss.push(size);
    } else if (consecutiveLosses === 2) {
      afterTwoLosses.push(size);
    } else if (consecutiveLosses >= 3) {
      afterThreePlusLosses.push(size);
    }

    // Update streak
    if (pnl < 0) {
      consecutiveLosses++;
    } else {
      consecutiveLosses = 0;
    }
  });

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const baselineAvg = avg(baseline);

  return {
    baseline: {
      avgPositionSize: baselineAvg,
      avgPnl: 0, // Can be calculated if needed
      tradeCount: baseline.length,
    },
    afterOneLoss: {
      avgPositionSize: avg(afterOneLoss),
      avgPnl: 0,
      tradeCount: afterOneLoss.length,
      sizeMultiple: baselineAvg > 0 ? avg(afterOneLoss) / baselineAvg : 1,
    },
    afterTwoLosses: {
      avgPositionSize: avg(afterTwoLosses),
      avgPnl: 0,
      tradeCount: afterTwoLosses.length,
      sizeMultiple: baselineAvg > 0 ? avg(afterTwoLosses) / baselineAvg : 1,
    },
    afterThreePlusLosses: {
      avgPositionSize: avg(afterThreePlusLosses),
      avgPnl: 0,
      tradeCount: afterThreePlusLosses.length,
      sizeMultiple: baselineAvg > 0 ? avg(afterThreePlusLosses) / baselineAvg : 1,
    },
  };
}

/**
 * Get filtered fills (for agent tool - capped at ~50)
 */
export function getFilteredFills(
  fills: HyperliquidFill[],
  options: {
    coin?: string;
    limit?: number;
    minPnl?: number;
    maxPnl?: number;
  } = {}
): HyperliquidFill[] {
  let filtered = fills;

  if (options.coin) {
    filtered = filtered.filter((f) => f.coin === options.coin);
  }

  if (options.minPnl !== undefined) {
    filtered = filtered.filter((f) => parseNumber(f.closedPnl) >= options.minPnl!);
  }

  if (options.maxPnl !== undefined) {
    filtered = filtered.filter((f) => parseNumber(f.closedPnl) <= options.maxPnl!);
  }

  const limit = options.limit || 50;
  return filtered.slice(0, limit);
}

/**
 * Analyze trading time patterns
 */
export function getTimeAnalysis(fills: HyperliquidFill[]): TimeAnalysis {
  const hourMap = new Map<number, { pnl: number; count: number }>();
  const dayMap = new Map<number, { pnl: number; count: number }>();
  const dailyTradeCount: number[] = [];

  const dateMap = new Map<string, number>();

  fills.forEach((fill) => {
    const date = new Date(fill.time);
    const hour = date.getUTCHours();
    const day = date.getUTCDay();
    const dateKey = date.toISOString().split("T")[0];
    const pnl = parseNumber(fill.closedPnl);

    // Hour analysis
    const hourData = hourMap.get(hour) || { pnl: 0, count: 0 };
    hourData.pnl += pnl;
    hourData.count++;
    hourMap.set(hour, hourData);

    // Day analysis
    const dayData = dayMap.get(day) || { pnl: 0, count: 0 };
    dayData.pnl += pnl;
    dayData.count++;
    dayMap.set(day, dayData);

    // Daily trade count
    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
  });

  dateMap.forEach((count) => dailyTradeCount.push(count));

  let bestHour = 0;
  let bestHourPnl = -Infinity;
  let worstHour = 0;
  let worstHourPnl = Infinity;

  hourMap.forEach((data, hour) => {
    if (data.pnl > bestHourPnl) {
      bestHourPnl = data.pnl;
      bestHour = hour;
    }
    if (data.pnl < worstHourPnl) {
      worstHourPnl = data.pnl;
      worstHour = hour;
    }
  });

  let bestDay = 0;
  let bestDayPnl = -Infinity;
  let worstDay = 0;
  let worstDayPnl = Infinity;

  dayMap.forEach((data, day) => {
    if (data.pnl > bestDayPnl) {
      bestDayPnl = data.pnl;
      bestDay = day;
    }
    if (data.pnl < worstDayPnl) {
      worstDayPnl = data.pnl;
      worstDay = day;
    }
  });

  const avgTradesPerDay =
    dailyTradeCount.length > 0
      ? dailyTradeCount.reduce((a, b) => a + b, 0) / dailyTradeCount.length
      : 0;

  const overtradingDays = dailyTradeCount.filter(
    (count) => count > avgTradesPerDay * 2
  ).length;

  return {
    tradesPerDay: avgTradesPerDay,
    overtradingDays,
    bestHourUtc: bestHour,
    worstHourUtc: worstHour,
    bestDayOfWeek: bestDay,
    worstDayOfWeek: worstDay,
  };
}
