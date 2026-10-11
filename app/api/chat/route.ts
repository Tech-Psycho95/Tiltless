// API Route: POST /api/chat
// Follow-up questions about a wallet analysis

import { NextRequest, NextResponse } from "next/server";
import { runChat } from "@/lib/agent";
import { isValidAddress } from "@/lib/hyperliquid";

export const maxDuration = 30; // Vercel function timeout: 30 seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, question, conversationHistory } = body;

    // Validate input
    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid address parameter" },
        { status: 400 }
      );
    }

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid question parameter" },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: AI service not available" },
        { status: 500 }
      );
    }

    console.log(`[API /chat] Question for ${address}: ${question.substring(0, 50)}...`);

    // Run chat
    const answer = await runChat(
      address,
      question,
      conversationHistory || []
    );

    return NextResponse.json({
      address,
      question,
      answer,
    });

  } catch (error) {
    console.error("[API /chat] Error:", error);

    if (error instanceof Error) {
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
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
