# Research — Initial Ingest discovery quality

## R01 — Use the pinned provider, not a second scanner

**Decision**: After indexing, MCP runs one fixed private Codebase Memory `0.10.8`
baseline—status, terminal/paged coverage and explicit architecture aspects—plus
one bounded secret-safe file census.

**Rationale**: The provider already found routes, entrypoints and boundaries
missed by current OKF guidance. GitNexus supports broad-extract/select-later;
Potpie supports explicit lane coverage. Neither justifies importing its graph or
ontology.

**Alternatives considered**: New public scanner, full AST pass, raw graph dump.
All duplicate the provider, expand tools and risk a second code graph.

## R02 — MCP owns coverage; Agent owns semantics

**Decision**: MCP groups deterministic signals, assigns lanes/fixed P0 and
validates acknowledgement; the Agent decides meaning, disposition and outputs.

**Rationale**: Structural grouping is stable enough for coverage. Concept,
embedded knowledge and Questions require repository semantics.

**Alternatives considered**: MCP auto-concept generation and model-only freeform
discovery. The first overfits; the second permits silent omissions.

## R03 — One connection-scoped discovery owner

**Decision**: Add one private discovery session injected into the existing MCP
server, graph gateway and schema/Hub calls.

**Rationale**: Seed state must observe graph calls and later validate authoring
on the same connection. A small owner avoids globals and a workflow database.

**Alternatives considered**: Re-send raw Seed through tool arguments, persist a
global ledger, add a public discovery tool. Each increases trust surface or API.

## R04 — Receipt identity replaces mutable guidance replay

**Decision**: Guidance freezes a digest-bound compact Receipt; new-mode Prepare
accepts its ID and atomically creates one existing authoring session. Exact
retry returns that session; no separate mutable receipt state machine exists.

**Rationale**: MCP can prove the proposal came from the validated Inventory and
support safe resume without retaining raw source/graph state.

**Alternatives considered**: Trust the Agent to resend identical guidance, or
persist raw graph/inventory. The former cannot prove coverage; the latter makes
private detail durable and heavy.

## R05 — Resolve remote default without changing the working tree

**Decision**: Resolve default branch through the configured GitHub/GHE API,
fetch and verify the exact commit over token-only HTTPS into a profile-scoped
AgentBase-private bare mirror, then use an isolated detached worktree when the
current checkout is not a clean exact match.

**Rationale**: It preserves in-progress feature work, produces remotely
verifiable evidence and avoids mutating user refs or inheriting local filters,
SSH credentials, hooks, submodules or LFS behavior.

**Alternatives considered**: Checkout/stash/restore user worktrees, accept dirty
digest for publication, or maintain a general clone service. They risk data,
unverifiable evidence or unnecessary infrastructure.

## R06 — Strict Initial Ingest cutover, shared source authority

**Decision**: New-mode Prepare requires a receipt in the capability 046 release.
Refresh retains its change-first inputs but shares the same exact remote-default
SourceSnapshot authority. Update released skills atomically with MCP.

**Rationale**: No concept has been published as an immutable product contract,
and dual Initial Ingest paths would preserve the exact omission bug. Different
publication source rules for Init and Refresh would still admit abandoned
feature knowledge.

**Alternatives considered**: Legacy fallback or a feature flag. Both double the
qualification surface and allow bypassing coverage.

## R07 — Logs are summaries, Git remains history

**Decision**: Capability 046 materializes only a successful Repository Init
entry with the existing validated `log.md` grammar. Domain logs remain owned by
Enrichment/cross-repository/explicit Domain correction workflows.

**Rationale**: Humans can see knowledge evolution without introducing an event
store or copying raw execution detail into OKF.

**Alternatives considered**: Per-concept history, one global log, raw run logs.
All add noise and duplicate Git/PR history.

## R08 — Measure before optimizing model cost

**Decision**: Group repeated signals, bound reads and stop on disposition
completion, but set no numeric token/time budget before the first real run.

**Rationale**: Premature hard budgets could reproduce the sparse-discovery miss.
The released skill benchmark will expose real elapsed time and token use.

**Alternatives considered**: Fixed file counts, concept quotas or exhaustive
reading. None represents useful coverage reliably across repository shapes.

## R09 — Reuse existing Questions and add only a private plan

**Decision**: Inventory carries a normalized QuestionPlan that targets the
existing SharedQuestion kinds and candidate-evidence reference; Finalize renders
from the immutable Receipt.

**Rationale**: The core already models conflict, missing evidence, relation and
identity uncertainty. A second question system or caller-authored final text
would duplicate governance and weaken traceability.

## R10 — Honest pagination and bounded overflow

**Decision**: A non-terminal page cannot establish absence. P0 checks reach a
terminal result or become limited; P0-hiding limitations and P0 overflow block
readiness, while P1/P2 overflow is grouped and disclosed.

**Rationale**: Silent truncation recreates the original defect. Bounded grouping
keeps context manageable without pretending full coverage.

## R11 — Do not import reference-product architecture

**Decision**: Borrow GitNexus's broad-extract/select-later principle and
Potpie's explicit coverage thinking, but add no graph database, ontology,
process graph, parallel-agent orchestration or UI to this capability.

**Rationale**: AgentBase's product value is compact, source-backed, reviewable
OKF. Those systems solve different retrieval/execution problems and would expand
the MVP without closing the measured Init omission.
