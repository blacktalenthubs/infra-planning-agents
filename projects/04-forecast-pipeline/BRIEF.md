# Project 04 — Forecast Data Pipeline

**Forces:** Queues · D1/R2 · statistical forecasting · forecast monitoring and drift
**Time box:** Week 2 evenings

## Build

The data layer the agents stand on. Synthetic data is fine — the shape is real.

1. **Generate.** A script produces a year of weekly demand series for several regions and resources: trend + seasonality + noise, with two planted events (a level shift, a one-off spike). Commit the generator, not just its output — the planted events are the test fixtures.
2. **Ingest.** Points are published to a **Queue**; a consumer validates (schema, monotonic dates, no negative demand) and writes to **D1**. Bad points go to a dead-letter path with the rejection reason recorded — never silently dropped.
3. **Store raw + curated.** Raw payloads to **R2**; curated series in D1 tables: `series`, `points`. The split is deliberate: D1 is the query layer, R2 is the evidence layer.
4. **Forecast.** A batch job (Cron Trigger or manual endpoint) computes per series: EWMA forecast, a simple trend+seasonality fit, and the previous forecast's error. Results land in a `forecasts` table with the model name and parameters — a forecast without its method recorded is not a forecast, it is a rumor.
5. **Monitor.** Forecast-vs-actual error tracked weekly; if rolling error crosses a threshold, a drift event is written and surfaced. This is the "continuous monitoring" the planning system owes its users.

## Done criteria

- [ ] Queue → D1 ingestion with validation; a planted bad batch lands in the dead-letter path with reasons.
- [ ] Forecasts table holds method + parameters alongside values for every run.
- [ ] The planted level shift shows up as a drift event after it happens — and not before.
- [ ] Project 03's Forecaster can read its input from this pipeline's D1 instead of a fixture.
- [ ] README: the raw/curated split and the error metric chosen, with the reason.

## Talking points this buys

- Forecasting is a data engineering problem before it is a modeling problem: validation, lineage, recorded methods, monitored error.
- Direct line to production experience: idempotent ingestion, replay, dead letters — the same guarantees as a streaming platform, at planning scale.
