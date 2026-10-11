# fixtures/

Save REAL API responses here so the stats engine can be tested offline.
After you have a test address, run:

```bash
curl -s -X POST https://api.hyperliquid.xyz/info -H 'Content-Type: application/json' \
  -d '{"type":"userFills","user":"0xADDRESS"}' > sample-fills.json

curl -s -X POST https://api.hyperliquid.xyz/info -H 'Content-Type: application/json' \
  -d '{"type":"userFunding","user":"0xADDRESS","startTime":1735689600000}' > sample-funding.json
```

Trim each to ~200 entries. These contain only public data.
Or tell the agent: "Fetch one sample for test address #2 and save it here."
