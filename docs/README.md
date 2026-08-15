# AgentBase-MCP documentation

This directory contains only current product truth. It is intentionally small
and progressively loaded; do not read every contract for every task.

## Session route

At session start, read only:

1. `AGENTS.md` for repository rules;
2. this file for current state and document routing;
3. `specs/CURRENT.md` for the active or most recently completed capability;
4. Git status.

Then load the smallest document set matching the task:

| Question or change | Read next |
|---|---|
| Product outcome, naming, scope or authority | `docs/PRODUCT.md` |
| Source ownership, dependencies or runtime structure | `docs/ARCHITECTURE.md` |
| Repository workflow and verification | `docs/contracts/foundation.md` |
| Codebase Memory, graph lifecycle, refresh or MCP tools | `docs/contracts/code-graph.md` |
| Observations, OKF proposals or schema catalog | `docs/contracts/okf.md` |
| Local Hub, GitHub publication or synchronization | `docs/contracts/hub.md` |
| Installer, credential or client registration | `docs/contracts/installation.md` |
| Agent-authored OKF benchmark | `docs/contracts/benchmark.md` |

Read an active numbered artifact under `specs/` only when implementing that
capability. Completed numbered artifacts are historical change records, not
current product authority.

## Authority order

When sources disagree, separate intended behavior from observed behavior:

1. the latest user decision controls the requested change;
2. the relevant tracked contract controls currently accepted behavior;
3. an approved active capability controls its not-yet-accepted change scope;
4. implementation and focused tests prove what the checkout actually does;
5. completed capability artifacts and Git history explain history only.

`docs/.archived/` is a local, Git-ignored snapshot of superseded documentation.
It may explain history but must never override tracked current docs. Git history
is the portable archive.

## Current checkpoint

- Active capability: `014-benchmark-authoring-quality`.
- Most recent completed capability: `013-benchmark-context-ab`.
- Canonical offline verification was green with 283 tests before capability 014.
- Real pair `aws-health-aware/2026-08-14T181910Z` compares the current MCP
  workflow with direct source reading on the same pinned model and task.
- MCP was 50 seconds faster and used 36% fewer output tokens, but total input
  differed by only 0.2% and MCP used 1.2% more uncached input. It does not prove
  context-token savings.
- MCP semantic quality was better than direct, but reached only 60% concept
  recall, 40% schema recall, 25% metadata, 29% provenance and 0% expected
  relationships. Both bundles failed OKF conformance.

Capability 014 is complete. The scorer uses `reviewable`/`invalid`, treats gold
expectations as non-exhaustive and shares one bounded relationship validator
with MCP. The unchanged v3 workflow produced reviewable MCP drafts on Health
Aware and shopping cart; missing coverage remains visible for humans. MCP used
210,649 and 466,574 more input tokens than direct and was slower on both pairs,
so quality is ready for review but context efficiency is not yet good. Question
management and external evidence enrichment remain future direction.

## Superseded assumptions

Do not revive these older ideas from historical artifacts:

- `agentbase-next`, lowercase legacy repositories and `knowledger-hub` are not
  product identities. The products are AgentBase-MCP and AgentBase-Hub.
- AgentBase-Hub is not a temporary proposal checkout or remote-only store. Its
  owned local `main` is active knowledge; remote publication is later and
  explicit.
- Installation does not select or create a Hub. Hub setup is lazy and Code
  Graph works with no Hub.
- OKF is not a custom single report or a fixed universal taxonomy. AgentBase
  targets Google OKF v0.2 bundles with an open-world concrete schema catalog.
- Users do not supply or globally install the graph binary. AgentBase owns the
  exact package-private Codebase Memory version.
- One-shot provider calls are not the normal path. One scoped session per
  evidence round is the default; one-shot is explicit rollback.
- An unchanged accepted graph does not need re-indexing. Exact freshness reuse
  skips indexing but still performs queries and safety checks.
- Benchmark OKF must be authored by a real explicit host agent; manually written
  bundles and observation-only runs are not equivalent baselines.

## Documentation maintenance

Update current truth once, in the narrowest document above. Do not add a new
handoff, roadmap, ADR or evidence diary that repeats it. A user-visible behavior
change belongs in one numbered capability and updates the affected current
contract when accepted. Keep stable `AB-*` requirement IDs for traceability.
