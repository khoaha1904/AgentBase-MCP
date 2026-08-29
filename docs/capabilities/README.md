# AgentBase capability contracts

This directory decomposes the 14 high-level decisions in
[`docs/product`](../product/README.md) into capability behavior and low-level
designs that can be reviewed and implemented independently.

[Architecture ownership](../architecture.md) is the shared source map. The
`*-requirements.md` files in the corresponding numbered area hold current
`AB-*` requirements; there is no parallel contracts tree.

## Organization

- Each high-level section maps to exactly one directory numbered 01 through 14.
- The directory's `README.md` holds scope, the high-level link and the child
  design index.
- Each child file addresses one technical boundary without repeating the
  product decision.
- A child file may be a current design, implemented baseline or deferred design;
  its opening status must say which.
- Superseded historical designs remain traceable but must not be described as
  the current baseline.

## Baseline-first principle

Technical design does not redesign AgentBase from scratch. Every section must
start from two sources:

1. **High-level decision** is the current authority and defines the product
   outcome approved by the owner.
2. **Implementation baseline** consists of the current AgentBase-MCP/Hub code,
   schema, tests and documentation.

Before proposing a change, the design section must state:

- what the system already does and which components can be reused;
- the gap between the baseline and the high-level decision;
- what remains unchanged, what changes and the minimum addition required;
- the affected compatibility, migration, failure/recovery and verification.

When the baseline differs from the high level, record the difference as a gap
for review. Do not silently change the product decision, assume current code is
absolutely correct or expand the work into an out-of-scope rewrite.

## Impact checkpoint

Every section classifies its expected baseline impact:

- **Reuse:** the current implementation already fits or needs only wiring/
  documentation.
- **Contained change:** the change stays within a clear boundary.
- **Broad change:** the change affects multiple subsystems, schemas or a
  migration.
- **Near rewrite:** the current high level requires replacing most of the
  baseline.

`Broad change` or `Near rewrite` must be reported to the owner before deeper
design continues. The report identifies affected code, the reason, reusable
parts and at least one scope-reduction option.

If baseline review reveals a real constraint, important limitation or a better
existing design, the Agent must propose a high-level adjustment with its
trade-offs. Only after owner approval may it edit `docs/product` and continue
technical design. Do not bend technical design to evade the high level or force
code to match it before the owner sees the impact.

## Lifecycle rule

The mandatory lifecycle, gap classification and completion gate are defined
centrally in [`AgentBase-MCP/AGENTS.md`](../../AGENTS.md). These design documents
keep only the baseline/impact and technical content for each boundary; they do
not create a second process. Every capability must return to that rule before
implementation, benchmark, PR and capability commit.

## Index

1. [Repository reading](01-repository-reading/README.md)
2. [Hub, Domain and Repository model](02-hub-domain-repository-model/README.md)
3. [Concept discovery](03-concept-discovery/README.md)
4. [Schema selection](04-schema-selection/README.md)
5. [Knowledge entry](05-knowledge-entry/README.md)
6. [Cross-repository relations](06-cross-repository-relations/README.md)
7. [Conflicts, Questions and Guidance](07-conflicts-and-questions/README.md)
8. [Observed snapshots and source references](08-live-references/README.md)
9. [Ingest and Refresh](09-ingest-and-refresh/README.md)
10. [Query routing](10-query-routing/README.md)
11. [Review and Publish](11-review-and-publish/README.md)
12. [Version scope](12-version-scope/README.md)
13. [Published visualization](13-visualization/README.md)
14. [Context for AI SDLC workflows](14-ai-sdlc-context/README.md)

## Implementation trace — 2026-08-29

| Section | Low-level status |
|---|---|
| 01 | Lazy graph/source reading and explicit workspace routing implemented; remote clone deferred |
| 02 | Domain/Repository plus single/batch Initial Ingest confirmation implemented; monorepo runtime deferred |
| 03 | Evidence-bearing candidates/guidance implemented; candidate UI remains deferred |
| 04 | Catalog 7 implemented; catalog 6 design superseded |
| 05 | Remote-profile Draft, Published-only query, proposal/template and isolation implemented |
| 06 | Bounded AWS/SQS relation identity and Domain Enrichment runtime implemented; merge/other profiles deferred |
| 07 | Shared Questions, exact Guidance and ordinary correction/removal proposal implemented |
| 08 | Repository snapshot-first, AWS/SQS observations, local freshness report and Hub CI implemented |
| 09 | Single Init/Refresh, Batch Initial Ingest, Domain Enrichment, freshness and CI implemented; Batch Refresh deferred |
| 10 | Published-only snapshot-first query implemented; multi-term ranking, Repository-aware Domain scope and bounded relation results accepted for capability 049; remote read deferred |
| 11 | Reviewable batch publication and exact same-Repository Init/Refresh stack implemented |
| 12 | Terraform/Terragrunt MVP boundary and small `abs` CLI/shared-token connect implemented and verified; provider expansion deferred |
| 13 | Shared Published projection, query diagrams and static Domain site implemented; model/domain qualification pending |
| 14 | On-demand Hub Feature Discovery A/B designed; integration skill and model qualification pending |

MCP protocol modernization (capability 061) is implemented in the protocol
boundary: modern `2026-07-28` stdio negotiation, stateless Streamable HTTP,
legacy `2025-11-25` compatibility, JSON Schema 2020-12 tool inputs and additive
structured results. Remote OAuth and Tasks remain demand-driven.

Current runtime authority lives in `docs/`; `docs/architecture.md` holds system
ownership and `docs/capabilities/` holds capability contracts, while code and
tests are evidence. The active spec holds change
intent only while a capability is being implemented. Design in this directory
explains shape/trade-offs and must be updated when implementation invalidates an
old assumption.

## Original design order

Numerical order is not mandatory. The original dependency order was:

```text
05 Knowledge/storage foundation
→ 02 Hub/Domain/Repository identity
→ 04 Schema model
→ 01 Repository reading
→ 03 Concept discovery
→ 09 Ingest/Refresh orchestration
→ 06 Relations → 07 Conflicts → 08 Observed snapshots
→ 10 Query → 11 Publish
→ 12 Cross-cutting scope check
```

This order is design history, not the current work queue.
