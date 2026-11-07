# infra-planning-agents

An auditable multi-agent system for infrastructure planning — agent-driven **forecasts, supply plans, cost models, and workflow approvals** that planners and executives can rely on for decisions, built on the Cloudflare Workers platform.

This repo is a hands-on depth study. Every project here exists to force one part of that system into real, running code: durable agent workflows, human approval checkpoints, audit logs with execution lineage, an eval harness, and a forecasting pipeline.

## The system, in one paragraph

Planners today work out of notebooks and email threads. This system replaces that with agents: a **forecaster** turns time-series demand signals into a capacity forecast, a **planner** turns the forecast into a supply plan and a cost model, a **critic** checks the plan against policy and history — and nothing executes until a human approves it at a checkpoint set by the plan's risk tier. Every step is written to an audit log with full execution lineage: which agent ran, with what inputs, which tools it called, who approved, and what changed.

## Projects

| # | Project | Forces | Status |
|---|---------|--------|--------|
| 01 | [Workers agent basics](projects/01-workers-agent-basics/BRIEF.md) | TypeScript on Workers, Workers AI, tool calling, structured output | Not started |
| 02 | [Durable approval workflow](projects/02-durable-approval-workflow/BRIEF.md) | Workflows, Durable Objects, D1 audit log, human approval pause, risk tiers | Not started |
| 03 | [Multi-agent forecasting](projects/03-multi-agent-forecasting/BRIEF.md) | Multi-agent orchestration, eval harness, prompt iteration | Not started |
| 04 | [Forecast data pipeline](projects/04-forecast-pipeline/BRIEF.md) | Queues, D1/R2, statistical forecasting, drift monitoring | Not started |

## Start here — in this order

1. [CONCEPTS.md](CONCEPTS.md) — core concepts before any building: the runtime, TypeScript and schemas, the storage spectrum, durable execution, agents, trust, forecasting. Ends with a readiness gate.
2. [SETUP.md](SETUP.md) — local toolchain: Node, Wrangler, Cloudflare login, the daily dev loop.
3. [STUDY_PLAN.md](STUDY_PLAN.md) — the depth-focus curriculum: seven domains, resources, and the week-by-week schedule.
4. The project briefs below, in order.

## Docs

- [STUDY_PLAN.md](STUDY_PLAN.md) — the depth-focus curriculum: seven domains, resources, and the week-by-week schedule.
- [RFC-001](docs/rfc/RFC-001-agent-planning-platform.md) — architecture RFC for the flagship system (projects 02 + 03), written for design review.
- [notes/](notes/) — running glossary and reading notes.

## Stack

TypeScript · Cloudflare Workers · Durable Objects · Workflows · D1 · R2 · Queues · Vectorize · Workers AI · AI Gateway

## Working rules

- Working code over notes. Every project ends deployed or runnable, with a README saying what it does and what it taught.
- No claim without an artifact: if a skill is listed here, a project below proves it.
- Deterministic logic where determinism wins; LLMs where judgment is the point. The line between them is a design decision, written down in the RFC.
