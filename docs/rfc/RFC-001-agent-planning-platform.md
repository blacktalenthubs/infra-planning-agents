# RFC-001 — Agent-Driven Infrastructure Planning Platform

**Status:** Draft · **Author:** O. Bolofinde · **Reviewers:** (study document)

## Problem

Capacity, supply, and cost decisions for infrastructure are made from notebooks and email threads. The analysis is real, but it is not reproducible: inputs are copied by hand, assumptions live in prose, approvals happen in inboxes, and six months later nobody can reconstruct why a number was believed or who signed off. The cost of a wrong plan is hardware — ordered late, it is an outage risk; ordered early and wrong, it is stranded capital.

## Proposal

A multi-agent system on Cloudflare Workers that turns planning into durable, auditable workflows:

- A **Forecaster** agent produces demand forecasts from time-series history, using deterministic statistical tools, and records its assumptions.
- A **Planner** agent converts forecasts into supply plans and cost models under an explicit headroom policy.
- A **Critic** agent independently checks plans against policy and history before any human sees them.
- Every plan becomes a **proposal** in a durable workflow. A deterministic **risk tier** sets the approval path. Execution is a separate step reachable only through recorded human approval.
- An append-only **audit log** records every event with execution lineage, so any decision can be replayed exactly.

## Design decisions

1. **Deterministic where possible, LLM where judgment is the point.** Statistics, tiering, policy checks, and cost arithmetic are code. Models summarize, extract assumptions, and critique. A model never computes a number the system then trusts unchecked.
2. **Structured output with validation at every agent boundary.** An agent's output is untrusted input to the next stage until it validates against a schema. Failure path: one retry with the error fed back, then escalate to a human — never silent acceptance.
3. **Approvals are workflow state, not UI state.** The pause is a Durable Workflow waiting on an event; it survives deploys and restarts. Approval records carry identity, timestamp, the plan version approved, and the evidence shown.
4. **Least-privilege tools.** The Forecaster cannot write plans; the Planner cannot execute; execution tools exist only inside the post-approval step.
5. **Data contracts between stages.** Forecast, plan, and objection schemas are versioned. A breaking change follows expand-and-contract: producers emit both versions until consumers migrate. (Lesson carried from production: a removed field once broke a downstream consumer running the old schema.)

## Architecture sketch

```
history ──> [Pipeline: Queues -> D1/R2] ──> Forecaster ──> Planner ──> Critic
                                                  │ objections loop (once)
                                                  ▼
                              Proposal (Workflow + Durable Object)
                                                  │ risk tier -> approval path
                                                  ▼
                                     waitForEvent: approve / reject / expire
                                                  ▼
                                          Execute (logged step)
        Audit log (D1, append-only) written at every transition.
        All model calls via AI Gateway. Forecasts monitored vs actuals (drift).
```

## Alternatives considered

- **Single agent with many tools.** Simpler, but the critic must not share the planner's context, and one prompt becomes the dumping ground for every policy. Rejected for the planning core; fine for the summarization edges.
- **Fully deterministic system (no agents).** Right for the math, wrong for the inputs: assumptions arrive as prose from domain experts, and critique is a judgment task. The hybrid is the point.
- **Human chat approvals (Slack/email).** Fast to build, unauditable in practice: approvals detach from plan versions. Rejected — the audit log is the product.

## Risks and open questions

- Forecast quality gates: how bad must forecast-vs-actual error get before the system refuses to plan from a series? (Needs a policy, not a vibe.)
- Eval coverage: the golden set starts small; which failure in production would the current set not catch?
- Cost model ownership: unit prices are inputs owned by finance/planning — who updates them, and how are stale prices detected?
- Tier thresholds are policy decisions owned by planning leadership, not engineering. The system's job is to enforce and record them, not to set them quietly in code review.

## Rollout

1. Read-only mode: agents forecast and critique; humans plan as today; compare outputs for a quarter.
2. Proposal mode: agents draft proposals; humans approve in the workflow.
3. Tier 1 auto-approval for the smallest, reversible class — only after a clean eval and audit history exists to argue from.
