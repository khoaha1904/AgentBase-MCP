# AgentBase-MCP

AgentBase-MCP gives coding agents two complementary knowledge surfaces:

- a private repository Code Graph for source structure, symbols and call paths;
- an optional local AgentBase-Hub for reviewed Google OKF business, system and
  cross-repository knowledge.

The graph is disposable and never published. Hub knowledge is ordinary linked
Markdown and Git history. Local acceptance is explicit and immediately
queryable; remote publication is a separate reviewed action.

## Install and verify

Requires Node.js `>=24.12 <25`.

```bash
./install.sh
npm run demo
npm run verify
```

Interactive installation can register the current checkout as user-global
`agentbase` stdio MCP in Codex, Claude Code or both and installs the seven
AgentBase product skills for every selected client. Repository-development
`speckit-*` skills are never installed. An exact rerun is a no-op; a conflicting
same-name MCP entry or skill fails before replacement. Optional token input is
masked and stored outside Git with private permissions; non-interactive
installation only prepares dependencies.

## Main entrypoints

Start the MCP server:

```bash
node src/cli.ts mcp
```

Collect a bounded observation without creating OKF:

```bash
node src/cli.ts observe /absolute/repository symbolName
```

Run exact managed Codebase Memory integration or explicit refresh:

```bash
npm run integration:codebase-memory -- /absolute/repository symbolName
npm run integration:codebase-memory -- /absolute/repository symbolName --refresh
```

Use `node src/cli.ts okf ...` for repository proposals and
`node src/cli.ts okf hub ...` for lazy Hub setup, local acceptance, query,
publication and synchronization. AgentBase-MCP never merges a PR or creates a
GitHub repository. A Hub is not required for installation or Code Graph use.

Run an explicit model-backed OKF benchmark and finalize it deterministically:

```bash
npm run benchmark:okf -- run aws-serverless aws-health-aware
npm run benchmark:okf -- finalize aws-serverless <UTC-run-id> aws-health-aware
```

Real provider, GitHub and model operations remain opt-in. `npm run verify` is
offline and uses fakes, captured responses, disposable Git and fake GitHub HTTP.

## Documentation

Start at [`docs/README.md`](docs/README.md). It routes agents to the smallest
affected product decision or technical design instead of requiring the full
documentation set. Current behavior is tracked under `docs/design/`; numbered
`specs/` directories preserve change history.
