---
name: agentbase-okf
description: Support an AgentBase authoring workflow after an exact prepare operation returns a bounded OKF proposal workspace. Use to author and validate that workspace while preserving protected knowledge; ordinary questions and lifecycle requests belong to public AgentBase skills.
---

# Author an AgentBase OKF proposal

Work only inside the exact prepared proposal's `bundle/` subtree. Treat the
current `okf/`, proposal metadata, evidence bundle, provider cache, and source
repository as read-only.

The only MCP tool this file-authoring workflow calls directly is
`validate_okf_changes`; lifecycle tools remain owned by the invoking product
skill.

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
   Preserve exact `sources[].observed_revision`; a newer observation must use a
   revision-distinct source ID. Receipt-bound Questions are renderer-owned and
   must not be authored under `questions/`.
   For Refresh, investigate `sourceChanges`, then `continuity.knownGaps`, then
   one small discovery pass. Omitted files, old observations and search/graph
   absence preserve accepted knowledge. Declare destructive removal only at
   Finalize with an exact reason and current-repository evidence.
5. Keep the prepared navigation progressive. The root `index.md` carries `okf_version:
   "0.2"` and links only existing Domain, System and Repository entrypoint
   indexes. Preserve every existing nonblank root/category index line exactly
   and in order; repository authoring may append navigation but must never
   rename the Hub heading or restyle earlier entries. Never edit or generate
   `log.md`; successful lifecycle Finalize owns its concise activity entry.
6. Validate created/modified concepts with `validate_okf_changes`, supplying
   only their full Markdown plus unchanged target summaries from continuity or
   exact search/read. Read each changed file and send its complete Markdown
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
