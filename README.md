# Tiltless

An AI trading coach for Hyperliquid wallets. Analyzes trading behavior, detects tilt patterns, and provides actionable insights.

## Project Structure

This repository contains two separate Next.js projects:

- **Backend API** (repo root) - Trading analysis engine with AI agent
- **Website** (`/web` folder) - Landing page and live demo interface

## Prerequisites

- Node.js 20+
- npm or yarn
- Groq API key (for AI agent)

## Setup

### 1. Install Dependencies

```bash
# Backend
npm install

# Website
cd web
npm install
cd ..
```

### 2. Configure Environment Variables

Create `.env.local` in the repo root:

```bash
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

Create `web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Running the Projects

### Development Mode

Run both projects simultaneously in separate terminals:

```bash
# Terminal 1: Backend API (port 3001)
npm run dev:api

# Terminal 2: Website (port 3000)
npm run dev:web
```

Or run them individually:

```bash
# Backend only
npm run dev:api

# Website only
cd web && npm run dev
```

### Production Build

```bash
# Build backend
npm run build

# Build website
npm run build:web
```

### Production Mode

```bash
# Start backend API (port 3001)
npm run start:api

# Start website (port 3000)
cd web && npm start
```

## API Endpoints

### POST /api/analyze

Analyzes a Hyperliquid wallet address and returns trading behavior insights.

**Request:**
```json
{
  "address": "0x102a618b36c32b338c03526255dcf2a39eb1897f"
}
```

**Response:**
```json
{
  "address": "0x102a618b36c32b338c03526255dcf2a39eb1897f",
  "autopsy": "Summary and findings...",
  "toolCallCount": 4,
  "duration": 82100
}
```

### POST /api/chat

Follow-up questions about a wallet analysis.

**Request:**
```json
{
  "address": "0x102a618b36c32b338c03526255dcf2a39eb1897f",
  "question": "What were the top 3 loss-making coins?",
  "conversationHistory": []
}
```

## Architecture

### Backend (`/`)

- `lib/agent.ts` - Groq-powered AI agent with tool-use loop
- `lib/stats.ts` - Deterministic trading statistics engine
- `lib/hyperliquid.ts` - Hyperliquid API client
- `app/api/analyze/route.ts` - Analysis endpoint
- `app/api/chat/route.ts` - Chat endpoint

### Website (`/web`)

- Landing page with live demo
- Calls backend API via `NEXT_PUBLIC_API_URL`
- Built with Next.js, Tailwind CSS, Framer Motion, Three.js

## Testing

Test addresses are documented in `test-addresses.md`.

Example test:

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"address":"0x102a618b36c32b338c03526255dcf2a39eb1897f"}'
```

## CORS Configuration

The backend API allows requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

Update `ALLOWED_ORIGINS` in API route files to add more origins.

## Tech Stack

- **Framework**: Next.js 16.4.0
- **AI**: Groq SDK (openai/gpt-oss-120b model)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion, GSAP
- **3D**: Three.js, React Three Fiber
- **Testing**: Vitest

## Design Documents

- `DESIGN.md` - Technical design and architecture
- `TASKS.md` - Implementation tasks and status
- `docs/hyperliquid-api.md` - Hyperliquid API reference

## License

MIT
