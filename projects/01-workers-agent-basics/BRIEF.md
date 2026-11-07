# Project 01 — Workers Agent Basics

**Forces:** TypeScript on Workers · Workers AI · tool calling · structured output
**Time box:** one weekend session (~2–3 hours)

## Build

A single TypeScript Worker that answers one question: *"Given this capacity time series, what changed and what needs a human's eye?"*

1. `POST /analyze` accepts a JSON body: a named metric series (e.g. weekly GPU demand for a region) as `{ date, value }` points.
2. Deterministic tools first (plain TypeScript functions, no LLM):
   - `computeStats` — latest value, 4-week and 12-week moving averages, week-over-week change.
   - `detectBreaks` — flag level shifts: points more than 2 standard deviations from the trailing mean.
3. A Workers AI model call with **tool calling**: the model may call the two tools above, then must return **structured output** matching a strict schema:
   ```json
   { "summary": "string", "trend": "up|down|flat", "breaks": [{ "date": "...", "note": "..." }], "needs_review": true }
   ```
   Validate the response against the schema. On validation failure, retry once with the error fed back; on second failure, return the deterministic stats with `needs_review: true` — never return unvalidated model output.
4. Deploy with Wrangler. Log every model call's latency and token counts to the console (AI Gateway comes in Project 03).

## Done criteria

- [ ] Deployed Worker with a public `workers.dev` URL.
- [ ] Structured output validates on a test series with a planted level shift; the shift is reported.
- [ ] A forced bad model response exercises the retry-then-fallback path.
- [ ] README in this folder: what it does, the schema, one paragraph on what surprised you about the edge runtime.

## Talking points this buys

- "My production languages are Python and Go — I built this in TypeScript on Workers to learn the runtime: no process state, everything through bindings, state pushed to the edges of the handler."
- Structured output discipline: schema first, validation always, deterministic fallback — the model proposes, the system disposes.
