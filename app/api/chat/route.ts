// API Route: POST /api/chat
// Follow-up questions about a wallet analysis

import { NextRequest, NextResponse } from "next/server";
import { runChat } from "@/lib/agent";
import { validateAddress } from "@/lib/hyperliquid";
import { verifyAuth } from "@/lib/auth-middleware";
import { checkRateLimit } from "@/lib/rate-limiter";
import { corsHeaders } from "@/lib/cors";

export const maxDuration = 60; // Vercel function timeout: 60 seconds

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
    console.log(`[API /chat] Auth failed:`, authResult.error);
    return NextResponse.json(
      { ok: false, error: authResult.error },
      { status: authResult.status, headers }
    );
  }
  
  const { userId } = authResult;
  
  // Check rate limit
  const rateLimitResult = checkRateLimit(userId, 'chat');
  if (!rateLimitResult.ok) {
    console.log(`[API /chat] Rate limit hit for ${userId}`);
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
    const { address, question, conversationHistory } = body;

    // Validate input
    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid address parameter" },
        { status: 400, headers }
      );
    }

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid question parameter" },
        { status: 400, headers }
      );
    }

    // Validate and normalize address
    const validation = validateAddress(address);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers }
      );
    }

    const normalizedAddress = validation.address;

    // Check for API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: AI service not available" },
        { status: 500, headers }
      );
    }

    console.log(`[API /chat] Question for ${normalizedAddress}: ${question.substring(0, 50)}...`);

    // Run chat
    const answer = await runChat(
      normalizedAddress,
      question,
      conversationHistory || []
    );

    return NextResponse.json({
      address: normalizedAddress,
      question,
      answer,
    }, { headers });

  } catch (error) {
    console.error("[API /chat] Error:", error);

    if (error instanceof Error) {
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
      { error: "An unexpected error occurred" },
      { status: 500, headers }
    );
  }
}
