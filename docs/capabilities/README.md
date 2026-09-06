# AgentBase capability contracts

This directory decomposes the eight broader Product Contract outcomes in
[`docs/product`](../product/README.md) into 14 independently reviewable
behavioral boundaries with stable requirements.

[Architecture ownership](../architecture/README.md) is the shared source map. The
`*-requirements.md` files in the corresponding numbered area hold current
normative `AB-*` requirements; there is no parallel contracts tree.

## Organization

- Each capability has one Product Contract owner, while one Product Contract may
  own several capability directories.
- The directory's `README.md` holds scope, the high-level link and the child
  design index.
- Each child file addresses one behavioral boundary without repeating the
  product decision or prescribing feature-specific source changes.
- `*-requirements.md` is normative. Other child pages explain behavior,
  rationale or constraints; a baseline/qualification page is supporting
  evidence and must not silently become implementation authority.
- Concrete modules, packages, functions and file layouts remain with their
  owning source area; durable migration decisions belong in the affected
  Capability Contract.
- A child file may describe a current, implemented or deferred boundary; its
  opening status or area index must distinguish that state.
- Remove superseded designs from living contracts; Git retains their history.
- Each area index routes questions to individual files; qualification evidence is
  explicitly separate from current requirements. Do not preload the whole area.

## Baseline-first principle

Capability design does not redesign AgentBase from scratch. Every section must
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
capability design. Do not bend capability design to evade the high level or force
code to match it before the owner sees the impact.

## Lifecycle rule

The mandatory lifecycle, gap classification and completion gate are defined
centrally in [`AgentBase-MCP/AGENTS.md`](../../AGENTS.md). These capability documents
keep only the baseline/impact and technical content for each boundary; they do
not create a second process. Every capability must return to that rule before
implementation, benchmark, PR and capability commit.

## Index

| Need | Area and responsibility |
|---|---|
| Select source, build/query a private graph | [Repository reading](01-repository-reading/README.md) |
| Resolve identity, Domain home or Profile layout | [Hub, Domain and Repository model](02-hub-domain-repository-model/README.md) |
| Discover candidate knowledge and disclose omissions | [Concept discovery](03-concept-discovery/README.md) |
| Choose concept type and promotion rules | [Schema selection](04-schema-selection/README.md) |
| Author and validate evidence-backed OKF | [Knowledge entry](05-knowledge-entry/README.md) |
| Establish cross-repo relations or bounded provider evidence | [Cross-repository relations](06-cross-repository-relations/README.md) |
| Resolve Questions and retain human Guidance | [Conflicts, Questions and Guidance](07-conflicts-and-questions/README.md) |
| Represent observed values and freshness | [Observed snapshots and source references](08-live-references/README.md) |
| Add repositories or update missing/changed knowledge | [Ingest and Refresh](09-ingest-and-refresh/README.md) |
| Search/read Published knowledge | [Query routing](10-query-routing/README.md) |
| Preview, Publish, synchronize or recover | [Review and Publish](11-review-and-publish/README.md) |
| Install, configure, package, release or qualify | [Version scope](12-version-scope/README.md) |
| Generate a read-only Domain site or diagram | [Published visualization](13-visualization/README.md) |
| Supply context to another AI workflow | [Context for AI SDLC workflows](14-ai-sdlc-context/README.md) |

Choose one area, then use its child index. Normative requirements define behavior;
qualification reports document bounded observations and are read only for an
explicit evidence/benchmark question.

The current [MCP protocol Capability Contract](12-version-scope/09-mcp-protocol-requirements.md)
owns modern stdio negotiation, stateless Streamable HTTP, legacy compatibility,
tool-schema behavior and deferred remote authority. The Architecture Contract
owns only its system boundary.

Current runtime authority lives in `docs/`; `docs/architecture/` holds system
ownership and `docs/capabilities/` holds capability contracts, while code and
tests are validation evidence. Explanatory pages in this directory describe
behavior and trade-offs and must be updated when implementation evidence
invalidates an old assumption.
