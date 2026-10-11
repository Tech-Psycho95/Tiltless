# Test Addresses for Tiltless

These are public Hyperliquid wallet addresses used for testing and development.

## Active Trading Addresses

### Address #1: High-frequency trader
```
0xb317d2bc2d3d2df5fa441b5bae0ab9d8b07283ae
```
**Why useful:** Very active address, good for testing high-volume scenarios
**Source:** Found on Hyperliquid explorer public pages
**Notes:** Use this for testing fee drag and overtrading detection

### Address #2: Typical trader
```
0x102a618b36c32b338c03526255dcf2a39eb1897f
```
**Why useful:** Moderate activity, representative of typical user
**Source:** Found on Hyperliquid explorer public pages
**Notes:** Use this for baseline behavior patterns

### Address #3: Low activity trader
```
0x77c3ea550d2da44b120e55071f57a108f8dd5e45
```
**Why useful:** Fewer trades, good for testing low-data scenarios
**Source:** Found on Hyperliquid explorer public pages
**Notes:** Use this for empty/sparse state testing

## Invalid/Empty Addresses

### Address #4: Invalid format (for error testing)
```
0xinvalidaddress123
```
**Why useful:** Tests input validation and error handling
**Notes:** Should trigger "invalid address format" error

### Address #5: Valid format but no trades
```
0x0000000000000000000000000000000000000001
```
**Why useful:** Tests empty state when wallet exists but has no trading history
**Notes:** Should show "no trades found" message without calling LLM

---

**Note:** These are all public addresses. The Hyperliquid info API is public and requires no authentication. Replace these addresses with your own test cases if needed.

**Fixture data:** Sample API responses for Address #2 should be saved in `fixtures/` directory for offline testing.
