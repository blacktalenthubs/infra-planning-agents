# Project 03 — Multi-Agent Forecasting + Eval Harness

**Forces:** multi-agent orchestration · structured output across agents · evals · prompt iteration · AI Gateway
**Time box:** Weekend 2

## Build

Three agents, one pipeline, feeding Project 02's proposal flow:

1. **Forecaster.** Input: a metric history (from Project 04, or a fixture until it lands). Tools: the deterministic forecast functions (EWMA, trend fit — code, not vibes). Output (structured): forecast points, confidence band, assumptions list.
2. **Planner.** Input: the forecast + a headroom policy. Output (structured): a supply plan — quantities by period, lead-time-aware order points, a cost model with unit prices as explicit inputs. The plan must be submittable to Project 02 as a proposal.
3. **Critic.** Input: forecast + plan + policy. Job: attack it. Checks: headroom policy violated anywhere? Lead time ignored? Cost model missing a line? Output (structured): objections list, each with severity; a plan with a high-severity objection cannot be submitted — it loops back to the Planner once with the objections attached, then escalates to a human.
4. Route all model calls through **AI Gateway** for caching and logs.

## The eval harness (the real deliverable)

- `evals/golden.jsonl` — 10–15 scenarios: clean growth, seasonal spike, level shift, noisy flat, sudden drop. Each with expected properties (not exact numbers): trend direction, break detected yes/no, headroom respected, objection raised where one is planted.
- `evals/run.ts` — runs the pipeline over the golden set, grades with deterministic checks first; an LLM judge only for summary quality. Prints a scorecard per agent and end-to-end.
- `evals/CHANGELOG.md` — every prompt or model change: what changed, why, score before → after. No silent prompt edits.

## Done criteria

- [ ] End-to-end run: history in → approved-ready proposal out, with the Critic's objections visible.
- [ ] A planted bad plan (headroom violated) is caught by the Critic and cannot submit.
- [ ] Eval scorecard runs green on the golden set; one deliberate prompt regression is caught by the harness and recorded in the changelog.
- [ ] README: where the LLM ends and deterministic code begins, per agent — and why.

## Talking points this buys

- Multi-agent is a decomposition tool, not a default: three agents here because forecast, plan, and critique are different jobs with different failure modes — and the critic must not share the planner's context.
- Evals are the unit tests of agent systems: golden set, deterministic graders, a changelog. Prompt changes ship like code changes or not at all.
