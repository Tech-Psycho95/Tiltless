# TASKS.md: Tiltless build tracker

Rules for the agent: tick items as you finish them, add a one-line note under
any blocker, and update the "Current status" block after every step. If this
session restarts, resume from the first unchecked item. Do not redo finished work.

## Current status
- Last completed step: Minimal UI complete and wired to backend ✅
- Currently working on: Waiting for ANTHROPIC_API_KEY to test end-to-end
- Blockers: **Need ANTHROPIC_API_KEY in .env.local to test the agent**

## Step 0: Orient
- [x] Read AGENTS.md, docs/hyperliquid-api.md, DESIGN.md, test-addresses.md
- [x] Inspect repo; summarize what exists vs missing
- [x] Verify Hyperliquid API fields against official docs; fix docs/hyperliquid-api.md
- [x] Post the remaining plan

## Build
- [x] 1. App runs locally (Next.js + TS + Tailwind) - scaffolded, ready to run
- [x] 2. hyperliquid.ts: fills, funding, positions; real response shape logged
- [x] 3. stats.ts + unit tests on fixtures/ - deterministic metrics complete
- [x] 4a. agent.ts - Anthropic tool-use loop with 6 tools complete
- [x] 4b. /api/analyze and /api/chat routes complete
- [x] 4c. Minimal UI wired to backend - address input, results, chat
- [ ] 5. Test the agent end-to-end with real address (NEED API KEY)
- [ ] 6. Error and empty states; rate limit; token cap
- [ ] 7. Deployment prep: maxDuration, env var list, prod build tested locally
- [ ] 8. README

## Human tasks (agent: do NOT do these)
- [ ] Add GROQ_API_KEY to .env.local (CHANGED FROM ANTHROPIC)
- [ ] Provide test addresses (see test-addresses.md) ✅ DONE
- [ ] Save real API responses into fixtures/ ✅ DONE
- [ ] Push repo to GitHub and deploy on Vercel; add env vars there
- [ ] Verify FAQ and marketing claims against real app behavior
- [ ] Record demo video, write pitch, submit on Colosseum before deadline

## Final verification
- [ ] Every number in the written autopsy matches the stats panel
- [ ] Follow-up chat answers 3 sample questions correctly
- [ ] Autopsy appears in under ~30s for a typical wallet
- [ ] No secrets in repo; .env.local is gitignored
- [ ] Anything unfinished or untested is listed below

## Unfinished / untested
(agent fills this in at the end)
