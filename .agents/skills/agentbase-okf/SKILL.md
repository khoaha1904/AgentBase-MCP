---
name: agentbase-okf
description: Internal explicit delegation only. Use $agentbase-okf only after an explicitly invoked public AgentBase authoring workflow returns an exact prepared OKF workspace; never select it for ordinary repository work, questions, or lifecycle requests.
---

# Author a prepared OKF bundle

Edit only the exact prepared bundle/. Source, current okf/, proposal metadata,
evidence and provider cache are read-only. The only direct MCP call here is
`validate_okf_changes`; the invoking public skill owns lifecycle and repair budget.

Read [concept rules](references/concepts.md) always,
[navigation/boundaries](references/navigation-and-boundaries.md) when adding or
linking concepts, and [uncertainty](references/uncertainty-and-guidance.md) for
conflicts, mutable values, Questions or protected knowledge.

1. Start from returned skeletons and exact home-qualified subject/paths. Preserve
   homePlan participations or confirmedDomain guidance; physical home alone is
   not membership. Preserve prepared part-of on cross-boundary Resources.
   Read prior knowledge only at continuity's currentSource/subject/neighbors/
   navigationPaths; copied Hub state is not authoring context or source evidence.
2. Preserve existing bytes unless explicitly unverified agentbase/ draft. Conflicts
   with protected knowledge remain Questions/limitations. Preserve provenance,
   producer fields, unknown frontmatter and suggested-role review limitations.
3. Keep only independently useful linked concepts; group internals in runtime
   parents, keep independent deployments separate. Resource structural anchors
   are evidenced implemented-in Repository or confirmed part-of Domain, not
   declared-by or Resource-to-Resource depends-on. Prefer exact publishes-to,
   reads-from or writes-to when supported; follow the frontmatter type's schema.
   Repository has only own sources and promoted-child links. Embedded Knowledge
   and Embedded Relations stay in their evidence-owning parent; rows have no
   identity, standalone file, navigation or canonical edge. Do not split them here.
4. Use compact wiring prose: role, runtime/entrypoint, triggers/interfaces,
   linked IO/stores, flow-changing conditions, failures/retry/DLQ and operations.
   Aim for about 60 body lines; implementation details stay in sources/children.
   Preserve observed_revision; new observations use revision-distinct source IDs.
   Renderer owns Questions/Observed values; do not hand-author their IDs/tables.
5. Preserve prepared root/capsule/shared navigation and every nonblank root line
   in order. Root carries okf_version 0.2. No unrelated category indexes or
   activity log.md. Refresh preserves homes, foreign contributions and omitted
   knowledge; removal belongs to explicit Finalize intent.
6. Send complete changed Markdown bytes, never paths/wrappers, to validation
   with session_id when available. identity equals normalized OKF-relative path
   minus .md, without okf/ prefix. Targets describe unchanged concepts; session
   adds referenced Published targets and excludes changed skeletons. Every
   frontmatter relationship needs a resolving Markdown body link.

Repair only proposal files within the invoking workflow's budget. Final validation
protects exact disk state; any later edit requires validation again. Never bypass
source/base, protected-content, producer or conformance guards. Present warnings,
limitations and complete diff; return to the parent skill before Publish.
