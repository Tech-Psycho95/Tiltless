// Unit tests for stats engine using fixture data

import { describe, it, expect } from "vitest";
import {
  calculateTradeStats,
  calculateFundingStats,
  getOverview,
  getCoinBreakdown,
  getFeeDragAnalysis,
  getLossStreakBehavior,
  getFilteredFills,
} from "./stats";
import type { HyperliquidFill, HyperliquidFunding } from "./types";

// Sample fills for testing
const mockFills: HyperliquidFill[] = [
  {
    coin: "BTC",
    px: "50000",
    sz: "0.1",
    side: "B",
    time: 1700000000000,
    dir: "Buy",
    closedPnl: "100.0",
    fee: "5.0",
    feeToken: "USDC",
    startPosition: "0",
    hash: "0x123",
    oid: 1,
    tid: 1,
    crossed: true,
    twapId: null,
  },
  {
    coin: "BTC",
    px: "51000",
    sz: "0.1",
    side: "A",
    time: 1700001000000,
    dir: "Sell",
    closedPnl: "-50.0",
    fee: "5.0",
    feeToken: "USDC",
    startPosition: "0.1",
    hash: "0x124",
    oid: 2,
    tid: 2,
    crossed: true,
    twapId: null,
  },
  {
    coin: "ETH",
    px: "3000",
    sz: "1.0",
    side: "B",
    time: 1700002000000,
    dir: "Buy",
    closedPnl: "200.0",
    fee: "10.0",
    feeToken: "USDC",
    startPosition: "0",
    hash: "0x125",
    oid: 3,
    tid: 3,
    crossed: true,
    twapId: null,
  },
];

const mockFunding: HyperliquidFunding[] = [
  {
    time: 1700000000000,
    hash: "0x200",
    delta: {
      type: "funding",
      coin: "BTC",
      usdc: "-10.0",
      szi: "0.5",
      fundingRate: "0.0001",
      nSamples: 8,
    },
  },
  {
    time: 1700086400000,
    hash: "0x201",
    delta: {
      type: "funding",
      coin: "BTC",
      usdc: "5.0",
      szi: "0.3",
      fundingRate: "-0.00005",
      nSamples: 8,
    },
  },
];

describe("calculateTradeStats", () => {
  it("should calculate basic trade statistics", () => {
    const stats = calculateTradeStats(mockFills);

    expect(stats.tradeCount).toBe(3);
    expect(stats.totalRealizedPnl).toBe(250); // 100 - 50 + 200
    expect(stats.totalFees).toBe(20); // 5 + 5 + 10
    expect(stats.winCount).toBe(2);
    expect(stats.lossCount).toBe(1);
    expect(stats.winRate).toBeCloseTo(0.667, 2);
    expect(stats.averageWin).toBe(150); // (100 + 200) / 2
    expect(stats.averageLoss).toBe(50);
    expect(stats.profitFactor).toBe(6); // 300 / 50
  });

  it("should handle empty fills", () => {
    const stats = calculateTradeStats([]);

    expect(stats.tradeCount).toBe(0);
    expect(stats.totalRealizedPnl).toBe(0);
    expect(stats.winRate).toBe(0);
  });
});

describe("calculateFundingStats", () => {
  it("should calculate funding paid and received", () => {
    const stats = calculateFundingStats(mockFunding);

    expect(stats.totalPaid).toBe(10);
    expect(stats.totalReceived).toBe(5);
    expect(stats.netFunding).toBe(-5);
  });

  it("should handle empty funding", () => {
    const stats = calculateFundingStats([]);

    expect(stats.totalPaid).toBe(0);
    expect(stats.totalReceived).toBe(0);
    expect(stats.netFunding).toBe(0);
  });
});

describe("getOverview", () => {
  it("should combine trade and funding stats", () => {
    const result = getOverview(mockFills, mockFunding);

    expect(result.stats.totalRealizedPnl).toBe(250);
    expect(result.stats.totalFees).toBe(20);
    expect(result.stats.totalFundingPaid).toBe(10);
    expect(result.stats.totalFundingReceived).toBe(5);
    expect(result.stats.netAfterCosts).toBe(225); // 250 - 20 - 5
    expect(result.timeRange.daysActive).toBeGreaterThan(0);
  });
});

describe("getCoinBreakdown", () => {
  it("should break down stats by coin", () => {
    const breakdown = getCoinBreakdown(mockFills);

    expect(breakdown.length).toBe(2); // BTC and ETH
    
    const btc = breakdown.find((b) => b.coin === "BTC");
    const eth = breakdown.find((b) => b.coin === "ETH");

    expect(btc).toBeDefined();
    expect(eth).toBeDefined();
    
    expect(btc!.tradeCount).toBe(2);
    expect(btc!.realizedPnl).toBe(50); // 100 - 50
    expect(btc!.fees).toBe(10);
    expect(btc!.netPnl).toBe(40);

    expect(eth!.tradeCount).toBe(1);
    expect(eth!.realizedPnl).toBe(200);
    expect(eth!.netPnl).toBe(190);

    // Should be sorted by netPnl descending
    expect(breakdown[0].coin).toBe("ETH");
  });
});

describe("getFeeDragAnalysis", () => {
  it("should identify high-fee trades", () => {
    const analysis = getFeeDragAnalysis(mockFills);

    expect(analysis.totalFees).toBe(20);
    expect(analysis.feesAsPercentOfGrossProfit).toBeGreaterThan(0);
  });
});

describe("getLossStreakBehavior", () => {
  it("should analyze position sizing after losses", () => {
    const behavior = getLossStreakBehavior(mockFills);

    expect(behavior.baseline.tradeCount).toBeGreaterThan(0);
    expect(behavior.baseline.avgPositionSize).toBeGreaterThan(0);
  });
});

describe("getFilteredFills", () => {
  it("should filter by coin", () => {
    const filtered = getFilteredFills(mockFills, { coin: "BTC" });
    expect(filtered.length).toBe(2);
    expect(filtered.every((f) => f.coin === "BTC")).toBe(true);
  });

  it("should limit results", () => {
    const filtered = getFilteredFills(mockFills, { limit: 2 });
    expect(filtered.length).toBe(2);
  });

  it("should filter by PnL range", () => {
    const filtered = getFilteredFills(mockFills, { minPnl: 100 });
    expect(filtered.length).toBe(2);
    expect(filtered.every((f) => parseFloat(f.closedPnl) >= 100)).toBe(true);
  });
});
