// Hyperliquid API client - fetches public trading data

import {
  HyperliquidFill,
  HyperliquidFunding,
  HyperliquidClearinghouseState,
} from "./types";

const HYPERLIQUID_API_URL =
  process.env.HYPERLIQUID_INFO_URL || "https://api.hyperliquid.xyz/info";

// In-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchHyperliquidInfo<T>(body: any): Promise<T> {
  const cacheKey = JSON.stringify(body);
  const cached = getCached<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Retry logic for rate limits
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(HYPERLIQUID_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited, wait and retry
          const delay = Math.pow(2, attempt) * 1000; // exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`Hyperliquid API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCache(cacheKey, data);
      return data as T;
    } catch (error) {
      lastError = error as Error;
      if (attempt < 2) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error("Failed to fetch from Hyperliquid API");
}

/**
 * Fetch recent fills for a user (capped at ~2000 most recent)
 */
export async function getUserFills(address: string): Promise<HyperliquidFill[]> {
  const fills = await fetchHyperliquidInfo<HyperliquidFill[]>({
    type: "userFills",
    user: address,
  });
  
  return fills || [];
}

/**
 * Fetch fills within a specific time range
 */
export async function getUserFillsByTime(
  address: string,
  startTime: number,
  endTime: number
): Promise<HyperliquidFill[]> {
  const fills = await fetchHyperliquidInfo<HyperliquidFill[]>({
    type: "userFillsByTime",
    user: address,
    startTime,
    endTime,
  });
  
  return fills || [];
}

/**
 * Fetch funding payments from a start time
 */
export async function getUserFunding(
  address: string,
  startTime: number
): Promise<HyperliquidFunding[]> {
  const funding = await fetchHyperliquidInfo<HyperliquidFunding[]>({
    type: "userFunding",
    user: address,
    startTime,
  });
  
  return funding || [];
}

/**
 * Fetch current account state (positions, margin, account value)
 */
export async function getClearinghouseState(
  address: string
): Promise<HyperliquidClearinghouseState | null> {
  try {
    const state = await fetchHyperliquidInfo<HyperliquidClearinghouseState>({
      type: "clearinghouseState",
      user: address,
    });
    
    return state;
  } catch (error) {
    console.error("Error fetching clearinghouse state:", error);
    return null;
  }
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Fetch all data for an address with proper error handling
 */
export async function fetchWalletData(address: string) {
  if (!isValidAddress(address)) {
    throw new Error("Invalid Ethereum address format");
  }

  try {
    // Fetch fills and current state in parallel
    const [fills, clearinghouseState] = await Promise.all([
      getUserFills(address),
      getClearinghouseState(address),
    ]);

    // For funding, we need a start time - use 90 days ago or earliest fill
    const now = Date.now();
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    const startTime = fills.length > 0 
      ? Math.min(fills[fills.length - 1].time, ninetyDaysAgo)
      : ninetyDaysAgo;

    const funding = await getUserFunding(address, startTime);

    return {
      fills,
      funding,
      clearinghouseState,
    };
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    throw error;
  }
}
