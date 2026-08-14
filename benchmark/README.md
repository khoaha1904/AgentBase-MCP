# Agent-driven OKF benchmarks

This directory measures whether a real host coding agent can use AgentBase MCP
graph and schema tools to investigate pinned repositories and author useful
Google OKF v0.2. It does not treat manually authored Markdown as an agent run.

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

Expectations do not prescribe prose or agent slugs. Bounded identity terms and
evidence match concept instances; the scorer then evaluates concrete schema
choices, required semantic metadata, source provenance and directed concept
relationships. Reports keep separate precision, recall,
metadata, provenance, relationship and OKF-conformance metrics so shallow valid
Markdown cannot appear perfect.

`npm run verify` uses a fake Codex process and never invokes a model. Real runs
use existing host Codex authentication; AgentBase does not read or persist it.
