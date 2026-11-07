# Depth-Focus Study Plan — AI & Infrastructure Planning

Goal: go deep on the exact stack and problem shape of agent-driven infrastructure planning — not broad interview prep. Each domain below ends in a project artifact in this repo.

## The seven domains

### D1. TypeScript on serverless / edge runtimes
- Type system in anger: generics, discriminated unions, narrowing, `zod` schemas as runtime contracts.
- Async model: promises, streaming responses, no long-lived process — state lives outside the handler.
- Tooling: Wrangler, `wrangler dev` / `wrangler deploy`, Workers types.
- **Proof:** Project 01.

### D2. Workers platform primitives
- **Workers** — request handlers at the edge; bindings over network calls.
- **Durable Objects** — strongly consistent per-entity state, storage, alarms; the "one object = one aggregate" mental model.
- **Workflows** — durable multi-step execution that survives restarts; `step.do`, `step.sleep`, `waitForEvent` for human pauses.
- **D1** (SQLite), **R2** (objects), **Queues** (async fan-out), **Vectorize** (embeddings), **Workers AI** (inference), **AI Gateway** (caching, rate limiting, observability for model calls).
- **Proof:** Projects 01, 02, 04.

### D3. Agent engineering
- Tool calling: schema design, error surfaces, idempotency keys on every mutating tool.
- Structured output: force the model's hand with schemas; validate; retry with the error fed back.
- Orchestration: single agent with tools → sequential pipeline → supervisor/multi-agent. Know when each is enough.
- Agents SDK on Workers; state and memory in Durable Objects.
- **Proof:** Projects 01, 03.

### D4. Evals and prompt iteration
- Golden datasets from real planning scenarios; graders: deterministic checks first, LLM-as-judge second, human review for the tail.
- Prompt iteration as an engineering loop: change one variable, run the set, record the score delta.
- Regression gates: a prompt/model change does not ship on a red eval.
- **Proof:** Project 03's eval harness.

### D5. Safety for autonomous operations
- Risk tiering: classify an action by blast radius and reversibility; tier decides the approval path.
- Approval checkpoints: formal, recorded, with the plan and its evidence attached — not a chat message.
- Audit logs and execution lineage: every agent run reconstructable after the fact.
- Least-privilege tools: an agent that forecasts does not get a tool that provisions.
- **Proof:** Project 02; design in RFC-001.

### D6. Forecasting and infrastructure planning
- Time-series basics: trend, seasonality, level shifts; EWMA and Holt-Winters by hand once, then in code.
- Capacity planning method: demand forecast → headroom policy → supply plan → cost model. Lead times are inputs, not afterthoughts.
- Analytics SQL: window functions, cohort/quantile queries over usage history (BigQuery-flavored thinking; executed here on D1).
- Monitoring: forecast-vs-actual tracking, drift alerts, forecast quality as a metric.
- **Proof:** Project 04; consumed by Project 03.

### D7. Craft: RFCs, specs, design review
- Write the spec before the system: problem, constraints, options considered, decision, open questions.
- Data contracts: schema ownership, compatibility rules, expand-and-contract — written down, versioned.
- **Proof:** docs/rfc/RFC-001, updated as the projects land.

## Schedule

| When | Focus | Artifact |
|------|-------|----------|
| Weekend 1 | D1 + D2 basics; Workers AI tool calling | Project 01 deployed |
| Week 1 evenings | D2 deep: Durable Objects, Workflows, D1 | Project 02 core: approval pause + audit log |
| Weekend 2 | D3 + D4: orchestration and evals | Project 03 with eval harness v1 |
| Week 2 evenings | D6: forecasting pipeline | Project 04 feeding Project 03 |
| Weekend 3 | D7: RFC-001 final pass; design drill out loud | RFC review-ready |

## Core resources

- Cloudflare Workers docs — developers.cloudflare.com/workers
- Durable Objects, Workflows, D1, Queues, Workers AI, AI Gateway docs — same site, one section each; read the "how it works" page before the API reference.
- Cloudflare blog (blog.cloudflare.com) — Agents SDK and Workflows announcements and deep dives; the platform's own design writing.
- TypeScript Handbook — the type-level chapters, not the tutorial.
- Your own production experience is the other resource: every concept here gets compared against a system you have already run (durable workflows ≈ replay-safe streaming; approval gates ≈ index guardrails; contracts ≈ schema evolution). Write the comparison down in notes/ — that mapping is the interview answer.
