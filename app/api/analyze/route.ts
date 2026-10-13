// API Route: POST /api/analyze
// Runs the trading coach agent on a wallet address

import { NextRequest, NextResponse } from "next/server";
import { runAnalysis } from "@/lib/agent";
import { validateAddress } from "@/lib/hyperliquid";
import { verifyAuth } from "@/lib/auth-middleware";
import { checkRateLimit } from "@/lib/rate-limiter";
import { corsHeaders } from "@/lib/cors";

// Vercel Pro/Team allows up to 300s, Hobby allows 10s for serverless
// For analyses taking 75-90s, we need at least 120s
export const maxDuration = 120; // 2 minutes - should work on Pro plan

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...corsHeaders(origin),
  };
  
  // Verify authentication
  const authHeader = request.headers.get("authorization");
  const authResult = await verifyAuth(authHeader);
  
  if (!authResult.ok) {
    console.log(`[API /analyze] Auth failed:`, authResult.error);
    return NextResponse.json(
      { ok: false, error: authResult.error },
      { status: authResult.status, headers }
    );
  }
  
  const { userId } = authResult;
  console.log(`[API /analyze] Authenticated user: ${userId}`);
  
  // Check rate limit
  const rateLimitResult = checkRateLimit(userId, 'analysis');
  if (!rateLimitResult.ok) {
    console.log(`[API /analyze] Rate limit hit for ${userId}`);
    const responseHeaders = { ...headers };
    if (rateLimitResult.retryAfter) {
      responseHeaders["Retry-After"] = rateLimitResult.retryAfter.toString();
    }
    return NextResponse.json(
      { ok: false, error: rateLimitResult.error },
      { status: rateLimitResult.status, headers: responseHeaders }
    );
  }
  
  try {
    const body = await request.json();
    const { address } = body;

    // Log what we received for debugging
    console.log(`[API /analyze] Received address:`, JSON.stringify({
      raw: address,
      type: typeof address,
      length: typeof address === "string" ? address.length : "N/A",
    }));

    // Validate input
    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid address parameter" },
        { status: 400, headers }
      );
    }

    // Validate and normalize address
    const validation = validateAddress(address);
    if (!validation.valid) {
      console.log(`[API /analyze] Address validation failed:`, validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers }
      );
    }

    const normalizedAddress = validation.address;
    console.log(`[API /analyze] Normalized address: ${normalizedAddress}`);

    // Check for API key
    if (!process.env.GROQ_API_KEY) {
      console.error("[API] GROQ_API_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error: AI service not available" },
        { status: 500, headers }
      );
    }

    console.log(`[API /analyze] Starting analysis for ${normalizedAddress}`);
    const startTime = Date.now();

    // Run the agent with normalized address
    const result = await runAnalysis(normalizedAddress);

    const duration = Date.now() - startTime;
    console.log(`[API /analyze] Completed in ${duration}ms, ${result.toolCalls.length} tool calls`);

    // Extract stats from tool calls for the UI
    const overviewTool = result.toolCalls.find(tc => tc.tool === 'get_overview');
    const lossStreakTool = result.toolCalls.find(tc => tc.tool === 'get_loss_streak_behavior');
    
    const overviewStats = overviewTool?.output?.stats || {};
    const lossStreakData = lossStreakTool?.output || {};
    
    // Build size creep chart data from loss streak behavior
    const avgSizeCreepOverTime = [];
    if (lossStreakData.baseline) {
      avgSizeCreepOverTime.push(
        { label: 'Baseline', size: Math.round(lossStreakData.baseline.avgPositionSize) },
        { label: 'After 1 Loss', size: Math.round(lossStreakData.afterOneLoss?.avgPositionSize || 0) },
        { label: 'After 2 Losses', size: Math.round(lossStreakData.afterTwoLosses?.avgPositionSize || 0) },
        { label: 'After 3+ Losses', size: Math.round(lossStreakData.afterThreePlusLosses?.avgPositionSize || 0) }
      );
    }

    return NextResponse.json({
      address: normalizedAddress,
      autopsy: result.autopsy, // Now structured JSON
      stats: {
        netPnl: Math.round(overviewStats.netAfterCosts || 0),
        totalFees: Math.round(overviewStats.totalFees || 0),
        winRate: Math.round((overviewStats.winRate || 0) * 100),
        maxLossStreak: Math.round(overviewStats.maxConsecutiveLosses || 0),
        avgSizeCreepOverTime
      },
      toolCalls: result.toolCalls.map(tc => ({
        name: tc.tool,
        args: tc.input,
        result: tc.output
      })),
      toolCallCount: result.toolCalls.length,
      duration,
    }, { headers });

  } catch (error) {
    console.error("[API /analyze] Error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "AI service authentication failed" },
          { status: 500, headers }
        );
      }

      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a moment." },
          { status: 429, headers }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during analysis" },
      { status: 500, headers }
    );
  }
}
