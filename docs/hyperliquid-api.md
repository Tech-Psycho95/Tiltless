# Hyperliquid Info API Reference

Public REST endpoint: `POST https://api.hyperliquid.xyz/info`

All requests are POST with JSON body. No authentication required for public data.

## Request Types

### VERIFY: Check these against official docs before relying on them

### userFills
**Request:**
```json
{"type": "userFills", "user": "0x..."}
```

**Response:** Array of recent fills (capped at ~2000 latest fills)

**Fields (VERIFIED from real API response):**
- `coin`: string - Market symbol (e.g., "BTC", "ETH") or index format like "@107" for spot coins
- `px`: string - Fill price
- `sz`: string - Fill size
- `side`: string - "B" (buy) or "A" (sell/ask)
- `time`: number - Timestamp in milliseconds
- `dir`: string - Direction ("Buy", "Sell", etc.)
- `closedPnl`: string - Realized PnL from this fill
- `fee`: string - Trading fee paid
- `feeToken`: string - Fee denomination ("USDC" or "HYPE")
- `startPosition`: string - Position size before this fill
- `hash`: string - Transaction hash
- `oid`: number - Order ID
- `tid`: number - Trade ID
- `crossed`: boolean - True if this was a taker order
- `twapId`: number | null - TWAP order identifier

**VERIFIED:** ✅ All fields confirmed from real response

### userFillsByTime
**Request:**
```json
{
  "type": "userFillsByTime",
  "user": "0x...",
  "startTime": 1735689600000,
  "endTime": 1738281600000
}
```

**Response:** Same structure as userFills but filtered by time range

**Notes:**
- Times are in milliseconds since Unix epoch
- Use for paginating through longer history
- VERIFY: Does this support aggregationTime parameter?

### userFunding
**Request:**
```json
{
  "type": "userFunding",
  "user": "0x...",
  "startTime": 1735689600000
}
```

**Response:** Array of funding payments

**Fields (VERIFY these):**
- `coin`: Market symbol
- `fundingRate`: The funding rate applied
- `time`: Timestamp (milliseconds)
- `usdc`: Payment amount (positive = received, negative = paid)
- `szi`: Position size at funding time

**VERIFY:** Field names and whether all fields are strings

### clearinghouseState
**Request:**
```json
{"type": "clearinghouseState", "user": "0x..."}
```

**Response:** Current account state

**Fields (VERIFY structure):**
```
{
  "assetPositions": [...],
  "marginSummary": {
    "accountValue": string,
    "totalMarginUsed": string,
    "totalNtlPos": string,
    "totalRawUsd": string
  },
  "crossMarginSummary": { ... }
}
```

**VERIFY:** Exact field names and nesting

## Known Issues & Edge Cases

1. **Numbers as strings:** Most numeric fields arrive as strings. Always parse with `Number()` or decimal library.
2. **Spot coins:** May appear as index names like "@107". Map via meta endpoints if needed.
3. **Builder-deployed perps:** May have prefixed coin names.
4. **Rate limits:** Public endpoint, likely rate-limited. Cache responses and add retry logic.
5. **Sub-accounts:** Each address is independent. No automatic aggregation.
6. **Vaults:** Vault addresses analyzed separately from their owner.

## Action Items

- [ ] Verify `userFills` response structure against a real API call
- [ ] Verify `userFunding` response structure
- [ ] Verify `clearinghouseState` response structure
- [ ] Check official docs at hyperliquid.gitbook.io or app.hyperliquid.xyz/API
- [ ] Test with fixture data and update this file with corrections
- [ ] Confirm all field types (string vs number)
- [ ] Document any missing or extra fields found in real responses
