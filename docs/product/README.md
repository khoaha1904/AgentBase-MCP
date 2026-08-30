# AgentBase Product Contract

This directory owns AgentBase's product outcomes, user-visible workflows,
authority, scope and non-goals. It defines **what** the product must achieve;
[`docs/architecture`](../architecture/README.md) defines the shared system shape
and [`docs/capabilities`](../capabilities/README.md) defines bounded behavior.

Page `00` owns product-wide policy. Pages `01` through `14` are user-facing
outcome slices, not implementation plans. Their status notes distinguish
implemented behavior from accepted direction. Concrete modules, packages and
coding decisions belong in the active feature's `specs/<feature>/plan.md`.

When implementation evidence conflicts with this contract, record the gap and
route the product decision here before changing downstream contracts. Do not
silently redefine product behavior in architecture, capability or source docs.

## What problem does AgentBase solve?

Knowledge about a system is often scattered across code, infrastructure,
configuration and documentation in many repositories. AgentBase helps AI find,
verify and connect that knowledge into a shared map with clear sources.

```text
Local/workspace source ──→ Code Graph + MCP ──→ Local Draft
                                                     ↓ review + PR
                                               Published Hub
```

- **Source and Code Graph** answer detailed questions about current implementation.
- **MCP and skills** investigate, verify, create drafts and query Published knowledge.
- **Hub** keeps the overview: what the system contains, why it exists, how it
  connects and where to find detail. The Hub does not copy the entire repository.

## Command surface

Users do not need to know OKF authoring internals or the full MCP lifecycle.
AgentBase's official CLI is `abs`; `abs --help` exposes only a small owner
surface. The MVP keeps three public commands:

```text
abs status
abs hub connect --url <repository-url> --branch <branch>
abs hub sync
```

`mcp` is a technical launcher for client registration. Ingest, Refresh, Batch,
Enrichment, Accept, Publish, Question review and detailed OKF steps are
orchestrated by skills and MCP; they do not become a long public CLI list.
Benchmark, validator and workflow runners are developer/internal commands.

The main flow is: **Initial Ingest → review Local Draft → Publish through a PR
→ Refresh when source changes**. Every conclusion keeps provenance; AI does not
automatically merge ambiguous data, choose one conflicting source as truth or
publish without explicit authorization.

## Core terminology

- **MCP/skill:** tools and procedures for an agent to read, verify and update knowledge.
- **Domain:** a business group such as Crawler or Recommendation.
- **Concept:** a concrete Hub entity such as a service, API or queue.
- **Schema:** a reusable role definition MCP uses to describe a concept.
- **Relation:** a relationship between two concepts.
- **Claim:** an assertion; **evidence/provenance** is its supporting source.
- **Question:** an unresolved item to track or confirm.
- **Local Draft / Published:** knowledge local to the workflow / merged into the shared Hub.
- **Maintainer Guidance:** scoped guidance supplied by a user.
- **PR:** a proposed change for a maintainer to review and merge into the shared Hub.

## Product sections and downstream contracts

| Area | Product outcome | Capability Contract |
|---|---|---|
| 00 | [Product scope and authority](00-product-scope-and-authority.md) | [Version scope](../capabilities/12-version-scope/README.md) |
| 01 | [How MCP reads a repository](01-how-mcp-reads-a-repository.md) | [Repository reading](../capabilities/01-repository-reading/README.md) |
| 02 | [How Hub, Domain and Repository are organized](02-hub-domains-and-repositories.md) | [Hub, Domain and Repository model](../capabilities/02-hub-domain-repository-model/README.md) |
| 03 | [How MCP identifies concepts in a repository](03-how-concepts-are-identified.md) | [Concept discovery](../capabilities/03-concept-discovery/README.md) |
| 04 | [How MCP selects a concept schema](04-how-concept-schemas-are-selected.md) | [Schema selection](../capabilities/04-schema-selection/README.md) |
| 05 | [How repository knowledge enters the Hub](05-how-repository-knowledge-enters-the-hub.md) | [Knowledge entry](../capabilities/05-knowledge-entry/README.md) |
| 06 | [Cross-repository and cross-domain relationships](06-cross-repository-and-cross-domain-relationships.md) | [Cross-repository relations](../capabilities/06-cross-repository-relations/README.md) |
| 07 | [Conflicts, Questions and Maintainer Guidance](07-conflicts-questions-and-maintainer-guidance.md) | [Conflicts, Questions and Guidance](../capabilities/07-conflicts-and-questions/README.md) |
| 08 | [Observed snapshots and source references](08-live-references-for-change-prone-values.md) | [Observed snapshots](../capabilities/08-live-references/README.md) |
| 09 | [Ingest and Refresh](09-ingest-and-refresh.md) | [Ingest and Refresh](../capabilities/09-ingest-and-refresh/README.md) |
| 10 | [Querying Code Graph and Hub](10-querying-code-graph-and-hub.md) | [Query routing](../capabilities/10-query-routing/README.md) |
| 11 | [Review and Publish](11-review-accept-and-publish.md) | [Review and Publish](../capabilities/11-review-and-publish/README.md) |
| 12 | [Version-one limits and scope](12-current-limits-and-open-decisions.md) | [Version scope](../capabilities/12-version-scope/README.md) |
| 13 | [Visualizing Published knowledge](13-visualizing-published-knowledge.md) | [Published visualization](../capabilities/13-visualization/README.md) |
| 14 | [Context for AI workflows in the SDLC](14-context-for-ai-sdlc-workflows.md) | [AI SDLC context](../capabilities/14-ai-sdlc-context/README.md) |

The twelve foundation sections were reviewed as one whole. Section 13 is a
new capability presentation and preserves the authority of earlier sections.
Capability 051 completed reliability hardening without changing OKF schema or
query authority. Section 14 opens AgentBase as a context layer for external
workflows; Feature Discovery is its first qualification and has no new
implementation yet.

## Synchronization status — 2026-08-29

| Area | Current implementation |
|---|---|
| 01–05 | Local Code Graph, catalog 7, OKF template, remote-profile Local Draft and Published-only query are implemented |
| 06–08 | Relations/Questions, snapshots, AWS/SQS Enrichment, freshness and Hub CI are implemented; other profiles are deferred |
| 09 | Single Initial Ingest/Refresh, Batch Initial Ingest, Domain Enrichment, freshness and CI are implemented; Batch Refresh is deferred |
| 10 | Published-only Hub search/read is implemented; multi-term/relation-aware query quality is accepted for capability 049; ordinary freshness marks and remote source reader are not implemented |
| 11 | Review, Accept, rich batch PR and exact same-Repository Init/Refresh PR stack are implemented; MCP does not merge or rebase independent Init proposals |
| 12 | The MVP supports Terraform/Terragrunt; SAM/CloudFormation are not supported. Benchmark data has a sibling repository; local MCP data uses one `~/.agentbase` root |
| 13 | Published projection, query diagrams and static Domain site are implemented; model/domain qualification remains |
| 14 | Context-layer direction and on-demand Hub Discovery A/B are designed; integration skill and model evidence are not implemented |

MCP protocol modernization (capability 061) implements MCP `2026-07-28` for
negotiated stdio and stateless Streamable HTTP while retaining `2025-11-25`
compatibility; remote OAuth and Tasks remain deployment-driven capabilities.

Model policy is currently a qualification policy only: Initial Ingest
benchmarks use Sol and Refresh uses Terra. It is not a hard-coded MCP runtime rule.

When implementation reveals a broad gap, the project returns to high-level and
low-level review before continuing. A small gap may be grouped into the same
slice, but the documentation must be backfilled before benchmark/PR/commit
completion; working code is not a reason to leave the levels inconsistent.
