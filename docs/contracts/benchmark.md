# Agent-driven OKF benchmark contract

The benchmark measures whether a real explicit host coding agent can use
AgentBase MCP graph/schema tools to investigate pinned repositories and author
useful Google OKF v0.2. Manual bundles and observation-only runs are not agent
benchmarks.

- **AB-BENCH-001** — Comparable runs pin source commits, expectations, schema
  catalog, prompt, agent executable/version, model and reasoning effort.
- **AB-BENCH-002** — A model-backed run is explicit opt-in and starts one bounded
  non-interactive host-agent process per repository in an isolated result
  workspace with AgentBase MCP required. AgentBase stores no model credentials
  and contains no model SDK.
- **AB-BENCH-003** — The agent indexes once, uses graph and schema list/select/
  read/validate tools, may inspect authorized source/docs/Git, writes only sparse
  OKF and records limitations instead of inventing evidence.
- **AB-BENCH-004** — Expectations define semantic concept identity, concrete
  schema, required metadata/evidence paths and directed relationships without
  prescribing prose, paths or slugs.
- **AB-BENCH-005** — Finalization reports OKF conformance, concept/schema
  precision and recall, metadata completeness, provenance, relationship coverage
  and unexpected output separately.
- **AB-BENCH-006** — Each run starts/ends on the same clean pinned source;
  missing output, agent/MCP failure, timeout, malformed artifacts or source drift
  fails visibly and cannot produce a passing result.
- **AB-BENCH-007** — Results retain exact prompt/configuration, JSONL events,
  final message, OKF tree, metrics and report under repository plus UTC run ID.
- **AB-BENCH-008** — Canonical verification uses a fake executable and
  deterministic scoring offline; real model execution is always separate.
- **AB-BENCH-009** — A context comparison binds exactly one MCP-assisted arm
  and one direct-source arm to the same fixture commit, expectation, catalog,
  agent version, model, reasoning effort and semantic authoring goal.
- **AB-BENCH-010** — The direct arm receives no AgentBase MCP configuration and
  investigates only the authorized source, documentation and Git history with
  ordinary host-agent capabilities.
- **AB-BENCH-011** — The MCP arm retains the graph, schema, validation and
  bounded source-investigation lifecycle required by AB-BENCH-002/003.
- **AB-BENCH-012** — Every arm records its prompt, trace, output, status,
  duration, agent identity, fixture identity and safe AgentBase source identity;
  pair artifacts keep both arms under one UTC comparison identity.
- **AB-BENCH-013** — Usage preserves the final completed-turn input, cached
  input, cache-write input, uncached input, output and reasoning-output token
  values. Missing values remain unavailable rather than becoming zero.
- **AB-BENCH-014** — Investigation activity reports directly observed MCP and
  shell-command events. It does not claim complete source-file or byte volume
  without deterministic telemetry.
- **AB-BENCH-015** — Pair reports keep semantic quality and efficiency in
  separate sections, use MCP-minus-direct deltas only for comparable values and
  never emit an automatic overall winner.
- **AB-BENCH-016** — Either arm may fail, time out, drift source state or emit
  malformed artifacts without losing already available evidence. Ordinary
  failures continue to the other arm; source drift blocks a contaminated next
  execution. The pair remains explicitly incomplete.
- **AB-BENCH-017** — Paired lifecycle, isolation, measurement and recovery are
  covered offline with a fake executable. A real pair remains an explicit
  opt-in product-evidence command.

## Context A/B interpretation

`pair` runs MCP first and direct-source second, sequentially, so concurrent
resource contention does not distort elapsed time. `compare` finalizes both
with the same semantic expectation and writes raw per-arm metrics plus
MCP-minus-direct efficiency deltas.

This compares the complete AgentBase-assisted workflow with an unassisted
source baseline. It does not isolate graph retrieval from schema guidance.
Codex token events are the primary context-cost evidence; command counts are
observations only and cannot prove every file or byte read.

## Current baseline

Suite `aws-serverless` pins two repositories with catalog `3.0.0`, prompt
`okf-author-v1`, Codex CLI `0.147.0`, model `gpt-5.6-terra` and medium effort.

The completed real run `aws-health-aware/2026-08-14T113246Z` found all five
expected concepts but added one repository concept. It scored 83% concept/schema
precision, 100% concept/schema recall, 100% metadata, 86% provenance and 100%
expected relationships. It is intentionally non-passing because root
`index.md` included prose outside the accepted heading/link grammar.

`aws-serverless-shopping-cart` has not yet received a current model-backed
authoring run. Earlier `2026-08-14T091540Z` data is observation smoke evidence,
not a comparable agent baseline.

## First real context A/B evidence

Pair `aws-health-aware/2026-08-14T181910Z` is complete evidence for the pinned
fixture, Codex CLI `0.147.0`, model `gpt-5.6-terra` and medium effort:

| Measure | MCP | Direct | MCP minus direct |
|---|---:|---:|---:|
| Elapsed | 155,167 ms | 205,359 ms | -50,192 ms |
| Input tokens | 674,260 | 675,861 | -1,601 |
| Cached input | 615,424 | 617,728 | -2,304 |
| Uncached input | 58,836 | 58,133 | +703 |
| Output tokens | 6,023 | 9,359 | -3,336 |
| Reasoning output | 895 | 2,153 | -1,258 |
| Concept precision / recall | 60% / 60% | 22% / 40% | — |
| Schema precision / recall | 40% / 40% | 0% / 0% | — |
| Metadata completeness | 25% | 0% | — |
| Provenance coverage | 29% | 0% | — |
| Expected relationship coverage | 0% | 100% | — |
| OKF conformance | failed | failed | — |

MCP was 50 seconds (24%) faster and emitted 36% fewer output tokens, but total
input differed by only 0.2% and MCP used 1.2% more uncached input. This run
therefore does **not** establish context-token savings. MCP produced materially
better concept, schema, metadata and provenance scores than the direct baseline,
but 60% concept recall, 0% expected relationships and failed conformance are not
good enough for a trustworthy authoring workflow.

The direct arm's 100% relationship coverage is conditional on its two matched
concepts and sits beside seven unexpected concepts and eight unexpected
relationships; it is not evidence of complete relationship understanding. The
next bounded improvement should address strict root-index conformance, expected
concept identity/schema adherence and required relationship guidance, then
repeat paired runs before any efficiency claim.
