# 10.01 — Source selection

> Status: Host skill routing; MCP has no reasoning or combined-answer tool.

| Intent | Start with | Add source when |
| --- | --- | --- |
| Purpose, ownership, relationships, constraints, known value | Published Hub | Current implementation verification is requested or necessary. |
| Exact implementation, debugging, impact | Authorized host source read/search | Hub intent or cross-repository constraints are needed. |
| Why code exists | Hub intent | Check current implementation when required. |

## Snapshot-default stopping rule

Stop when the snapshot answers sufficiently. Age, conflict, source availability
or a desire for completeness does not authorize another read. Current/exact-code
requests may use authorized source directly when no snapshot exists.

## Hub and source routes

Use bounded search then exact Markdown read, following links only for a concrete
gap. Domain ambiguity asks for scope only when it changes the answer. Reads use
remoteBase, never Draft or a fetch. Source uses an explicit local root with exact
identity/path/span; Hub references grant no clone/workspace/provider authority.

## Failure and degradation

Return supported Hub/source evidence when the other is unavailable; retain both
provenances and label inference/conflict. Neither access failure nor a search
miss creates a Question, Refresh or write-back. [Runtime requirements](07-runtime-requirements.md)
own AB-QUERY rules; [access](03-source-access-and-degradation.md) owns degradation.
