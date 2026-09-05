# 05 — Query and context

> Status: Published-only Hub query, bounded lexical retrieval, Domain/relation
> context and explicit source degradation are implemented. Group 3 retrieval,
> freshness-envelope and front-door Product design is accepted; G3-C1 uniform
> freshness is implemented. The broader retrieval/usefulness campaign is
> deferred and does not block the current internal enterprise release. G4-C4
> Profile Domain projection and G5-C1 compact-layout/dossier projection are
> implemented and verified. G5-C2 private draft-quality
> probes are deferred and are not part of current query behavior.

## Outcome

The user explicitly invokes `agentbase-query`; the Agent then selects the Hub,
local source/Code Graph or both. The user does not need to choose a query mode.

| Question | Preferred source |
|---|---|
| What exists, why and how is it connected? | Published Hub |
| How does the current code implement it? | Local source and Code Graph |
| Connect system overview with implementation | Hub, then selective source |

Query is **snapshot-default**: when Published knowledge is sufficient, the
Agent stops. Source is read only when the user requests current implementation,
debug/impact work requires exact code or the Hub cannot support a safe answer.

No ordinary repository-reading, explanation, research or coding request
implicitly activates an AgentBase product skill. Public skills require their
exact explicit invocation. Internal skills run only when an already active
explicit public AgentBase workflow delegates to them.

The ordinary query workflow owns only a standalone read-only AgentBase answer.
When the user explicitly selects Feature or User Story discovery, planning,
diagramming or another primary workflow, that workflow retains the deliverable;
bounded AgentBase support is supplied only through its explicit context route.
If the user explicitly selects the wrong AgentBase workflow, it returns compact
routing guidance and stops; it does not silently activate a more privileged
workflow. Standalone `agentbase-query` remains the one front door that chooses
among already authorized Hub/source evidence for an ordinary AgentBase question.

## Published authority

Ordinary search/read uses one exact synchronized Published commit and never
mixes Local Draft or proposal content. Search discovers bounded relevant
concepts and context; exact read returns the full selected Markdown knowledge.
Portable links, accepted relations and Flows may help navigation but never
authorize an inferred relationship.

After Group 4 delivery, Domain scope starts with its capsule and includes
evidenced shared or cross-Domain boundary endpoints without silently importing
another capsule. Physical home supports navigation but never substitutes for
relations when deciding semantic impact. Returned context keeps home,
direction, evidence, Questions and visible omissions.

MCP keeps `domains/<slug>` as the external Domain selector. Compact Profile 1.0
uses that same canonical Domain identity and labels physically homed,
semantically participating and boundary concepts separately. An unprofiled
legacy Hub remains read-only and visibly identified until migration.

Under the compact Profile 1.0 target, `domains/<slug>/index.md` is both the
Domain entry and concept, so its identity is the external selector itself.
Query discovers standalone types from frontmatter in `knowledge/`, not from
type-shaped folders. A Repository result returns its rich dossier plus bounded
links to independently promoted knowledge and Questions; it does not require
the caller to assemble a useful overview from thin type documents.

Pre-Finalize quality probes reuse bounded retrieval logic over an exact private
draft only inside the authoring workflow. They never make Local Draft available
to ordinary query and never change Published ranking. Their applicable,
source-grounded questions test whether purpose, boundaries, interfaces/triggers,
dependencies, flows, operations and limitations can be found without treating
every rubric item as mandatory repository content.

## Source use and degradation

In the trusted enterprise profile, Code Graph access follows the local
repository selected for the workflow and the current process's filesystem
access. A remote source reference requires an explicit source workflow and the
operator's configured enterprise or local Git identity; ordinary query never
turns a reference into an automatic clone.

If source is unavailable, the Agent returns the Hub-known portion and says what
could not be verified. A snapshot is never described as current source. Existing
conflicts and Questions remain visible even when snapshot-default avoids a new
source read.

Malformed Published knowledge fails visibly. Bounded omission must identify
what was omitted; AgentBase must not present an incomplete result as complete.
Responses expose the freshness envelope owned by the Trust Product Contract so
the caller can distinguish current-source verification from Published-only or
snapshot-only context.

## Trust boundary

Hub access grants read access to all Published knowledge in that Hub. The
current product has no Domain-, concept- or field-level ACL. Source access
remains independent and does not follow automatically from Hub access.
Therefore one Hub is one read trust zone, not an implicit company-wide security
boundary. Repositories that require different readers use different Hubs until
a separately qualified federation or redaction capability exists.

Search implementation and rebuildable indexes are not knowledge authority.
Semantic/vector search is considered only after measured evidence shows the
current lexical plus structured-context behavior is insufficient.

## Deferred retrieval evidence gate

This campaign is not part of the current internal enterprise release. When it
resumes, it tests paraphrases, vocabulary mismatch, ambiguous Domain terms,
cross-repository boundary questions and adversarial irrelevant matches against
versioned semantic obligations. It reports top-result coverage, important
omissions, unsupported claims, bounded follow-up reads, tokens and latency. The
current one-search/top-five profile remains a bounded scenario profile, not a
universal query limit or a generalized benchmark claim. Query expansion,
aliases or semantic retrieval are introduced only for a measured failure that
the smallest bounded change fixes.

## Non-goals

- A query language or separate query-time knowledge store.
- Automatic relation inference during read.
- Querying Local Draft as if it were Published.
- Automatic repository clone or provider lookup.
- Hidden fallback that suppresses access, parsing or bound failures.
- Taking over another explicitly selected workflow merely because it needs
  AgentBase context.
- Automatic AgentBase skill selection from an ordinary repository request.
- A hidden router that turns read-only questions into authoring, publication or
  provider workflows.

## Downstream Capability Contract

- [Query routing](../capabilities/10-query-routing/README.md)
