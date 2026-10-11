// API Route: POST /api/analyze
// Runs the trading coach agent on a wallet address

import { NextRequest, NextResponse } from "next/server";
import { runAnalysis } from "@/lib/agent";
import { isValidAddress } from "@/lib/hyperliquid";

export const maxDuration = 60; // Vercel function timeout: 60 seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    // Validate input
    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid address parameter" },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format. Must be 0x followed by 40 hex characters." },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("[API] ANTHROPIC_API_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error: AI service not available" },
        { status: 500 }
      );
    }

    console.log(`[API /analyze] Starting analysis for ${address}`);
    const startTime = Date.now();

    // Run the agent
    const result = await runAnalysis(address);

    const duration = Date.now() - startTime;
    console.log(`[API /analyze] Completed in ${duration}ms, ${result.toolCalls.length} tool calls`);

    return NextResponse.json({
      address,
      autopsy: result.autopsy,
      toolCallCount: result.toolCalls.length,
      duration,
    });

  } catch (error) {
    console.error("[API /analyze] Error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "AI service authentication failed" },
          { status: 500 }
        );
      }

      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a moment." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during analysis" },
      { status: 500 }
    );
  }
}
