# Project 02 — Durable Approval Workflow (flagship)

**Forces:** Workflows · Durable Objects · D1 audit log · human approval checkpoints · risk tiering · execution lineage
**Time box:** Week 1 evenings + Weekend 2 start

## Build

A capacity change proposal that cannot execute itself. The flow:

1. **Propose.** `POST /proposals` with a plan (region, resource, delta, cost estimate, justification) creates a Workflow instance and a Durable Object that owns the proposal's state.
2. **Risk tier (deterministic, no LLM).** A pure function classifies the proposal:
   - **Tier 1** — small delta, reversible, under cost threshold → one approver.
   - **Tier 2** — medium → two approvers, 24h expiry.
   - **Tier 3** — large, irreversible, or over cost threshold → two approvers + a mandatory cooling-off period.
   The tier function is unit-tested with boundary cases. This is the piece to be able to defend line by line.
3. **Approval pause.** The Workflow waits with `waitForEvent` for approve/reject events. `POST /proposals/:id/approve` and `/reject` (approver identity in the body — real auth is out of scope, identity is recorded, not verified; say so in the README).
4. **Execute.** On approval, a final Workflow step "executes" the plan — in this study, execution means writing the committed plan record and emitting a completion event. The shape is what matters: execution is a separate, logged step that can only be reached through the checkpoint.
5. **Audit log in D1.** One append-only table, one row per event: `proposal_id, seq, ts, actor, event, payload_json`. Events: proposed, tiered, approval_requested, approved, rejected, expired, executed. **Execution lineage** = replaying a proposal's rows in `seq` order. Add `GET /proposals/:id/lineage` that returns exactly that replay.
6. **Expiry.** A Tier 2/3 proposal not decided in its window expires via Workflow sleep — and the expiry is an audit event, not a silent death.

## Done criteria

- [ ] Happy path: propose → tier → approve → execute, lineage endpoint replays all six events in order.
- [ ] Reject path and expiry path both terminate the workflow and are visible in lineage.
- [ ] A proposal cannot reach `executed` without the required approvals — attempt to skip the checkpoint fails (test it).
- [ ] Risk-tier function has unit tests at every boundary.
- [ ] README: the tier policy table and one paragraph on why approvals live in the workflow, not in a UI flag.

## Talking points this buys

- Human-in-the-loop as a *durable* property: the pause survives deploys and restarts because it is a Workflow state, not a pending HTTP request.
- The audit log is the product: planners and executives trust the system because every decision is reconstructable — the same reason batch indexes at Apple do not ship until guardrails pass and the gate decision is recorded.
