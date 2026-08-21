# Implementation Plan: Single-Repository Initial Ingest

**Branch**: `main` | **Date**: 2026-08-20 | **Spec**: [spec.md](spec.md)

## Summary

Deliver one public Initial Ingest workflow by composing the existing managed
Code Graph, Hub authoring session and proposal inspection boundaries. Replace
the catalog's vendor-shaped, source-less selector with provider-neutral catalog
7.0 plus separated technology detection and concept promotion; add stable Hub
Repository identity resolution and optional bounded observed snapshots. Keep
semantic decisions in the host Agent skill and deterministic authority,
mapping, validation and recovery in MCP/runtime code.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript 5.9

**Primary Dependencies**: Existing `@modelcontextprotocol/server@2.0.0`,
`codebase-memory-mcp@0.10.1` and `yaml@2.9.0`; no new dependency

**Storage**: Existing private graph cache, Hub authoring session/proposal state
and ordinary OKF Markdown; no candidate database or migration store

**Testing**: `node:test` colocated contract/unit/integration fixtures,
skill-contract checks and canonical `npm run verify`; model benchmark remains
opt-in

**Target Platform**: Local Linux/macOS-style Node.js checkout exposed through
the existing stdio MCP server

**Project Type**: TypeScript modular monolith and agent-facing MCP server

**Performance Goals**: One graph session, one bounded Hub match pass, one
schema-guidance call and no more than one validation repair per repository run;
qualified real-run median no greater than 10 minutes

**Constraints**: one authorized local repository; offline canonical gate; no
provider CLI, credentials, remote clone, automatic Accept/Publish, raw graph or
source copy; exact evidence for every attributed claim

**Scale/Scope**: Catalog 7.0 with eight Initial Ingest roles, two enrichment
roles, AWS profile v2 technology classifications, Terraform-family detector v1, one
repository and at most the existing bounded 64 candidate/change envelope

## Constitution Check

- **Evidence Before Abstraction — PASS**: Generic roles come from the approved
  cross-provider design; AWS/Terraform-family mappings retain exact observation and
  profile provenance. No unsupported provider abstraction is added.
- **Local-First Explicit Authority — PASS**: Initial Ingest binds one explicit
  local root. Graph, Hub matching, guidance and validation are local; provider
  CLI, credentials, network publication and hidden retries are excluded.
- **Agent-Navigable Ownership — PASS**: The host skill owns orchestration;
  repository evidence, schema policy and Hub lifecycle remain in their existing
  capability owners and cross through public entrypoints.
- **Cumulative Knowledge — PASS**: Output is sparse, evidence-bearing and
  review-only. Missing evidence cannot delete knowledge; candidate state is
  disposable and no raw graph/source becomes Hub content.
- **Specification and Verification — PASS**: New stable `AB-INGEST-*`,
  `AB-SCHEMA-*`, `AB-CLAIM-005` and `AB-LOCAL-HUB-016` requirements receive
  focused offline tests before behavior becomes current.
- **Dependency/provider/schema gate — PASS**: Catalog 7.0 is an owner-approved
  major clean cutover. AWS/Terraform-family profiles are data/rules inside the current
  runtime; no provider process, credential boundary or dependency is added.
- **Migration/recovery gate — PASS**: Owner confirmed no Published concepts and
  will discard obsolete proposals. No content migration or dual-write path is
  required; prior code commit remains the rollback point until verification.

Post-design re-check: **PASS**. The design adds no constitution exception,
production dependency, daemon, credential access, automatic publication or
irreversible Hub mutation.

## Design Decisions

### 1. Keep the Agent as the semantic loop

Create a concise `agentbase-ingest` product skill that routes the existing
`use-codebase-memory` and OKF authoring rules. It owns the five stages and one
repair budget. Do not add a runtime workflow engine, persistent candidate store
or model integration.

### 2. Separate checkout hints from canonical Hub identity

Refactor repository source discovery to return Git/remote/path hints without
claiming they are the durable Hub identity. Before graph evidence is normalized,
the Hub boundary resolves a strong existing Repository match or assigns the
initial deterministic ID and returns that ID to the run. Accepted Repository
knowledge stores the ID and aliases; later runs match aliases before assigning.

### 3. Separate detection, promotion and rendering

Catalog definitions keep only the small provider-neutral authoring core. One
guidance operation validates candidates and observations, applies one
Terraform-family Detector v1 plus AWS Profile v2 to technology evidence, then evaluates the
caller-visible concept/embedded disposition before returning schema guidance.
Detection never creates a file. Existing list/get and bundle validators remain.

The detector accepts only source-native paths: `.tf`/`.tf.json` for Terraform
and `terragrunt.hcl` for Terragrunt. Terragrunt itself supplies module
orchestration evidence; exact provider resources cite the referenced Terraform
module. No file reading, HCL parser, SAM/CloudFormation detector or new
dependency is added.

### 4. Extend evidence rather than store source

Reuse exact repository source references and live-claim provenance. Add only an
optional bounded `snapshot` on a claim observation; it accepts a small primitive
or identifier plus observed time, rejects unknown fields, large/multiline or
secret-like content, and never changes query-time live-reference semantics.

### 5. Reuse proposal safety, replace obsolete refresh coupling later

Reuse isolated Hub session copy, changed-set validation, finalization,
inspection and protected-content guards. Initial Ingest stops after inspection.
Refresh-only omission deletion and stale reconciliation are not modified in
this slice except where catalog input types must compile; Phase 2 will replace
their behavior under its own requirements.

### 6. Qualify the real workflow, not a one-file-per-resource contract

V15 uses an isolated local-only Hub per run and exercises status/setup,
Preflight, one graph index/architecture pass, evidence-bearing guidance,
prepare, changed-set validation, finalize and inspect. New preparation derives
its evidence digest from validated observations plus exact source state. The
confirmed primary Domain is stored on the Repository relation. The harness
copies only the finalized proposal bundle into benchmark artifacts and rejects
Accept, submit, synchronize or bootstrap calls.

### 7. Make sparse OKF packaging deterministic

Keep concept meaning in the existing catalog schema and reuse the existing OKF
renderer as the document template. During new-proposal preparation, render one
editable skeleton per promoted exact or advisory suggested recommendation plus the required Repository,
confirmed Domain and navigation. Bind type, draft lifecycle, generation data,
repository identity and normalized sources in MCP code; the agent enriches the
Markdown knowledge and supported relations rather than reconstructing YAML.
Embedded recommendations become one searchable source-backed table in their
parent and receive no identity or graph edge. Do not add a second schema system,
template language or authoring database.

### 8. Make promotion intent explicit but non-authoritative

Let the host agent declare concept or embedded disposition and attach one
released provider-neutral `suggested_type` only to a standalone candidate.
Technology mappings remain authoritative metadata but cannot override
disposition. A suggestion produces an editable draft skeleton with a visible
review limitation; embedded knowledge remains in its parent. Neither receives
a confidence score or automatic acceptance/publication authority.

## Project Structure

### Documentation

```text
specs/022-single-repository-ingest/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/initial-ingest-mcp.md
├── checklists/requirements.md
├── checklists/ingest.md
├── quickstart.md
└── tasks.md
```

### Repository files

```text
.agents/skills/
├── agentbase-ingest/                 # public five-stage workflow
├── agentbase-okf/                    # reusable authoring rules
└── use-codebase-memory/              # reusable graph workflow

src/core/knowledge/
├── governance/
│   ├── repository-identity.ts        # canonical ID and alias contract
│   └── live-claims.ts                # optional observed snapshot
└── schemas/
    ├── catalog.ts                    # catalog 7.0 and generic selection
    ├── definition.ts                 # provider-neutral schema shape
    ├── guidance.ts                   # evidence-bearing one-call mapping
    ├── definitions/                  # compact core/enrichment/governance roles
    └── profiles/
        ├── definition.ts
        ├── aws.ts
        └── terraform.ts

src/app/repository-okf/
├── evidence/source-state.ts          # checkout identity hints
└── workflow/                         # bounded outcome/candidate contracts

src/app/codebase-memory-mcp/
└── okf-schema-tools.ts               # guidance MCP contract

src/app/hub-okf/
├── authoring/                         # initial proposal/session binding
├── query/                             # active Hub identity lookup
└── mcp/                               # reviewed tool surface

scripts/checks/check-skills.test.mjs  # public skill workflow contract
docs/contracts/okf.md                 # accepted catalog/ingest requirements
docs/contracts/hub.md                 # canonical Repository identity
docs/PRODUCT.md                       # current Initial Ingest outcome/non-goals
docs/ARCHITECTURE.md                  # ownership routing only if changed
```

**Structure Decision**: Preserve the modular monolith and its existing owners.
Add profile data below schema ownership and orchestration only as a product
skill. Do not create a new application service, generic workflow framework or
profile/provider package while one deterministic in-process mapping call is
sufficient.

## Compatibility and Cutover

- Bump the AgentBase catalog from `6.0.0` to `7.0.0` atomically with definitions,
  guidance, validators, skill instructions and fixtures.
- New AgentBase authoring rejects the retired exact types with replacement
  guidance; unrelated foreign types retain existing open-world behavior.
- Existing unaccepted proposals are regenerated or discarded. No Published Hub content,
  Git history or remote main is rewritten.
- Preserve lower-level Hub Accept/Publish tools but do not call them from the
  Initial Ingest skill. Existing Refresh entrypoints compile against catalog
  7.0 but receive no new product guarantees in this capability.

## Verification Strategy

1. Focused catalog/profile tests prove the core/enrichment split, technology
   detection, promotion/embedding outcomes, version provenance and legacy-type handling.
2. Repository/Hub identity tests prove new assignment, alias reuse, rename,
   ambiguous fork and no path/name-derived reassignment.
3. Evidence/candidate tests prove both qualification gates, exact-source
   binding, optional snapshot limits and partial versus Incomplete outcomes.
4. MCP and Hub authoring integration tests prove one guidance call, one proposal
   preview, one repair ceiling and no Accept/Publish/provider CLI side effects.
5. Skill checks prove stage order, Domain confirmation and explicit stop points.
6. `npm run verify` is the canonical offline gate. V15 first proves the real
   isolated proposal lifecycle with a fake executable, then the representative
   three-run model benchmark occurs only after separate owner authorization and
   usable account confirmation.

## Complexity Tracking

No constitution violation or approved exception.

## Catalog 7.0 simplification

Catalog 7.0 is a clean authoring cutover inside the still-active capability.
No Published concept requires migration. Legacy/foreign types remain readable,
but new Initial Ingest uses only Repository, Domain, System, Component,
Function, Interface, Flow and Resource; Entity and Metric are enrichment-only.

The implementation separates three decisions that catalog 6.0 conflated:

```text
Detect technology evidence → decide promotion → render schema/template
```

Provider profiles classify source resources and retain metadata. They do not
select a standalone schema. Function resources with exact independent runtime
evidence may promote deterministically. Queue/topic/event-bus/table/bucket/
database/host resources default to embedded knowledge attached to a promoted
parent. A caller may propose standalone Interface or Resource only with exact
evidence for a shared contract, cross-boundary use or independent operational,
ownership, lifecycle, failure or security value. Unsupported promotion is
reviewable ambiguity, not a guessed file.

Embedded knowledge is rendered as one bounded human-readable table in its
parent. Rows contain a stable display name, role, provider-neutral kind,
technology metadata and sources; they have no concept identity or graph edge.
EC2/VM evidence becomes hosting metadata. Independently evidenced workloads on
the host become Component concepts; an otherwise opaque host remains a
reference/limitation.

Catalog/version, profile data, guidance, skeleton preparation, MCP schemas,
skills and benchmark expectations change atomically. The benchmark distinguishes
required standalone concepts from required embedded knowledge and must not
reward one-file-per-cloud-resource authoring. V14 prompts/results remain
immutable historical evidence; the next prompt version is V15.

The V15 MVP manifest continues to qualify the pinned Terraform repository only.
Initial Ingest also accepts truthful Terragrunt orchestration evidence. The prior SAM and
mixed frontend/backend fixture, expectations and results remain historical
evidence outside the selectable current suite; no SAM/CloudFormation detector
or parity behavior is added to this capability.

## V15 semantic correction slice

Reuse the existing candidate and observation contract. Add one optional,
bounded promotion record only for standalone `Interface`/`Resource` intent:
an enumerated boundary basis plus exact candidate-owned semantic observation
IDs. Guidance requires both that record and an existing semantic schema match;
structured resource declaration remains technology evidence only. No scorer,
reasoning engine, confidence model or new catalog role is added.

New Domain skeleton rendering derives a `# Systems` list from the System
skeletons already prepared in the same proposal. Existing Domain documents are
left untouched. Flow guidance additionally states that sources must support the
trigger, outcome and described interactions; embedded details remain evidence,
not endpoint identities.

Benchmark scoring retains the current non-exhaustive expectation model but
stores numerator/denominator beside each percentage, emits `null`/`n/a` for a
zero denominator, names unjudged identities in the report and verifies that the
last successful changed-set validation covers every finalized concept. The
single-Lambda Terraform fixture scores processing/schedule knowledge as
embedded and no longer requires a Flow that would manufacture endpoints.

Qualification uses a sequential stability ladder: one probe during correction;
stop on a hard or obvious blocker; otherwise run one identical replica and
compare semantic outputs. Run three is only the existing final-acceptance gate.
Parallel model runs are excluded because shared resource/cache/rate contention
would confound model variance.

Constitution re-check: this slice stays deterministic, local, provider-neutral
and non-destructive. It adds no dependency, credential, migration, process or
network behavior and preserves the 50-test design-level gate.

Constitution re-check: the design remains local-first, evidence-bound,
provider-neutral and non-destructive; it adds no dependency, daemon, network,
credential or publication behavior. The catalog major version is owner-approved
and safe because there is no Published catalog-6 knowledge.
