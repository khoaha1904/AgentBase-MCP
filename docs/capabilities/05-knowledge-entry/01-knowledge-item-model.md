# 05.01 — Knowledge item and proposal identities

> Status: Technical design draft.

## Decision

AgentBase does not create a universal `KnowledgeItem` record or new database.
Each knowledge type keeps its natural OKF/Hub identity; the proposal commit is
the review and publication unit.

| Content | Technical identity | Publication |
|---|---|---|
| Concept | normalized OKF path without `.md` | proposal changes that file |
| Structured claim | stable claim ID in the concept | proposal changes the concept |
| Relation | source concept + predicate + target identity | proposal contains the edge |
| Question | stable ID + `questions/<id>.md` | proposal changes shared document |
| Evidence | source ID in concept + repository URI | proposal contains evidence |
| Navigation index | exact path/line dependency | proposal contains navigation change |
| Proposal/change set | proposal ID + accepted Git commit + diff digest | publication unit |

Prose has no identity merely to support item-level state; it belongs to its
concept document. Do not add IDs to every paragraph or YAML field.

## Invariants

- A proposal binds exact base, source repository, evidence digest, tree/diff
  digest and schema catalog.
- The user selects/removes items before Accept; final validation locks the exact
  reviewed tree.
- Accept creates exactly one immutable commit on the local Hub `main`.
- An item may carry provenance/semantic identity without its own publication
  state.
- The Question lifecycle is independent of publication; see section 07.

## Baseline reuse

Keep `ProposalMetadata`, `LocalProposal`, commit trailers, OKF concept paths and
stable observed-value IDs. The Question-document clean cutover belongs to
section 07; publication remains the proposal commit and needs no parallel
database.
