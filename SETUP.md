# Local Setup

Everything in this repo runs locally first with `wrangler dev`. One toolchain serves all four projects.

## Prerequisites

- **Node.js 20 LTS or newer** — check with `node --version`. (Wrangler 4 needs Node 18+; stay on an LTS.)
- **A Cloudflare account** — the free tier covers everything in these projects, including Workers AI (daily inference allowance is enough for study; expect to hit it only on heavy eval days).
- Git, and this repo cloned.

## One-time setup (Project 01)

```bash
git pull
cd projects/01-workers-agent-basics
npm install
npx wrangler login
```

`wrangler login` opens a browser for Cloudflare OAuth — your step, your account. It stores a local credential; nothing in this repo ever contains it.

## Daily loop

```bash
cd projects/01-workers-agent-basics
npx wrangler dev
```

Local dev server on `http://localhost:8787`. Verify the toolchain before writing any project code:

```bash
curl http://localhost:8787/health
# {"ok":true,"service":"ipa-01-agent-basics"}
```

Notes that will save you an hour each:

- **Workers AI runs remotely even in local dev** — the `[ai]` binding calls your account. That is why login comes first, and why a dead network looks like a model failure.
- Secrets never go in `wrangler.toml`. Local secrets live in `.dev.vars` (gitignored); deployed secrets go through `wrangler secret put`.
- Typecheck early and often: `npm run typecheck`. The edge runtime is not Node — if a Node API slips in, the types catch most of it before deploy does.
- Deploy when a project hits its done criteria: `npx wrangler deploy`. You get a `*.workers.dev` URL — that URL is the artifact the README asks for.

## Per-project layout

Each project folder is a self-contained Worker app:

```
projects/01-workers-agent-basics/
  BRIEF.md        — what to build, done criteria, talking points
  package.json    — wrangler + typescript as devDependencies (no global installs)
  wrangler.toml   — bindings for that project
  src/index.ts    — entry point; the build is yours
```

Projects 02–04 get their scaffolds when they start — same pattern, their own bindings (D1, Queues, Workflows) added to their `wrangler.toml`.
