# 11.03 — Dependency validation

> Status: Core structural validation is implemented; the Batch membership workflow is designed.

## Outcome

Finalize blocks a structurally broken proposal but does not require complete
knowledge. AI edits the editable draft and decides when to ask the user; MCP
Finalize runs only deterministic validation over the exact supplied bytes/evidence.

## Hard dependencies

A missing hard dependency makes Finalize fail:

- a relation target or Flow endpoint does not exist in the Published baseline or final draft;
- a required Markdown link does not resolve to its corresponding target;
- a Question/evidence reference is unknown, ambiguous or outside proposal authority;
- removal leaves a direct relation, Flow step, Question reference or governed navigation dangling;
- an index points to a missing file, duplicates a target or modifies protected lines;
- a proposal modifies protected bytes, exceeds source ownership or has
  correction/removal intent missing a required reason/evidence/replacement.

MCP returns exact bounded failures. It does not re-add an item, delete a relation,
create a Question or modify the bundle to pass validation automatically.

## Incomplete knowledge is allowed

The following are not hard dependencies while the structure remains valid:

- an unconfirmed cross-repository relation;
- an unobserved provider/account/region/ARN;
- partial source coverage or unavailable optional detail;
- a remaining conflict, Open Question or Limitation;
- insufficient evidence to create an optional concept/relation.

They are retained as an attributed Question/Limitation or simply remain
unauthored. Finalize does not turn completeness into a gate.

## AI and MCP responsibilities

```text
AI edits the authoring draft
        ↓
MCP Finalize validates exact structure and evidence
        ↓ deterministic failures
AI repairs mechanical issues or asks one bounded owner question
        ↓
MCP Finalize runs again
```

- AI repairs a mechanical error with one clear outcome: a dangling index, a
  relation removed with its target or a Question reference that must be removed
  with an omitted item.
- AI asks the user when multiple business outcomes are valid: whether to retain a
  relation as an external dependency, whether a repository really leaves the
  batch/scope or whether competing evidence changes meaning.
- If no decision is required for a valid proposal, AI retains a Question/Limitation
  instead of interrupting the flow merely to make data more complete.
- Finalize does not invoke a model, reason automatically or retry automatically.

## Removing one repository from a batch

Before execution, the user can freely edit confirmed membership. After the draft exists:

1. the user confirms removing a repository from the batch;
2. AI removes that repository's contributions from the editable workspace;
3. remaining relation/Flow/Question/index entries are checked against the
   Published baseline and final batch membership;
4. mechanical dangling references are repaired; only ambiguous business dependencies ask the user;
5. MCP Finalizes the entire bundle again;
6. only the final atomic membership becomes a proposal, Accept and pull request.

If the target concept is already Published, the relation can remain with correct
provenance. If the target exists only in the removed repository, the relation
must be removed or the batch must retain the repository; a placeholder concept
cannot be created to pass the gate.

## Publication dependency

A Finalize dependency is a content dependency inside the proposal. Before a pull
request, MCP also checks publication dependencies between accepted proposals:

- independent Repository Init starts from Published `main`;
- Refresh depends on the previous proposal for the same Repository;
- Local Draft storage order does not create dependencies between different repositories;
- a selected proposal cannot be split into an item subset during Publish.

## Current implementation gap

Single-repository proposals already validate relationship/Flow targets, links,
Question evidence, protected bytes, additive indexes and removal intent. Batch
Ingest and AI-guided membership removal are not yet implemented; their
implementation needs no dependency-graph database or solver.
