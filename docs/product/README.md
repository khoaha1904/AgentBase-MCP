# AgentBase Product Contract

This directory owns AgentBase's product outcomes, user-visible workflows,
authority, scope and non-goals. It defines **what** the product must achieve;
[`docs/architecture`](../architecture/README.md) defines shared system shape and
[`docs/capabilities`](../capabilities/README.md) defines bounded behavior.

Product Contracts are intentionally broader and more stable than capabilities.
One Product Contract may route to several independently owned Capability
Contracts. Concrete modules, packages and coding decisions remain with their
owning source area and adjacent tests.

When implementation evidence conflicts with this contract, record the gap and
route the product decision here before changing downstream contracts. Do not
silently redefine product behavior in architecture, capability or source docs.

## Find the decision

| Question | Read | Owns |
|---|---|---|
| What is AgentBase, who is it for, and what can ship? | [Scope](00-scope-and-authority.md) | Business scope, trust profile, release limits |
| What should ingest retain or omit? | [Understanding](01-repository-understanding.md) | Evidence, selective knowledge and completeness limits |
| Where does knowledge belong and how is it connected? | [Model](02-knowledge-model-and-relations.md) | Domain, Repository, concept identity and placement |
| How is knowledge added, updated and shared? | [Lifecycle](03-knowledge-lifecycle.md) | Authoring intentions, preview, Publish and recovery |
| What do freshness, conflicts and human answers mean? | [Trust](04-trust-conflicts-and-freshness.md) | Uncertainty, snapshots and authority |
| How should an agent use knowledge or request repair? | [Query](05-query-and-context.md) | Read routing, evidence and scoped handoffs |
| What does a Domain site/graph prove? | [Visualization](06-visualization.md) | Read-only projections and non-claims |
| What belongs to AgentBase versus the caller's workflow? | [AI SDLC](07-ai-sdlc-context.md) | Context composition and host ownership |

Select one row; do not read all Product files. The mapping below links each
outcome to its detailed Capability owners.

## Current product

Groups 1–9 are implemented for the bounded internal enterprise release.
[Scope and authority](00-scope-and-authority.md) owns current limits and deferred
evidence; there is no active product redesign backlog.

- Add repository / Update knowledge prepare source-backed private proposals.
- One material preview and explicit Publish use the Hub's Direct/PR policy.
- One read entry supplies standalone answers or context inside the host workflow.
- A concrete gap may lead to an explicitly approved repair, never implicit Publish.

## Product-first initiative gate

Related changes that can affect the same user outcome, authority, data model or
lifecycle form one product design group. All identified groups in the current
product horizon are reviewed across every affected Product Contract before new
delivery work descends to Architecture or Capability design. This exposes
cross-group effects while they are still inexpensive Product decisions.

Each group records two concise decision views:

1. **Current → Target** — the relevant current behavior and the observable
   product behavior that will replace it.
2. **Benefit → Impact** — why the target is better and which workflows,
   compatibility, migration, authority, data or operations it may disturb.

Those views are supported by, rather than substituted for, the required product
content:

- the user/owner problem and observable outcome;
- current evidence and the gap it demonstrates;
- accepted scope, authority, trade-offs and non-goals;
- success, stop and evidence gates; and
- the downstream Architecture and Capability owners that may design it.

A product horizon with an unresolved group does not proceed to new delivery
work. After all Product groups are accepted, delivery returns to the earliest
open group and revalidates its Architecture against the complete Product
horizon. Inside that group, one bounded Capability is taken from contract to
implementation and verification before the next Capability begins. The whole
group is released/closed before Architecture or Capability delivery begins for
the next group.

This vertical sequence may use small dependency-ordered commits, but it must not
pre-design a stack of Capability Contracts whose earlier assumptions have not
met code. If implementation evidence changes an Architecture or Product
assumption, update the owning living contract before continuing. This is the
entry condition for the mandatory lifecycle in [`AGENTS.md`](../../AGENTS.md),
not a second process or a license to duplicate decisions in a roadmap/spec file.

## Default deployment assumption

Product design targets a **trusted enterprise workspace** by default: the
operator, machine, network, MCP client/AI service and enterprise identity
providers are managed for the intended company work. This is a deployment
assumption, not a claim that bugs, mistakes or unsafe publication cannot occur.

Every later product group must therefore:

- prefer correctness, provenance, review and recovery over repeated security
  prompts in the normal internal workflow;
- avoid per-repository installation or persistent source allowlists when the
  selected repository is already accessible to the operator's process; and
- preserve clear source, credential, workflow and transport boundaries so a
  separately qualified hardened/public profile can add stricter policy later
  without changing AgentBase's core knowledge model or user workflows.

The default profile does not claim safe public, hostile-client or multi-tenant
operation. Such deployment requires an explicit Product Contract expansion.

## Product outcome

Knowledge about a system is scattered across code, infrastructure,
configuration and documentation in many repositories. AgentBase helps AI find,
verify and connect that knowledge into a shared map with clear sources.

```text
Local/workspace source → bounded source discovery + evidence → private proposal
                                                         ↓ preview + Publish
                                                   Published Hub (Direct/PR)
```

- Source reads answer exact current-implementation questions.
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

Ingest, Refresh, Enrichment, Query, Questions and Publish are agent
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
- **Private proposal / Published:** unpublished preparation / complete remote knowledge recognized locally.
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

Implementation status and requirement IDs live in downstream Capability
Contracts; tests and repository checks provide validation evidence. They are
not duplicated as dated Product Contract snapshots.
