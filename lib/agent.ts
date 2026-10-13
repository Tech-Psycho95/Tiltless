// AI Trading Coach Agent - Groq tool-use loop

import Groq from "groq-sdk";
import {
  getOverview,
  getCoinBreakdown,
  getFeeDragAnalysis,
  getLossStreakBehavior,
  getFilteredFills,
} from "./stats";
import { fetchWalletData } from "./hyperliquid";
import type {
  HyperliquidFill,
  HyperliquidFunding,
  HyperliquidClearinghouseState,
} from "./types";
import { StructuredAutopsySchema, type StructuredAutopsy } from "./autopsy-schema";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const MAX_TOOL_ROUNDS = 8;

// Cached wallet data for the session
let cachedAddress: string | null = null;
let cachedFills: HyperliquidFill[] = [];
let cachedFunding: HyperliquidFunding[] = [];
let cachedState: HyperliquidClearinghouseState | null = null;

/**
 * Tool definitions for the agent
 */
const tools: Array<{
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}> = [
  {
    type: "function",
    function: {
      name: "get_overview",
      description:
        "Get comprehensive overview statistics including total PnL, fees, funding, win rate, profit factor, and time range. Always call this first.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_coin_breakdown",
      description:
        "Get per-coin breakdown showing trades, PnL, fees, net PnL and win rate for each asset traded. Sorted by net PnL descending.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_loss_streak_behavior",
      description:
        "Analyze position sizing after consecutive losses (tilt metric). Shows average position size at baseline vs after 1, 2, or 3+ losses. Size multiple > 1.5 indicates revenge trading/tilt.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_fee_and_funding_drag",
      description:
        "Analyze fee drag and funding costs. Shows total fees, fees as % of gross profit, count of high-fee trades (where fee > 30% of PnL), total funding paid/received.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_fills",
      description:
        "Get filtered list of fills (capped at 50). Use to investigate specific coins, PnL ranges, or recent trades. DO NOT request all fills without filters.",
      parameters: {
        type: "object",
        properties: {
          coin: {
            type: "string",
            description: "Filter by coin symbol (e.g., 'BTC', 'ETH', '@107')",
          },
          minPnl: {
            type: "number",
            description: "Minimum realized PnL (for finding wins)",
          },
          maxPnl: {
            type: "number",
            description: "Maximum realized PnL (for finding losses)",
          },
          limit: {
            type: "number",
            description: "Max results to return (default 50, max 50)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_current_positions",
      description:
        "Get current open positions and account value from the latest clearinghouse state.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

/**
 * System prompt for the trading coach agent
 */
const SYSTEM_PROMPT = `You are a trading behavior analyst for Hyperliquid perpetual futures traders. Your job is to investigate a wallet's trading history and return a structured analysis in JSON format.

RULES:
1. Use tools to gather evidence before claiming anything. Never calculate or invent statistics yourself.
2. Only state numbers returned by tools. All metrics are computed server-side in code.
3. NO MARKDOWN. NO TABLES. NO RAW FIELD NAMES. Use human-readable labels and formatted values.
4. Format all numbers: use $1.37M for millions, 65.3% for percentages, UTC dates for timestamps.
5. Never output raw field names like "totalFundingPaid" or "tradeCount". Use "Total funding paid: $1,234" or "2,000 trades".
6. Plain, neutral tone. NO EMOJIS. NO FINANCIAL ADVICE.
7. State the data window: "Based on the last 2,000 fills, Jan 15 2025 to Feb 20 2025 UTC"
8. Max 3 findings, ordered by impact (most critical first).
9. Every number must come from a tool result. Cite evidence for each finding.

OUTPUT FORMAT (JSON only):
{
  "walletType": "<brief classification: e.g. 'High-frequency trader', 'Conservative swing trader', 'Tilt-prone scalper'>",
  "dataWindow": {
    "from": "<UTC date string YYYY-MM-DD>",
    "to": "<UTC date string YYYY-MM-DD>",
    "fillCount": <number>,
    "capped": <boolean: true if hit API limits>
  },
  "headline": "<impactful one-liner, 8-12 words>",
  "summary": "<2-3 sentences: overall performance and key insight>",
  "findings": [
    {
      "title": "<5-7 words, no jargon>",
      "severity": "<'info' | 'warn' | 'critical'>",
      "explanation": "<2-3 sentences with specific formatted numbers and asset names>",
      "evidence": [
        {"label": "<human label>", "value": "<formatted value with units>"},
        {"label": "<human label>", "value": "<formatted value with units>"}
      ]
    }
  ],
  "behaviorNote": "<optional: 1-2 sentences noting a pattern, framed neutrally>",
  "caveats": ["<caveat 1>", "<caveat 2>"]
}

SEVERITY GUIDE:
- "critical": Major pattern causing significant losses (tilt, extreme fee drag)
- "warn": Problematic but not catastrophic (concentration risk, funding bleed)
- "info": Neutral observation or positive note

EVIDENCE FORMAT EXAMPLES:
- {"label": "Trades analyzed", "value": "2,000 fills"}
- {"label": "Period", "value": "Jan 15 - Feb 20, 2025 UTC"}
- {"label": "Net loss", "value": "$21,302"}
- {"label": "Size increase after losses", "value": "1.58x baseline"}
- {"label": "High-fee trades", "value": "409 (20% of total)"}

BEHAVIORAL FOCUS:
- Overtrading (high trade count vs PnL)
- Fee drag (fees eating into profits)
- Revenge trading after losses (size creep, tilt)
- Funding bleed (holding expensive positions)
- Coin concentration (too much in one asset)

Start by calling get_overview, then investigate patterns. Return ONLY valid JSON matching the schema above.`;


/**
 * Execute a tool call
 */
async function executeTool(
  toolName: string,
  toolInput: Record<string, any>
): Promise<any> {
  console.log(`[AGENT] Executing tool: ${toolName}`, toolInput);

  switch (toolName) {
    case "get_overview": {
      const result = getOverview(cachedFills, cachedFunding);
      return result;
    }

    case "get_coin_breakdown": {
      const breakdown = getCoinBreakdown(cachedFills);
      return breakdown;
    }

    case "get_loss_streak_behavior": {
      const behavior = getLossStreakBehavior(cachedFills);
      return behavior;
    }

    case "get_fee_and_funding_drag": {
      const feeAnalysis = getFeeDragAnalysis(cachedFills);
      const fundingStats = cachedFunding.reduce(
        (acc, f) => {
          const amount = parseFloat(f.delta.usdc);
          if (amount < 0) acc.totalPaid += Math.abs(amount);
          else if (amount > 0) acc.totalReceived += amount;
          return acc;
        },
        { totalPaid: 0, totalReceived: 0 }
      );

      return {
        ...feeAnalysis,
        totalFundingPaid: fundingStats.totalPaid,
        totalFundingReceived: fundingStats.totalReceived,
        netFunding: fundingStats.totalReceived - fundingStats.totalPaid,
      };
    }

    case "get_fills": {
      const { coin, minPnl, maxPnl, limit } = toolInput;
      const fills = getFilteredFills(cachedFills, {
        coin,
        minPnl,
        maxPnl,
        limit: Math.min(limit || 50, 50),
      });

      // Return simplified version to save context
      return fills.map((f) => ({
        coin: f.coin,
        side: f.side,
        size: f.sz,
        price: f.px,
        closedPnl: f.closedPnl,
        fee: f.fee,
        time: new Date(f.time).toISOString(),
      }));
    }

    case "get_current_positions": {
      if (!cachedState) {
        return { message: "No open positions or clearinghouse state unavailable" };
      }

      return {
        accountValue: cachedState.marginSummary.accountValue,
        positions: cachedState.assetPositions.map((p) => ({
          coin: p.coin,
          size: p.szi,
          entryPrice: p.entryPx,
          unrealizedPnl: p.unrealizedPnl,
        })),
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Run the agent loop
 */
export async function runAnalysis(address: string): Promise<{
  autopsy: StructuredAutopsy;
  toolCalls: Array<{ tool: string; input: any; output: any }>;
}> {
  // Fetch and cache wallet data
  console.log(`[AGENT] Fetching wallet data for ${address}...`);
  const walletData = await fetchWalletData(address);

  cachedAddress = address;
  cachedFills = walletData.fills;
  cachedFunding = walletData.funding;
  cachedState = walletData.clearinghouseState;

  console.log(
    `[AGENT] Loaded ${cachedFills.length} fills, ${cachedFunding.length} funding payments`
  );

  // Check if data is too sparse
  if (cachedFills.length < 5) {
    return {
      autopsy: {
        walletType: "Inactive wallet",
        dataWindow: {
          from: "N/A",
          to: "N/A",
          fillCount: cachedFills.length,
          capped: false,
        },
        headline: "Insufficient data for meaningful analysis",
        summary: "This wallet has fewer than 5 trades recorded. Not enough data to provide meaningful analysis. Try a more active address.",
        findings: [],
        behaviorNote: undefined,
        caveats: ["Analysis requires at least 5 trades to identify patterns."],
      },
      toolCalls: [],
    };
  }

  // Initialize conversation
  const messages: Array<any> = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `Analyze the trading behavior for Hyperliquid address ${address}. The wallet has ${cachedFills.length} fills. Investigate and write the autopsy.`,
    },
  ];

  const toolCalls: Array<{ tool: string; input: any; output: any }> = [];
  let toolRounds = 0;

  // Agent loop
  while (toolRounds < MAX_TOOL_ROUNDS) {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
      max_tokens: 4000,
      temperature: 0.7,
    });

    const message = response.choices[0]?.message;
    if (!message) break;

    console.log(`[AGENT] Round ${toolRounds + 1}, finish_reason: ${response.choices[0]?.finish_reason}`);

    // Check if agent is done
    if (response.choices[0]?.finish_reason === "stop" && message.content) {
      // Parse and validate JSON response with retry
      let parsedAutopsyResult = parseAndValidateAutopsy(message.content);
      
      if (parsedAutopsyResult.success) {
        return {
          autopsy: parsedAutopsyResult.data,
          toolCalls,
        };
      }
      
      // Invalid JSON - retry once
      console.log(`[AGENT] Invalid JSON response, retrying... Error: ${parsedAutopsyResult.error}`);
      messages.push({
        role: "user",
        content: `Your previous response was invalid JSON. Error: ${parsedAutopsyResult.error}. Please return ONLY valid JSON matching the schema with no markdown formatting or extra text.`,
      });
      
      const retryResponse = await groq.chat.completions.create({
        model: MODEL,
        messages,
        max_tokens: 4000,
        temperature: 0.5,
      });
      
      const retryMessage = retryResponse.choices[0]?.message?.content;
      if (retryMessage) {
        const retryResult = parseAndValidateAutopsy(retryMessage);
        if (retryResult.success) {
          return {
            autopsy: retryResult.data,
            toolCalls,
          };
        }
        console.error("[AGENT] Retry also failed:", retryResult.error);
      }
      
      // Both attempts failed - return fallback
      return {
        autopsy: createFallbackAutopsy(cachedFills, message.content),
        toolCalls,
      };
    }

    // Process tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      // Add assistant message with tool calls
      messages.push(message);

      for (const toolCall of message.tool_calls) {
        try {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          const result = await executeTool(functionName, functionArgs);
          toolCalls.push({
            tool: functionName,
            input: functionArgs,
            output: result,
          });

          // Add tool result message
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result, null, 2),
          });
        } catch (error) {
          console.error(`[AGENT] Tool error:`, error);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }

      toolRounds++;
    } else {
      // No tool calls and not stopped - unexpected
      console.warn(`[AGENT] Unexpected state: ${response.choices[0]?.finish_reason}`);
      break;
    }
  }

  // Max rounds reached
  return {
    autopsy: createFallbackAutopsy(
      cachedFills,
      "Analysis incomplete: reached maximum tool rounds. The agent investigated but did not finish the autopsy."
    ),
    toolCalls,
  };
}

/**
 * Run chat follow-up
 */
export async function runChat(
  address: string,
  question: string,
  conversationHistory: Array<any> = []
): Promise<string> {
  // Ensure we have cached data
  if (cachedAddress !== address || cachedFills.length === 0) {
    console.log(`[AGENT] Loading wallet data for chat...`);
    const walletData = await fetchWalletData(address);
    cachedAddress = address;
    cachedFills = walletData.fills;
    cachedFunding = walletData.funding;
    cachedState = walletData.clearinghouseState;
  }

  const messages: Array<any> = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    ...conversationHistory,
    {
      role: "user",
      content: question,
    },
  ];

  let toolRounds = 0;

  while (toolRounds < MAX_TOOL_ROUNDS) {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
      max_tokens: 2000,
      temperature: 0.7,
    });

    const message = response.choices[0]?.message;
    if (!message) break;

    if (response.choices[0]?.finish_reason === "stop" && message.content) {
      return message.content;
    }

    if (message.tool_calls && message.tool_calls.length > 0) {
      messages.push(message);

      for (const toolCall of message.tool_calls) {
        try {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          const result = await executeTool(functionName, functionArgs);

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result, null, 2),
          });
        } catch (error) {
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }

      toolRounds++;
    } else {
      break;
    }
  }

  return "Could not complete the response. Please try rephrasing your question.";
}


/**
 * Parse and validate autopsy JSON with Zod
 */
function parseAndValidateAutopsy(content: string): 
  | { success: true; data: StructuredAutopsy }
  | { success: false; error: string } {
  try {
    // Try to extract JSON from markdown code blocks if present
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    const parsed = JSON.parse(jsonStr);
    const validated = StructuredAutopsySchema.parse(parsed);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: String(error) };
  }
}

/**
 * Create fallback autopsy when parsing fails
 */
function createFallbackAutopsy(fills: HyperliquidFill[], rawContent: string): StructuredAutopsy {
  const overview = getOverview(fills, cachedFunding);
  const firstFill = fills[0];
  const lastFill = fills[fills.length - 1];
  
  return {
    walletType: "Unable to classify",
    dataWindow: {
      from: firstFill ? new Date(firstFill.time).toISOString().split('T')[0] : "N/A",
      to: lastFill ? new Date(lastFill.time).toISOString().split('T')[0] : "N/A",
      fillCount: fills.length,
      capped: fills.length >= 2000,
    },
    headline: "Analysis completed with parsing issues",
    summary: rawContent.substring(0, 300) + "...",
    findings: [
      {
        title: "Overall Performance",
        severity: overview.stats.netAfterCosts < 0 ? "warn" : "info",
        explanation: `Net result after ${fills.length} trades: ${formatCurrency(overview.stats.netAfterCosts)}`,
        evidence: [
          { label: "Trades", value: `${fills.length} fills` },
          { label: "Net PnL", value: formatCurrency(overview.stats.netAfterCosts) },
        ],
      },
    ],
    behaviorNote: undefined,
    caveats: ["Analysis formatting encountered issues. Raw metrics are still accurate."],
  };
}

/**
 * Format currency helper
 */
function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (absValue >= 1000000) {
    return `${sign}$${(absValue / 1000000).toFixed(2)}M`;
  }
  if (absValue >= 1000) {
    return `${sign}$${(absValue / 1000).toFixed(1)}k`;
  }
  return `${sign}$${absValue.toFixed(0)}`;
}
