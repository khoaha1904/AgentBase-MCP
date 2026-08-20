# Implementation Plan: Single-Repository Initial Ingest

**Branch**: `main` | **Date**: 2026-08-20 | **Spec**: [spec.md](spec.md)

## Summary

Deliver one public Initial Ingest workflow by composing the existing managed
Code Graph, Hub authoring session and proposal inspection boundaries. Replace
the catalog's vendor-shaped, source-less selector with provider-neutral catalog
6.0 plus evidence-bearing Terraform/AWS profile guidance; add stable Hub
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

**Scale/Scope**: Catalog 6.0 with 22 roles, AWS profile with 6 mappings,
Terraform detector v1, one repository and at most the existing bounded 64
candidate/concept change envelope

## Constitution Check

- **Evidence Before Abstraction — PASS**: Generic roles come from the approved
  cross-provider design; AWS/Terraform mappings retain exact observation and
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
- **Dependency/provider/schema gate — PASS**: Catalog 6.0 is an owner-approved
  major clean cutover. AWS/Terraform profiles are data/rules inside the current
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

### 3. Replace string matching at its owner

Catalog definitions keep only provider-neutral architectural roles. One schema
guidance operation validates evidence-bearing candidates, semantic observations
and structured resource observations, applies Terraform Detector v1 and AWS
Profile v1, then returns complete generic schema guidance. Existing list/get and
bundle validators remain, while source-less `signals` authoring is removed from
the new workflow.

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
    ├── catalog.ts                    # catalog 6.0 and generic selection
    ├── definition.ts                 # provider-neutral schema shape
    ├── guidance.ts                   # evidence-bearing one-call mapping
    ├── definitions/                  # 22 generic roles
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

- Bump the AgentBase catalog from `5.1.0` to `6.0.0` atomically with definitions,
  guidance, validators, skill instructions and fixtures.
- New AgentBase authoring rejects the retired exact types with replacement
  guidance; unrelated foreign types retain existing open-world behavior.
- Existing unaccepted proposals are not converted. No Published Hub content,
  Git history or remote main is rewritten.
- Preserve lower-level Hub Accept/Publish tools but do not call them from the
  Initial Ingest skill. Existing Refresh entrypoints compile against catalog
  6.0 but receive no new product guarantees in this capability.

## Verification Strategy

1. Focused catalog/profile tests prove all 22 roles, AWS mappings, Terraform
   outcomes, version provenance and retired-type handling.
2. Repository/Hub identity tests prove new assignment, alias reuse, rename,
   ambiguous fork and no path/name-derived reassignment.
3. Evidence/candidate tests prove both qualification gates, exact-source
   binding, optional snapshot limits and partial versus Incomplete outcomes.
4. MCP and Hub authoring integration tests prove one guidance call, one proposal
   preview, one repair ceiling and no Accept/Publish/provider CLI side effects.
5. Skill checks prove stage order, Domain confirmation and explicit stop points.
6. `npm run verify` is the canonical offline gate. The representative three-run
   model benchmark occurs only after separate owner authorization and usable
   account confirmation.

## Complexity Tracking

No constitution violation or approved exception.
