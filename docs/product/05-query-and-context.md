# 05 — Query and context

> Status: Published-only Hub query, bounded lexical retrieval, Domain/relation
> context and explicit source degradation are implemented.

## Outcome

The Agent selects the Hub, local source/Code Graph or both. The user does not
need to choose a query mode.

| Question | Preferred source |
|---|---|
| What exists, why and how is it connected? | Published Hub |
| How does the current code implement it? | Local source and Code Graph |
| Connect system overview with implementation | Hub, then selective source |

Query is **snapshot-default**: when Published knowledge is sufficient, the
Agent stops. Source is read only when the user requests current implementation,
debug/impact work requires exact code or the Hub cannot support a safe answer.

## Published authority

Ordinary search/read uses one exact synchronized Published commit and never
mixes Local Draft or proposal content. Search discovers bounded relevant
concepts and context; exact read returns the full selected Markdown knowledge.
Portable links, accepted relations and Flows may help navigation but never
authorize an inferred relationship.

Domain scope includes its known concepts and directly related boundary
endpoints without silently expanding into another Domain. Returned context
keeps direction, evidence, Questions and visible omissions.

## Source use and degradation

Code Graph access is limited to authorized local/workspace repositories. A
remote source reference may be read only through an explicit MCP-managed
authority when that capability exists; AgentBase never bypasses the boundary
with ambient credentials, an unrelated client or automatic clone.

If source is unavailable, the Agent returns the Hub-known portion and says what
could not be verified. A snapshot is never described as current source. Existing
conflicts and Questions remain visible even when snapshot-default avoids a new
source read.

Malformed Published knowledge fails visibly. Bounded omission must identify
what was omitted; AgentBase must not present an incomplete result as complete.

## Trust boundary

Hub access grants read access to all Published knowledge in that Hub. The
current product has no Domain-, concept- or field-level ACL. Source access
remains independent and does not follow automatically from Hub access.

Search implementation and rebuildable indexes are not knowledge authority.
Semantic/vector search is considered only after measured evidence shows the
current lexical plus structured-context behavior is insufficient.

## Non-goals

- A query language or separate query-time knowledge store.
- Automatic relation inference during read.
- Querying Local Draft as if it were Published.
- Automatic repository clone or provider lookup.
- Hidden fallback that suppresses access, parsing or bound failures.

## Downstream Capability Contract

- [Query routing](../capabilities/10-query-routing/README.md)
