# Core Concepts — Read Before Building

Step zero. Nothing here needs a terminal. Each concept is short: what it is, the mental model, and what it maps to in systems you have already run. At the end is a readiness gate — if you can answer those questions in your own words, you are ready for SETUP.md and Project 01.

Estimated read: 2–3 hours with the linked docs open.

---

## Part 1 — The runtime

### 1. Workers and isolates
A Worker is not a server. Your code runs inside a V8 **isolate** — a lightweight JavaScript sandbox — started on a machine near the user, in a network of hundreds of cities. Isolates are cheap to create, so there is effectively no cold start, but the trade is real: **no filesystem, no persistent memory, no background process.** Anything that must survive the request lives somewhere else.

*Mental model:* a function that runs anywhere, remembers nothing.
*Maps to:* your stateless stream processors — state lives in the store, never in the handler.

### 2. The fetch handler and bindings
The whole shape of a Worker is: a request comes in, your `fetch` handler runs, a response goes out. Everything the Worker can touch — AI models, databases, queues — arrives as a **binding**: a capability declared in `wrangler.toml` and injected through the `env` object. A binding is not a network client you construct; it is a direct line the platform hands you.

*Mental model:* dependency injection, where the platform is the container.
*Rule of thumb:* if you are reaching for an API key and an HTTP client to talk to a Cloudflare service, you missed a binding.

### 3. CPU time and async
Handlers are billed and limited on CPU time, not wall-clock waiting. Waiting on a fetch or a model call is fine; burning CPU in a long loop is not. Everything is async — `async`/`await` all the way down — because the runtime serves many requests from one isolate.

*Maps to:* backpressure thinking. The platform protects itself; design so it does not have to.

## Part 2 — TypeScript, as used here

### 4. Types are contracts
An `interface` is a promise about a shape. With `strict` on, the compiler checks every promise it can see — null handling included. In this stack, types do the work unit tests do elsewhere: they make whole classes of bugs unrepresentable.

*Maps to:* the schema discipline you already enforce on document contracts — moved to compile time.

### 5. Types vanish at runtime — that is why schemas exist
TypeScript types are erased when the code runs. The compiler cannot protect a boundary: a request body, a queue message, a model response. Anything crossing a boundary gets a **runtime schema** (JSON Schema / zod) and a validation step. This one idea runs the whole agent design later: the type system guards your code, schemas guard your borders.

### 6. Modules and the platform type surface
Workers code is ES modules: `export default { fetch(...) }`. The `@cloudflare/workers-types` package is what teaches the compiler the platform's globals (`Response`, bindings, the `Ai` type). If the compiler says a platform API does not exist, believe it — Node APIs mostly do not exist here.

## Part 3 — The storage spectrum

Choosing storage on Workers is a consistency-and-query decision, not a size decision.

### 7. The four shapes
- **KV** — key-value, cached at the edge, *eventually consistent*. For config, flags, read-heavy lookups. Wrong for anything that must be right immediately.
- **D1** — relational SQL (SQLite). Real queries, joins, transactions at planning scale. The audit log lives here.
- **R2** — object storage for blobs and raw payloads. The evidence layer: big, cheap, rarely queried.
- **Durable Objects** — see concept 9. Strong consistency for one entity's state.

*Maps to:* the same split you already run — Redis for hot lookups, a relational store for truth, object storage for raw payloads.

### 8. Queues
A queue decouples a producer from a consumer: the producer writes and leaves; the consumer processes with retries, and failures land in a dead-letter queue with reasons. Delivery is at-least-once, so consumers are idempotent — you know this rule cold.

*Maps to:* a Kafka topic with the operations budget of a planning tool instead of a streaming platform.

## Part 4 — Durable execution

### 9. Durable Objects
A Durable Object is a single-writer actor addressed by an ID: one instance owns one entity's state, processes calls to it one at a time, and persists storage transactionally. Because there is exactly one writer, there are no race conditions to solve — coordination problems become addressing problems ("which object owns this proposal?"). It also has **alarms**: a durable wake-up call it sets for itself.

*Mental model:* one object = one aggregate = one source of truth.
*Maps to:* a keyed partition with a single owning consumer — except the platform guarantees it.

### 10. Workflows
A Workflow is a program whose progress is stored. Each `step.do` result is persisted; if the process dies or the code deploys mid-run, the workflow resumes after the last completed step. `step.sleep` and `waitForEvent` are durable too — a workflow can pause for a human for three days and lose nothing.

*Mental model:* a call stack that lives in a database.
*Maps to:* an Airflow DAG run, except durability and human waits are the platform's job, not your retry config.

## Part 5 — Models and agents

### 11. An LLM call, anatomically
Prompt in, tokens out. The model is **stateless** — every call starts from zero and knows only what is inside the context window you sent. Memory, history, and state are your system's job, never the model's. Temperature trades consistency for variety; planning systems want it low.

*Rule of thumb:* anything the model "should know" must be in the prompt, a tool result, or a store you control.

### 12. Tool calling
You describe functions to the model as schemas. The model may answer with a **tool call** — a structured request, not an execution. *Your* code validates it, runs the function, and returns the result to the model, which continues. The loop repeats until the model produces a final answer or you cut it off.

Two disciplines make this production-shaped:
- **Tools are contracts.** Narrow inputs, explicit errors, no god-functions.
- **Mutating tools carry idempotency keys.** The model can retry; the world must not double-execute.

### 13. Structured output
Instead of parsing prose, you require the model's final answer to match a schema — then you validate it like any other untrusted input (concept 5). On failure: one retry with the error fed back, then a deterministic fallback or a human. Never pass unvalidated model output downstream.

*Maps to:* a data contract with a very confident, occasionally wrong producer.

### 14. Orchestration patterns
- **Single agent + tools** — enough for most tasks. Default here.
- **Pipeline** — agents in sequence, each output the next input. Forecaster → Planner.
- **Supervisor / multi-agent** — separate agents for separate jobs with separate failure modes. The Critic is the case study: it must attack the plan, so it must not share the Planner's context or incentives.

*Rule of thumb:* a new agent is justified by a different job or a different failure mode — never by symmetry.

### 15. AI Gateway
A control point in front of every model call: caching, rate limits, logging, cost visibility. You would build this yourself in front of any model endpoint in production; here it is a binding and a dashboard.

## Part 6 — Trust: safety and evals

### 16. Risk tiering and approval checkpoints
An autonomous system earns trust in tiers. Classify each proposed action by **blast radius** (how much it touches) and **reversibility** (how hard to undo). The tier sets the approval path: who approves, how many, how long the offer stands. Approval is a recorded event tied to the exact plan version approved — not a thumbs-up in a chat thread.

*Maps to:* your index guardrails. Automated output does not ship until the gate passes, and the gate's decision is recorded.

### 17. Audit log and execution lineage
One append-only event stream per entity: proposed, tiered, approved, executed — actor, timestamp, payload. **Lineage** means any decision can be replayed exactly: which agent ran, what it saw, which tools it called, who approved. If you cannot replay it, you do not have an auditable system; you have a story.

### 18. Evals
Prompts are code, and code ships with tests. An eval is a **golden set** of scenarios with expected properties, graded deterministically wherever possible (schema valid? headroom respected? planted error caught?) and by a judge model only where judgment is the thing being graded. Every prompt or model change runs the set and records the score delta in a changelog. A red eval blocks the change.

*Maps to:* the same reason a scoring change in a trading system gets backtested before it goes live.

## Part 7 — Forecasting

### 19. Anatomy of a time series
Every demand series is four things added together: **level** (where it sits), **trend** (where it is heading), **seasonality** (the repeating weekly/yearly shape), and **noise**. Two events matter most in planning data: a **level shift** (the level steps up and stays — real demand change) and a **spike** (one point jumps and returns — usually an incident or an artifact). Confusing them is how organizations buy hardware for a one-week anomaly.

### 20. EWMA and honest error
An exponentially weighted moving average is the working forecaster's baseline: recent points weigh more, the weight decays smoothly. It will not win competitions; it will be right about direction and roughly right about size, and it is explainable to an executive in one sentence. The serious concept is the second one: **forecast-vs-actual error is a first-class metric**, tracked continuously. When rolling error grows, the system has drift — and drift is a signal to stop trusting the plan, surfaced loudly, not a number in a dashboard nobody opens.

*Maps to:* sizing fan-out before a change ships. A forecast is only useful next to the cost of it being wrong.

---

## Readiness gate

You are ready to set up and build when you can answer these in your own words, without notes:

1. Why can't a Worker keep state in a variable between requests — and where does state go instead?
2. A binding versus an API call: what is the difference, and why does it matter?
3. TypeScript type versus runtime schema: which boundary does each one guard?
4. Pick for a job: proposal state that must never be double-approved; an audit trail queried by date; raw uploaded CSVs; a feature flag read on every request. Which store for each, and why?
5. Between the model emitting a tool call and the tool running, what happens — and who is responsible for the side effect?
6. Why does the Critic not share the Planner's context?
7. A workflow is waiting on a human for two days when the code deploys. What happens to the wait?
8. Your forecast has been wrong for three straight weeks. How does the *system* know — and what does it do about it?
9. A field is removed from the plan schema that the Critic consumes. What breaks, and what does the safe rollout look like?

Answers live across the parts above and the Cloudflare docs. When one sticks, write the sticking point in `notes/` — that note is the study.
