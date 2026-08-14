# Agent-driven OKF benchmarks

This directory measures whether a real host coding agent can investigate pinned
repositories and author useful Google OKF v0.2. Single runs exercise AgentBase
MCP graph/schema tools. Paired runs compare that complete assisted workflow with
an unassisted agent reading the authorized source directly.

```text
benchmark/
  prompts/<version>.md
  repos/<suite>/
    manifest.json
    expected/<repository>.json
  results/<suite>/<repository>/<UTC-run-id>/
    run.json
    prompt.md
    agent-events.jsonl
    agent-final.md
    okf/
    metrics.json
    report.md

  results/<suite>/<repository>/<UTC-pair-id>/
    pair.json
    mcp/<single-arm artifacts>
    direct/<single-arm artifacts>
    comparison.json
    report.md
```

The detailed Codebase Memory graph stays private and disposable. Each agent run
indexes once through the AgentBase MCP and may inspect repository source, docs
and Git history when graph evidence is incomplete. Source fixtures are pinned,
clean and read-only to the agent sandbox.

Run one explicit model-backed benchmark:

```bash
npm run benchmark:okf -- run aws-serverless aws-health-aware
```

The command prints the UTC run ID. Finalization is deterministic and model-free:

```bash
npm run benchmark:okf -- finalize aws-serverless <UTC-run-id> aws-health-aware
```

Run one explicit two-arm context comparison:

```bash
npm run benchmark:okf -- pair aws-serverless aws-health-aware
npm run benchmark:okf -- compare aws-serverless <UTC-pair-id> aws-health-aware
```

`pair` runs MCP first and direct-source second with the same pinned fixture,
model, reasoning effort, expectation and semantic goal. The direct arm has no
AgentBase MCP configuration. `compare` reports existing semantic metrics,
tokens and elapsed time side by side. Deltas are MCP minus direct; no overall
winner is generated.

Expectations do not prescribe prose or agent slugs. Bounded identity terms and
evidence match concept instances; the scorer then evaluates concrete schema
choices, required semantic metadata, source provenance and directed concept
relationships. Reports keep separate precision, recall,
metadata, provenance, relationship and OKF-conformance metrics so shallow valid
Markdown cannot appear perfect.

Token values come from the final completed-turn event emitted by the pinned
Codex CLI. Missing fields stay unavailable. MCP and shell-command counts are
direct observations, not complete telemetry for every source file or byte read.

`npm run verify` uses a fake Codex process and never invokes a model. Real runs
use existing host Codex authentication; AgentBase does not read or persist it.
