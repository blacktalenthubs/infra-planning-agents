# Notes

Running glossary and reading notes. One rule: every concept gets a comparison line — *what this maps to in a system I have already run* — because that mapping is where understanding (and interview answers) actually come from.

## Glossary (starter)

- **Worker** — request handler at the edge; no process state between requests. *Maps to: a stateless stream processor — state lives in the store, not the handler.*
- **Durable Object** — a single-writer, strongly consistent stateful actor addressed by ID. *Maps to: a keyed state store with one owner per key — like a partitioned consumer that owns its partition's state.*
- **Workflow** — durable multi-step execution; steps persist, sleeps and event waits survive restarts. *Maps to: an Airflow DAG run with real durability and human waits as first-class state.*
- **waitForEvent** — a workflow paused until an external event arrives. *Maps to: an approval gate — but as platform state, not an application flag.*
- **D1** — SQLite at the edge. *Maps to: the query layer; fine for planning-scale data and audit logs.*
- **AI Gateway** — proxy for model calls: caching, rate limits, logs. *Maps to: the observability and control point you would build anyway in front of a model endpoint.*
- **Structured output** — model responses constrained to a schema, then validated. *Maps to: a data contract — and it gets the same discipline: versioned, validated, never trusted raw.*

## Reading log

| Date | Source | One-line takeaway |
|------|--------|-------------------|
| | | |
