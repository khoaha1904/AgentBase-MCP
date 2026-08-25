# Research — Initial Ingest discovery quality

## R01 — Use the pinned provider, not a second scanner

**Decision**: Capture more of Codebase Memory `0.10.8` architecture/index output
and add only a bounded file census.

**Rationale**: The provider already found routes, entrypoints and boundaries
missed by current OKF guidance. GitNexus supports broad-extract/select-later;
Potpie supports explicit lane coverage. Neither justifies importing its graph or
ontology.

**Alternatives considered**: New public scanner, full AST pass, raw graph dump.
All duplicate the provider, expand tools and risk a second code graph.

## R02 — Keep semantic decisions with the Agent

**Decision**: MCP groups deterministic signals and validates acknowledgement;
the Agent decides meaning and disposition.

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
accepts its ID. Persist it only after Prepare.

**Rationale**: MCP can prove the proposal came from the validated Inventory and
support safe resume without retaining raw source/graph state.

**Alternatives considered**: Trust the Agent to resend identical guidance, or
persist raw graph/inventory. The former cannot prove coverage; the latter makes
private detail durable and heavy.

## R05 — Resolve remote default without changing the working tree

**Decision**: Resolve default branch through the configured GitHub/GHE API,
fetch the exact commit into an AgentBase namespaced ref and use an isolated
detached worktree when current checkout is not a clean exact match.

**Rationale**: It preserves in-progress feature work, produces remotely
verifiable evidence and reuses existing safe Git/askpass/worktree primitives.

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

**Decision**: Materialize only successful Repository/Domain activity entries
with the existing validated `log.md` grammar.

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
