# AgentBase-MCP

AgentBase-MCP gives coding agents two complementary knowledge surfaces:

- a private repository Code Graph for source structure, symbols and call paths;
- an optional local AgentBase-Hub for reviewed Google OKF business, system and
  cross-repository knowledge.

The graph is disposable and never published. Hub knowledge is ordinary linked
Markdown and Git history. Local Draft is explicit review state; ordinary Hub
query reads only the synchronized Published commit.

## Install and verify

Requires an approved Node.js `>=24.12 <25` and the configured company npm
registry. The repository already carries the reviewed Code Graph bundle for
each released platform; ordinary users do not install Make, a compiler, zlib
development headers or run a separate provider command.

```bash
./install.sh
npm run demo
npm run verify
```

Interactive installation can register the current checkout as user-global
`agentbase` stdio MCP in Codex, Claude Code or both and installs the twelve
AgentBase product skills for every selected client. Repository-development
`speckit-*` skills are never installed. An exact rerun is a no-op; a conflicting
same-name MCP entry or skill fails before replacement. Hub token input is not
part of installation; the owner enters one shared token later through the
masked `abs hub connect` prompt outside Git. Non-interactive installation prepares
dependencies and activates the bundled native Code Graph provider but performs
no skill or client mutation. npm dependencies use only the configured HTTPS registry;
public registry fallback is rejected.

The released catalog has nine public workflows—Ask, Scan, Ingest, Refresh, Batch
Ingest, Domain Enrichment, focused Diagram, explicit Domain Site and Hub
lifecycle—plus three internal supporting skills. Ask naturally, select the skill in the client, invoke
`$agentbase-query` in Codex, or invoke `/agentbase-query` in Claude Code. These
are client syntaxes for the same canonical skill; AgentBase installs no
`abs-*` alias.

## Main entrypoints

Start the MCP server:

```bash
node src/cli.ts mcp
```

Collect a bounded observation without creating OKF:

```bash
node src/cli.ts observe /absolute/repository symbolName
```

Run exact owned Codebase Memory integration or explicit refresh:

```bash
npm run integration:codebase-memory -- /absolute/repository symbolName
npm run integration:codebase-memory -- /absolute/repository symbolName --refresh
```

The owner-facing terminal surface is intentionally small:

```bash
abs status
abs hub connect --url https://github.com/OWNER/HUB.git --branch main
abs hub sync
```

Detailed proposal, acceptance, query, publication and recovery lifecycle is
invoked by the installed skills/MCP or by developer-only compatibility routes;
it is not dumped into `abs --help`. AgentBase-MCP never merges a PR or creates
a GitHub repository. A Hub is not required for installation or Code Graph use.

Run an explicit model-backed OKF benchmark and finalize it deterministically:

```bash
AGENTBASE_BENCHMARK_ROOT=../AgentBase-Benchmark \
  npm run benchmark:okf -- run crawler-initial-ingest serverless-data-pipelines-demo
AGENTBASE_BENCHMARK_ROOT=../AgentBase-Benchmark \
  npm run benchmark:okf -- finalize crawler-initial-ingest <UTC-run-id> serverless-data-pipelines-demo
```

Benchmark source repositories, prompts, expectations and durable results live
in the sibling `AgentBase-Benchmark` repository. The runner and scorer remain
here; `npm run demo` and `npm run verify` do not require a benchmark checkout.

Real provider, GitHub and model operations remain opt-in. `npm run verify` is
offline and uses fakes, captured responses, disposable Git and fake GitHub HTTP.
Pinned Graph UI and diagram-design source are retained for later capabilities
but are not installed, started or exposed by this release.

## Documentation

Start at [`docs/README.md`](docs/README.md). It routes agents to the smallest
affected product decision or technical design instead of requiring the full
documentation set. Current behavior is tracked under `docs/design/`; numbered
`specs/` directories preserve change history.
