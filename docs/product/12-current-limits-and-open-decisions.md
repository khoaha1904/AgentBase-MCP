# 12 — Current Limits and First-Version Scope

> Status: The MVP boundary is decided, implemented and audited offline after
> all 12 sections were synchronized.

## Short answer

The first version prioritizes Hub overview, Published-only query and
provenance. Without a Remote Hub, AgentBase uses Code Graph/workspace Scan only.

AgentBase has completed Capability 051 hardening on the Domain Crawler:
content redaction, query failure visibility, provider-contract qualification and
measurable ingest limits. Semantic search remains a future extension.

## Accepted first-version limits

- There is no backup/shared Local Draft; a machine failure can lose an
  unpublished draft.
- Reconciliation reduces missed relations but cannot guarantee discovery when
  repositories lack a shared identity.
- Refresh of one repository does not reread another repository.
- There is no remote lock for Initial Ingest; a duplicate is cancelled and
  recreated through Refresh.
- There is no remote auto-clone or global provider-account/region scan.
- The Hub has no fine-grained ACL; Hub access reads all Published knowledge.
- Structured IaC MVP supports Terraform/Terragrunt; SAM/CloudFormation is not
  supported yet.
- Hub query reads synchronized Published knowledge only; Local Draft is for
  review.
- Question runtime uses shared Hub documents; private state is rebuildable
  cache, not authority.
- The installer does not ask for Hub/token. `agentbase-hub` configures URL,
  target branch and token later; each profile keeps separate Published/Draft
  state.
- A completely empty remote is explicitly Bootstrapped directly to the target
  branch once with `index.md`, README and CI. All knowledge thereafter goes
  through a PR.

## High-level decisions

There are no open points. A canonical repository uses a stable Repository ID:
rename, move or clone with the same lineage remains the old repository; an
independent fork is a new repository; an ambiguous mirror/copy requires user
confirmation.

### Benchmark and local temporary storage

Benchmark data has its own ownership boundary in the sibling repository
`AgentBase-Benchmark`. That repository keeps pinned source checkouts, immutable
prompts, suites/expectations and time-series results. AgentBase-MCP keeps only
the benchmark engine/scorer and small fixtures needed for product verification.

Temporary benchmark, Code Graph and Hub-lifecycle workspaces always live in the
OS temporary directory or a workflow-owned state root, with a clear prefix and
cleanup after the run. No durable benchmark data lives in `tmp/`; only
`results/` in `AgentBase-Benchmark` is retained as evidence. `npm run demo` and
`npm run verify` do not depend on a Benchmark checkout or a model-backed run.

Expected probes use three levels: `critical`, `important` and `optional`.
Critical is the quality gate; the other two are reported separately and only
contribute a secondary weighted diagnostic. Scores do not replace lifecycle,
conformance or human review.

### Local AgentBase storage

MCP uses one local root: `AGENTBASE_HOME` when explicitly set by the operator,
otherwise `~/.agentbase`. Within that root, `config/` stores configuration and
credentials, `hubs/` stores checkouts with Draft/Published state, `state/` stores
recoverable proposals, sessions, transactions and enrichment, `cache/` stores
rebuildable Code Graph/query cache, and `tmp/` stores only short-lived
workspaces. Old XDG directories remain readable and are not silently deleted or
moved. A safe Hub runtime still in `/tmp` from an older version is copied once
into `state/`, preserving the old source.

## Deferred

- Capability 044 first migrates Codebase Memory source/build and leaves
  diagram-design inactive; it adds no UI or new tool.
- Source/build is verified on Linux x64; macOS arm64 in the company environment
  remains a required gate before Capability 044 can close.
- A remote repository reader is bounded, uses an MCP token for
  GitHub/GitHub Enterprise and does not clone/build a graph for a remote repo.
- The Published Hub graph is a rebuildable local, read-only view of published
  OKF; it is not a database or second source of truth.
- Query-based diagrams use diagram-design to create local HTML/SVG from
  user-selected knowledge; the diagram does not become Hub knowledge.
- Provider profiles beyond the current bounded AWS/SQS Domain Enrichment.
- Batch Refresh and mixed Init/Refresh.
- Azure/GCP profiles and semantic profile migration.

Semantic/vector search is considered only after lexical MiniSearch and graph
context have a relevance measurement proving they are insufficient; it is not
an automatic fallback.

Rich deterministic PR summaries, independent Init PRs, the same-Repository
Init/Refresh stack and existing-PR reconciliation are implemented; they are no
longer deferred scope.
