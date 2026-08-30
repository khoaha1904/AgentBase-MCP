# AgentBase Product Contract

This directory owns AgentBase's product outcomes, user-visible workflows,
authority, scope and non-goals. It defines **what** the product must achieve;
[`docs/architecture`](../architecture/README.md) defines shared system shape and
[`docs/capabilities`](../capabilities/README.md) defines bounded behavior.

Product Contracts are intentionally broader and more stable than capabilities.
One Product Contract may route to several independently owned Capability
Contracts. Concrete modules, packages and coding decisions belong in the active
feature's `specs/<feature>/plan.md`.

When implementation evidence conflicts with this contract, record the gap and
route the product decision here before changing downstream contracts. Do not
silently redefine product behavior in architecture, capability or source docs.

## Product outcome

Knowledge about a system is scattered across code, infrastructure,
configuration and documentation in many repositories. AgentBase helps AI find,
verify and connect that knowledge into a shared map with clear sources.

```text
Local/workspace source → private Code Graph + evidence → Local Draft
                                                         ↓ review + PR
                                                   Published Hub
```

- Source and Code Graph answer exact current-implementation questions.
- Skills and MCP investigate, verify, propose and query bounded knowledge.
- AgentBase-Hub keeps the sparse reviewed overview and Git history; it does not
  copy entire repositories or raw graphs.

## Owner control surface

The public CLI is `abs` and intentionally remains small:

```text
abs status
abs hub connect --url <repository-url> --branch <branch>
abs hub sync
```

Ingest, Refresh, Enrichment, Query, Questions, Accept and Publish are agent
workflows over skills/MCP rather than a long public command list. Every
conclusion retains provenance; AgentBase does not automatically resolve
conflicts or publish without explicit authorization.

## Core terminology

- **Domain:** a business or system grouping such as Crawler or Recommendation.
- **Repository:** one stable Git-lineage source identity.
- **Concept:** a concrete Hub entity such as a service, API or shared resource.
- **Schema:** a reusable provider-neutral role used to describe a concept.
- **Relation:** an evidenced connection between concepts.
- **Claim:** an assertion whose evidence/provenance identifies its support.
- **Question:** an unresolved item retained for investigation or confirmation.
- **Local Draft / Published:** accepted local proposal / synchronized merged Hub knowledge.
- **Maintainer Guidance:** scoped human evidence for a Question or subject.

## Product Contracts and capability ownership

| Product Contract | Downstream Capability Contracts |
|---|---|
| [00 — Scope and authority](00-scope-and-authority.md) | [12 — Version scope](../capabilities/12-version-scope/README.md) |
| [01 — Repository understanding](01-repository-understanding.md) | [01 — Repository reading](../capabilities/01-repository-reading/README.md), [03 — Concept discovery](../capabilities/03-concept-discovery/README.md), [04 — Schema selection](../capabilities/04-schema-selection/README.md) |
| [02 — Knowledge model and relations](02-knowledge-model-and-relations.md) | [02 — Hub/Domain/Repository model](../capabilities/02-hub-domain-repository-model/README.md), [06 — Cross-repository relations](../capabilities/06-cross-repository-relations/README.md) |
| [03 — Knowledge lifecycle](03-knowledge-lifecycle.md) | [05 — Knowledge entry](../capabilities/05-knowledge-entry/README.md), [09 — Ingest and Refresh](../capabilities/09-ingest-and-refresh/README.md), [11 — Review and Publish](../capabilities/11-review-and-publish/README.md) |
| [04 — Trust, conflicts and freshness](04-trust-conflicts-and-freshness.md) | [07 — Conflicts and Questions](../capabilities/07-conflicts-and-questions/README.md), [08 — Observed snapshots](../capabilities/08-live-references/README.md) |
| [05 — Query and context](05-query-and-context.md) | [10 — Query routing](../capabilities/10-query-routing/README.md) |
| [06 — Visualization](06-visualization.md) | [13 — Published visualization](../capabilities/13-visualization/README.md) |
| [07 — AI SDLC context](07-ai-sdlc-context.md) | [14 — AI SDLC context](../capabilities/14-ai-sdlc-context/README.md) |

Implementation status, requirement IDs and retained qualification evidence live
in the downstream Capability Contracts, tests and `specs/CURRENT.md`; they are
not duplicated as a dated Product Contract snapshot.
