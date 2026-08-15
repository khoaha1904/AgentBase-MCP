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

Both v5 prompts share the same general authoring contract without receiving the
hidden expectation. They author one canonical entity graph, group ordinary
routes into API surfaces, keep implementation-only handlers inside useful
parents and surface uncertainty as limitations. The MCP arm additionally uses
graph tools, one batch-selected schema-guidance call and bounded whole-bundle
validation; the direct arm investigates source without them. Prompt behavior
is immutable: v1-v4 files and recorded results remain historical.

Expectations do not prescribe prose or agent slugs. Bounded identity terms and
evidence match concept instances; the scorer then evaluates concrete schema
choices, required semantic metadata, source provenance and directed concept
relationships. Expectations are non-exhaustive probes: recognized items are
classified as confirmed or contradicted, valid output outside the reference is
unjudged, and absent probes are missing reference knowledge. Reference concept,
metadata, provenance and relationship coverage remain diagnostics; they do not
claim the reference is a complete repository inventory.

Each arm declares an authoring assessment of `reviewable` or `invalid`.
Lifecycle/conformance failures, empty output, unsafe provenance, known schema
contradictions and malformed or broken relationships are invalid. Missing
concepts, metadata, evidence or relationships do not invalidate
an otherwise evidence-backed draft, even below 80%; they remain visible for
human review and later enrichment.

V5 separately reports `ownerReview.status` as `useful_for_owner_review` or
`needs_revision`. This assessment catches duplicate identities, repository-tree
copies, thin Markdown bodies and route/handler fragmentation. It does not turn
reference coverage, concept count, token use or elapsed time into quality gates.
Reference probe keys remain scorer-only and production Hub proposals reject
benchmark-only metadata.

Deterministic source-path checks prove that a cited path is present in the
curated probe, not that every authored sentence is semantically supported.
Reports state this limitation and require human review.

Token values come from the final completed-turn event emitted by the pinned
Codex CLI. Missing fields stay unavailable. MCP/shell counts and serialized
authoring-tool argument/result bytes are direct trace observations, not complete
telemetry for every source file or model-context byte.

`npm run verify` uses a fake Codex process and never invokes a model. Real runs
use existing host Codex authentication; AgentBase does not read or persist it.
