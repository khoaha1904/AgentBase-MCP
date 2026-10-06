---
name: agentbase-okf
description: Internal explicit delegation only. Use $agentbase-okf only after an explicitly invoked public AgentBase authoring workflow returns an exact prepared OKF workspace; never select it for ordinary repository work, questions, or lifecycle requests.
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
   When Prepare returns `homePlan`, preserve its exact home-qualified subject
   and skeleton paths; home is placement only, and only its participation
   entries authorize Domain membership. When Prepare instead returns
   `confirmedDomain`, treat its exact identity/title as compatibility owner
   guidance and preserve its generated Domain membership.
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
   canonical graph relationship. An optional `Embedded Relations` table may
   describe a useful evidence-backed runtime direction using `self`, one exact
   concept identity or one unique same-parent embedded name. Use only
   `provides`, `consumes`, `depends-on`, `triggered-by`, `publishes-to`,
   `reads-from`, `writes-to`, `monitors` or `redrives-to`, with parent source
   IDs in every row. Do not infer a relation from containment, and do not
   promote or split an embedded row during this authoring pass.
   Create the smallest independently
   useful linked concept set. A separate
   concept needs a stable identity plus an independent contract, ownership,
   lifecycle, failure/operational boundary, audience or important graph role.
   A new known standalone concept also needs an evidenced structural path
   allowed by its exact schema to a Repository or Domain. For a Resource, use
   `implemented-in -> Repository`; Resource does not admit `declared-by` or
   Resource-to-Resource `depends-on`. Otherwise keep it embedded or limited.
   Do not turn every route, handler, function or infrastructure block into a
   concept merely because it is concrete.
   Group all knowledge sharing one runtime, deployment and ownership boundary
   in that Function, Component or System parent. A one-runtime repository
   normally has one Repository plus one runtime concept. Keep independently
   deployed frontend and backend runtimes separate; consolidate their internal
   modules and provider resources instead. Promote a shared queue, API or other
   boundary only when another runtime, owner, lifecycle or AIT decision needs to
   identify it independently. Prefer evidence-backed `publishes-to`,
   `reads-from` and `writes-to` over generic `depends-on` when the target is an
   independently promoted Interface or Resource.
   Add optional metadata only when it supports reconciliation, retrieval or a
   documented decision; do not copy provider inventories or repeat machine
   metadata as generic prose.
   Preserve exact `sources[].observed_revision`; a newer observation must use a
   revision-distinct source ID. Receipt-bound Questions are renderer-owned and
   must not be authored under either legacy `questions/` or Profile
   `shared/questions/`.
   For Refresh, investigate `sourceChanges`, then `continuity.knownGaps`, then
   one small discovery pass. Omitted files, old observations and search/graph
   absence preserve accepted knowledge. Keep the prepared Profile paths and
   Repository home; Refresh never rehomes a concept. Declare destructive
   removal only at Finalize with an exact reason and current-repository
   evidence.
5. Keep the prepared navigation progressive. The root `index.md` carries
   `okf_version: "0.2"`. In Profile 1.0, preserve its Profile and Domain Capsule
   links plus the prepared capsule/shared indexes; in a legacy Hub, preserve
   its direct Domain or fallback Repository entrypoint. Do not create unrelated
   indexes. Preserve every existing nonblank root line exactly and in order.
   Workflow-owned Question documents remain under their exact prepared home;
   compact Profile homes have no category indexes. Never edit or generate
   AgentBase activity `log.md`; Git and pull requests own shared history.
6. Validate created/modified concepts with `validate_okf_changes`, supplying
   the prepared `session_id` when the invoking workflow returned one, and
   only their full Markdown plus unchanged target summaries from continuity or
   exact search/read. When a prepared session is supplied, the validator also
   admits referenced Published concepts and filters changed skeletons from its
   automatic targets. Read each changed file and send its complete Markdown
   document bytes as `content`, never its path or a wrapper object. For every
   supplied concept or target, `identity` is
   exactly its normalized path relative to the OKF root with `.md` removed;
   never include an outer `okf/` prefix. Apply relationship guidance from the
   exact frontmatter `type`; the canonical vocabulary is not permission to use
   every predicate on every type, and a display name or prose never changes the
   schema.
   Every relationship in frontmatter needs a resolving Markdown link to its
   target in the document body.
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
