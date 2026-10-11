"use client";

import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autopsy, setAutopsy] = useState("");
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!address.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    setLoading(true);
    setError("");
    setAutopsy("");
    setChatAnswer("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Analysis failed");
        return;
      }

      setAutopsy(data.autopsy);
    } catch (err) {
      setError("Failed to connect to the server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatQuestion.trim()) return;
    if (!address.trim()) {
      setError("Please analyze an address first");
      return;
    }

    setChatLoading(true);
    setChatAnswer("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address.trim(),
          question: chatQuestion.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setChatAnswer(`Error: ${data.error || "Chat failed"}`);
        return;
      }

      setChatAnswer(data.answer);
      setChatQuestion("");
    } catch (err) {
      setChatAnswer("Failed to connect to the server");
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Tiltless</h1>
          <p className="text-zinc-400">
            AI Trading Coach for Hyperliquid wallets
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Informational only, not financial advice
          </p>
        </header>

        {/* Address Input */}
        <div className="mb-8 space-y-4">
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium mb-2 text-zinc-300"
            >
              Hyperliquid Wallet Address
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-zinc-100"
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full px-6 py-3 bg-teal-500 text-zinc-950 font-semibold rounded-lg hover:bg-teal-400 disabled:bg-zinc-700 disabled:text-zinc-500 transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-950 border border-red-800 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Results */}
        {autopsy && (
          <div className="mb-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Analysis</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 font-sans">
                  {autopsy}
                </pre>
              </div>
            </div>

            {/* Chat */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Follow-up Questions</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder="Ask a question about this wallet..."
                    className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-zinc-100"
                    disabled={chatLoading}
                    onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  />
                  <button
                    onClick={handleChat}
                    disabled={chatLoading || !chatQuestion.trim()}
                    className="px-6 py-3 bg-zinc-800 text-zinc-100 font-semibold rounded-lg hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 transition-colors"
                  >
                    {chatLoading ? "..." : "Ask"}
                  </button>
                </div>

                {chatAnswer && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 font-sans">
                      {chatAnswer}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!autopsy && !loading && !error && (
          <div className="text-zinc-500 text-sm space-y-2">
            <p>
              Enter a Hyperliquid wallet address to see an AI-powered analysis
              of trading behavior.
            </p>
            <p>The agent investigates:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Overall performance and fees</li>
              <li>Per-coin breakdown</li>
              <li>Loss-streak behavior (tilt detection)</li>
              <li>Fee and funding drag</li>
              <li>Current positions</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
