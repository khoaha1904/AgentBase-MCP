---
name: agentbase-okf
description: Author, refresh, validate, and review AgentBase Open Knowledge Format v0.2 bundle proposals from bounded repository evidence. Use when an AgentBase prepare operation returns a proposal workspace, when repository knowledge must become linked OKF concepts, or when rebuilding drafts while preserving maintainer guidance and other protected concepts.
---

# Author an AgentBase OKF proposal

Work only inside the exact prepared proposal's `bundle/` subtree. Treat the
current `okf/`, proposal metadata, evidence bundle, provider cache, and source
repository as read-only.

## Load the relevant rules

- Always read [`references/concepts.md`](references/concepts.md) before creating
  or modifying concepts.
- Read [`references/navigation-and-boundaries.md`](references/navigation-and-boundaries.md)
  when adding concepts, indexes, Domain/System navigation or infrastructure.
- Read [`references/uncertainty-and-guidance.md`](references/uncertainty-and-guidance.md)
  when evidence conflicts, values can change, Questions exist or protected
  knowledge is involved.

## Workflow

1. Read the proposal metadata and bounded repository evidence before authoring.
   When prepare returns `confirmedDomain`, treat its exact identity/title as
   owner guidance: create or reuse that Domain and use the returned
   `evidenceResource` for Domain membership rather than attributing the business
   boundary to repository code.
2. Read prior concept bodies only at the exact `currentSource`, `subject`,
   `neighbors` and `navigationPaths` named by the prepare result's continuity
   manifest. The full copied Hub is lifecycle state, not authoring context.
   Never cite previous generated prose as independent evidence.
3. Preserve every existing file byte-for-byte unless it is an explicit
   unverified `agentbase/` draft. When new evidence conflicts with protected
   knowledge, keep the protected bytes and report the unresolved conflict.
4. For Initial Ingest, begin with the exact skeleton files returned by prepare.
   Preserve their paths and generated lifecycle/provenance fields; enrich the
   Markdown knowledge and add only evidence-backed metadata or relations. Do
   not reconstruct frontmatter from memory. A skeleton produced from semantic
   `suggested` guidance keeps its visible role-review limitation until the
   proposal is reviewed; it is not exact truth. Preserve the prepared bounded
   `Embedded Knowledge` table as searchable human-readable knowledge in its
   parent. An embedded row has no OKF identity, standalone file, navigation or
   graph relationship. Do not promote or split it during this authoring pass.
   Create the smallest independently
   useful linked concept set. A separate
   concept needs a stable identity plus an independent contract, ownership,
   lifecycle, failure/operational boundary, audience or important graph role.
   Do not turn every route, handler, function or infrastructure block into a
   concept merely because it is concrete.
5. Keep the prepared navigation progressive. The root `index.md` carries `okf_version:
   "0.2"` and links only existing Domain, System and Repository entrypoint
   indexes. Preserve every existing nonblank root/category index line exactly
   and in order; repository authoring may append navigation but must never
   rename the Hub heading or restyle earlier entries. Consume an existing valid
   `log.md`; do not generate one.
6. Validate created/modified concepts with `validate_okf_changes`, supplying
   only their full Markdown plus unchanged target summaries from continuity or
   exact search/traversal. Read each changed file and send its complete Markdown
   document bytes as `content`, never its path or a wrapper object. For every
   supplied concept or target, `identity` is
   exactly its normalized path relative to the OKF root with `.md` removed;
   never include an outer `okf/` prefix. Apply relationship guidance from the
   exact frontmatter `type`; a display name or prose never changes the schema.
   Then run AgentBase final validation and diff. Repair only proposal files.
   Present warnings, limitations, and the complete diff.
7. Stop before apply unless the maintainer explicitly authorizes applying that
   exact validated proposal.

## Validation boundary

Use changed-set MCP validation during authoring, then the repository's final
`okf validate` and `okf diff` stages. Final validation remains local lifecycle
protection over exact disk state; it is not a reason to send the full Hub into
the model context. A successful validation locks the generated tree digest; any
later edit requires validation again. Do not bypass stale-base,
protected-content, source-path, producer-policy, or conformance failures.
