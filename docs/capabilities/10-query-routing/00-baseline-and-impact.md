# 10.00 — Baseline and impact

> Status: The Published-only query contract is implemented by capability 038.

## Outcome

The Agent selects the Hub, local source/Code Graph or both based on the question.
MCP keeps its read surfaces small and deterministic; it does not add a reasoning
router or an “answer everything” tool.

## Reusable baseline

- Hub search and concept read use the exact Published commit with bounds and
  Domain/type scope.
- Concept Markdown already contains relationships, snapshots, provenance and
  Questions; no separate query action is needed for each data type.
- The Gateway exposes Code Graph/search/snippet for an authorized local repository
  binding. Source reading does not belong to the Hub query owner.
- Hub Questions are shared Markdown with separate governance.
- Remote GitHub credentials already belong to MCP publication/setup, but there is
  no remote repository file reader yet.

## Gaps from the high-level design

1. Search currently matches only one intact substring, does not use canonical
   relation/Flow text and can return an empty body excerpt after whitespace collapse.
2. Exact Domain scope uses only `part-of`, so concepts associated with a Domain
   through an `implemented-in` or `declared-by` Repository are ineligible for search.
3. There is no unified response-composition contract for conflicts, Questions
   and Maintainer Guidance.
4. Snapshot age and the local Repository freshness report exist, but freshness
   markers in ordinary search/read responses are deferred; scheduled CI already
   uses this report.
5. Explicit current-source reads reuse graph/file tools. A bounded remote-reference
   reader is the first post-phase query priority, not an MVP blocker.

## Minimal direction

- Keep routing in host skill/agent policy; MCP does not reason for the Agent.
- Use snapshot-default: stop when the snapshot/Hub answers sufficiently; source
  availability, age or conflict does not trigger a source read automatically.
- Keep exactly two public query primitives: search and exact Markdown read.
- Treat OKF as a structured Markdown knowledge base: use the official `description`,
  tags, heading/body, portable links and AgentBase relation extension. Discovery
  follows search-then-read; do not add a persisted summary/index.
- Use established in-memory full-text relevance and heading-aware section records
  instead of maintaining a custom scoring formula; exact address remains a pre-pass.
- Distinguish canonical Domain membership from Repository association and direct
  boundary inclusion in scoped search.
- Do not require source credentials for Hub query; source failure does not erase
  Hub knowledge or a snapshot.
- Do not resolve conflicts, Refresh or write back automatically in the query path.

## Impact checkpoint

| Boundary | Impact | Reason |
|---|---|---|
| Host source selection | Reuse/documentation | Existing Hub and graph tools already separate responsibilities correctly. |
| Search/ranking | Contained + reviewed dependency | Reuse transient Hub graph/Markdown; standard lexical scorer replaces custom relevance and returns best section. |
| Domain query context | Contained change | Reuse accepted structural relations without rewriting Hub membership. |
| Published + Local Draft overlay | Rejected for MVP | Draft belongs to review/PR, not ordinary query. |
| Conflict/Question composition | Contained after Part 07 | The Shared Question runtime does not yet exist. |
| Observed/current values | Reuse | Part 08 snapshot query + normal graph/file reads. |
| Remote repository reference read | First post-phase capability | Shared stable cross-repository source through an MCP token; deferred only from the MVP. |
| Freshness presentation/CI | Contained follow-up | Reuse implemented Repository report; ordinary response marks and scheduling remain. |

There is no broad change or near rewrite. The query core, exact Published anchor
and two public primitives are retained; capability 049 replaces matching/scope
and extends results additively.

## Deferred dependencies

- Shared conflict/Question documents: Part 07.
- Freshness scheduling and ordinary response marks: Part 09.08.
- Remote repository reading: first post-phase capability using exact identity,
  path/revision and MCP-managed GitHub.com/Enterprise token.
- Provider access: Parts 06 and 11.
- Query does not clone, index or invoke a provider CLI automatically.
