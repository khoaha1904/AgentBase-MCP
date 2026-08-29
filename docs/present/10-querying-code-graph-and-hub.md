# 10 — Querying the Code Graph and Hub

> Status: Published-only Hub query, lexical query-quality capability 049 and
> Capability 051 failure-visibility/qualification hardening are implemented.

## Short answer

The Agent chooses Hub, source/Code Graph or a combination. The user does not
need to choose a query mode.

Query uses **snapshot-default**: when the Hub/snapshot is sufficient to answer
the question, it stops there. Source is not the default verification step, even
when it is already available.

| Question | Preferred source |
|---|---|
| What exists, why, how is it connected, where can I find it? | Hub |
| How exactly does the current code implement it? | Source + Code Graph |
| Connect overview with implementation | Both |

## When to use source

Read source only when the user asks for a current value/code, when
implementation/debug/real impact work requires exact code, or when the Hub is
insufficient to complete the request safely. An old snapshot, an open
Question/conflict or source being available does not automatically trigger a
source read.

Code Graph is used only for repositories that are local or in the workspace.
For a remote repository, the Agent reads a file by reference only when an
MCP-managed credential has permission; MCP does not clone the repository
automatically. The Agent must not call `gh`, use a personal/ambient credential
or another remote reader to bypass MCP.

If source access is unavailable, the Agent returns the Hub-known portion,
including a snapshot when present, and states that it cannot verify the
implementation or current value. The Agent does not guess.

## Published and Local Draft

Hub search/read uses only the exact Published commit synchronized locally.
Local Draft appears only during inspect/review/PR and does not participate in
ordinary answers. When a Remote Hub is not configured, Hub query and OKF
authoring are unavailable; Code Graph remains independently usable.

Search finds a concept; read returns the complete Markdown document, including
knowledge, relationship links, snapshot, provenance and Questions. The MVP does
not need separate traversal, observed-value or freshness tools. The Agent can
follow another link with search/read when needed.

## Hub is a structured Markdown knowledge base

OKF standardizes the corpus—frontmatter, concept paths, Markdown bodies,
`index.md` and links—not the search engine. Query therefore follows a familiar
Markdown-KB pattern: discover a scoped result and snippet first, then read the
exact full document. MCP keeps the `search → read` contract; an established
full-text engine handles lexical relevance instead of AgentBase inventing a
query language or scoring algorithm.

The official `description` is the one-line summary for the index, snippet and
preview; there is no duplicate `summary` field. Search uses an allowlist of
identity/path, title, type, description, tags, Markdown headings/body, portable
links and AgentBase-accepted relation/Flow extensions. Arbitrary YAML appears
only when an exact document is read.

Markdown bodies are projected temporarily by heading hierarchy. A concept can
match several sections but occupies one result, with the best heading path and
a bounded excerpt. This is in-memory retrieval state; it does not create chunk
files, new concepts or a second knowledge store.

Search may use existing portable links, canonical relationships and Flow steps
to help the Agent find a related producer, consumer, trigger or endpoint. It
does not infer a new relation, type an OKF Markdown link automatically or
replace an exact Markdown read. Returned context preserves direction/evidence,
is bounded and states what was omitted.

Domain scope is context for finding knowledge, not an operation that rewrites
the Hub. It includes concepts with canonical `part-of`, concepts structurally
related to a Repository in the Domain and the direct external endpoint of an
accepted relation. It stops at that endpoint and does not expand the Domain
further automatically.

Embedding, vector databases, managed semantic search and durable indexes are
considered only when real qualification shows that lexical search plus
structured scope is insufficient. The static Domain Hub may evaluate Pagefind
separately as a UI capability; a browser index does not become the authority
for MCP query.

## When sources conflict

The Agent presents related claims, provenance, Questions and Maintainer Guidance
within the correct scope; guidance in `Needs Review` includes a warning. An
observed snapshot is shown with its data age and source reference, without
deleting historical claims. When the user asks for a current value and has
source access, the Agent reads source through the normal MCP flow instead of a
separate live-reference resolver.

A conflict stored in the Hub must still be presented. Snapshot-default only
avoids creating another temporary source position when the existing answer is
sufficient; it does not hide or auto-resolve an existing conflict.

The canonical conflict rules are in
[section 07](07-conflicts-questions-and-maintainer-guidance.md); observed values
are in [section 08](08-live-references-for-change-prone-values.md).

Query must distinguish two cases:

- An oversized document may be omitted under the bound, but the result must say
  which part was omitted.
- A malformed Published document makes search/read stop with a clear error; it
  must not return an apparently complete but incomplete graph.

This is query transparency, not a new query language and not an additional
`summary` field or durable search index.

## Read access

The Hub is one shared trust boundary: Hub access grants read access to all
Published knowledge; there are no separate ACLs by Domain, concept or field.
Source-read access still depends on the corresponding repository/provider.

This is the authority contract for remote-repository query. A remote file reader
was removed from the MVP but is the next query capability after this phase: it
will use the active MCP-managed GitHub/GitHub Enterprise token and an exact
repository/file/revision reference, independent of each machine's local path.

Until that capability is released, another repository can be used only when its
source is local/in the workspace or the Hub has the knowledge,
snapshot/reference. The Agent must not use `gh`, ambient credentials or an
automatic clone to bypass the limit.
