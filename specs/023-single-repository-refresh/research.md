# Research: Single-Repository Refresh

## Decision: Normal Refresh is the only MVP mode

**Rationale**: Changed source plus known gaps plus one bounded discovery pass is
fast, cumulative and stable.

**Alternatives considered**: Full rescan is slow and completeness-oriented;
diff-only Refresh misses known Questions and unchanged-but-incomplete knowledge.

## Decision: Use active local main as the baseline

**Rationale**: Active local `main` already contains the Published base plus
accepted-local unpublished commits. This preserves batched local work without
trusting an unreviewed proposal.

**Alternatives considered**: Remote Published Hub only loses accepted local
work; arbitrary newest proposal can select unrelated or stale state.

## Decision: Destructive changes require typed intent

**Rationale**: An omitted file or missing graph hit is ambiguous. Explicit
remove/supersede/retract intent can carry evidence and appear clearly in review.

**Alternatives considered**: Whole-subject omission deletion and automatic
stale expiry both violate cumulative knowledge.

## Decision: No-change does not create a proposal

**Rationale**: A no-op is useful completion but another proposal/commit adds
noise and complicates later batch publication.

## Decision: Generalize source-span validation

**Rationale**: Updated citations can be wrong just like new citations. The
current authorized checkout is available during Finalize.

## Baseline impact

The implementation is broad but incremental. Existing identity, continuity,
session, proposal, validation and inspection code is retained. The legacy
whole-subject omission deletion rule is intentionally replaced. No Hub content
migration is required because no AgentBase concepts are Published.
