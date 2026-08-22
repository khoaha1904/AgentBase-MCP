# Implementation Plan: Domain Enrichment

**Branch**: `main` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Add one Domain-scoped authoring workflow that reads exact Published Hub
knowledge, verifies explicitly selected AWS SQS candidates through a bounded
CLI adapter, reconciles identity/relation/Question outcomes and locks one atomic
multi-repository proposal. Reuse existing Question rendering, OKF validation,
inspection, Accept and publication mechanics; extend proposal scope honestly
instead of inventing a source Repository. No concept merge is implemented.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript 5.9

**Primary Dependencies**: Existing standard library, YAML parser and Git-backed
Hub; external AWS CLI is optional user-managed runtime, not a package dependency

**Storage**: Existing Hub Markdown/Git plus private atomic JSON run state under
the current MCP state root; raw provider responses are memory-only

**Testing**: One existing design-level end-to-end case is expanded with a fake
AWS process boundary; canonical suite remains 50 tests

**Target Platform**: Local stdio MCP server on supported Node.js hosts with an
optional installed AWS CLI v2 session

**Project Type**: Modular-monolith MCP server with one provider adapter

**Performance Goals**: Sequential processing of at most 64 selected candidates;
one visible attempt per candidate, bounded response/time and no background work

**Constraints**: Published-only baseline; exact account/region; no shell,
arbitrary argv, account enumeration, credential access, hidden retry, accepted
mutation before Accept or provider mutation

**Scale/Scope**: One Domain, 1..32 Published repositories, 1..64 exact
candidates/Questions, AWS STS preflight and SQS exact-resource verification v1

## Constitution Check

- **Evidence Before Abstraction**: Release concrete STS/SQS profiles from typed
  fixtures before a provider-neutral runner. External identity remains a small
  core envelope; AWS parsing stays in the adapter.
- **Local-First Explicit Authority**: Ordinary Ingest/Refresh/query remains
  offline. Enrichment runs only after an explicit provider-session confirmation
  and never reads or stores credentials.
- **Agent-Navigable Ownership**: core owns identity/observation/proposal values;
  `providers/aws-cli` owns process and AWS protocol; `app/hub-okf/enrichment`
  owns orchestration; existing review/publication boundaries remain owners.
- **Cumulative Knowledge**: provider disagreement and missing access preserve
  accepted knowledge as Questions/limitations. No implicit deletion or merge.
- **Specification and Verification**: AB-ENRICH-001..010 map to provider
  conformance and one deterministic disposable-Hub E2E before external smoke.

Full Feature escalation is required because this adds a provider, external
process/session authority, multi-repository proposal scope and recovery state.
No dependency, daemon, migration or architecture exception is introduced.
Post-design re-check: pass.

## Design Decisions

1. Add `src/app/hub-okf/enrichment/` as the workflow owner. Do not overload the
   single-repository authoring session or build a generic batch engine.
2. Add `src/providers/aws-cli/` with two released profiles only:
   `aws.sts.caller-identity@1` and `aws.sqs.queue@1`. The latter resolves one
   exact known queue name/owner/region and reads its allowlisted attributes.
3. Spawn the fixed `aws` executable directly with `shell:false`, fixed argv,
   pager/prompt disabled, bounded bytes/time and inherited user session. Tool
   input cannot select executable, command, flags, profile/config or output path.
4. Private `EnrichmentManifest` binds exact Hub head, Domain/repositories,
   candidate/Question revisions, confirmed account/regions and profile versions.
   Atomic checkpoints are rebuildable workflow state, not Hub knowledge.
   The head is the admitted remote Published base, not local `main` when it has
   pending accepted commits; preparation reads an isolated exact-base tree.
5. The first tool prepares and previews a manifest without provider access. A
   second explicitly confirmed call preflights account and verifies every exact
   candidate sequentially. No automatic retry occurs.
6. Exact SQS ARN/account/region verifies deployed identity. Canonical relation
   creation additionally requires Published interaction evidence already bound
   to the candidate; provider identity alone produces identity/Question output.
7. Normalized observation keeps queue ARN/URL identity plus only
   `VisibilityTimeout`, `MessageRetentionPeriod` and
   `ReceiveMessageWaitTimeSeconds`, canonical digest and observed time. Raw
   stdout/stderr is discarded after parsing and never written to diagnostic state.
8. Question tier classification is deterministic policy. Tier 1 can propose a
   factual transition from exact evidence; Tier 2/3 decisions bind exact Question
   revision and only selected human answers reuse current Guidance rendering.
9. Membership revision creates a new manifest revision, invalidates dependent
   outcomes and reuses only outcome digests whose inputs remain exact. Finalize
   refuses dangling changes rather than asking runtime AI to invent repairs.
10. Extend proposal/local-pending metadata with a discriminated `enrichment`
    scope containing Domain and Repository IDs. Existing `new`/`refresh` trailers
    remain readable; Enrichment publishes as one independent PR to Hub `main`.
11. Strong duplicate identities are reported as Question/candidate only. The
    redirect/query/migration design in Part 06.05 is explicitly deferred.
12. Add no benchmark model prompt in the implementation slice. Qualification
    starts only after deterministic E2E and an owner-authorized real AWS smoke.

## Provider and Process Boundary

```text
host skill / agent
  → prepare_domain_enrichment (local Published Hub only)
  → user confirms existing AWS session/account/regions
  → run_domain_enrichment (fixed released profiles, sequential)
       → providers/aws-cli (fixed argv, no shell, bounded output)
       → normalized safe observations / limitations
  → finalize_domain_enrichment (exact decisions + manifest revision)
  → ordinary Inspect → Accept → Submit PR
```

The process inherits the user's already established AWS session without MCP
enumerating environment variables or logging the spawn environment. It never
enables debug output. Account mismatch stops before SQS access.

## Project Structure

```text
src/core/knowledge/governance/
├── external-identities.ts
└── provider-observations.ts

src/core/hub/
└── proposal.ts

src/providers/aws-cli/
├── index.ts
├── process.ts
├── profiles.ts
└── adapter.ts

src/app/hub-okf/enrichment/
├── manifest.ts
├── reconciliation.ts
└── workflow.ts

src/app/hub-okf/mcp/
├── mcp-tools.ts
├── mcp-tool-call.ts
└── mcp-tool-actions.ts

src/app/hub-okf/{review,publication}/
└── existing scope/summary paths extended for enrichment

.agents/skills/agentbase-domain-enrichment/
└── SKILL.md
```

**Structure Decision**: Add one application capability and one concrete provider
adapter. Reuse core document/proposal validation and current Hub lifecycle;
avoid generic cloud, resolver, batch or credential layers.

## Living Design Changes

- Add `docs/design/06-cross-repository-relations/07-runtime-requirements.md` as
  the stable AB-ENRICH requirement route and link it from the Part 06 index and
  `docs/README.md`.
- Update Parts 06.02–04, 07.06, 08.06, 09.07 and 11.08 from designed/deferred to
  the exact implemented AWS/SQS slice; keep concept merge and other providers
  visibly deferred.
- Update `docs/design/00-architecture.md`, the presentation status lines and
  deferred registry only after behavior passes the offline gate.

## Benchmark Checkpoints

1. **Do not benchmark during contract/provider construction.** Use focused fake
   profile checks only.
2. **Mandatory stop after deterministic disposable-Hub E2E and `npm run verify`.**
   Report the implementation result and ask the owner before touching real AWS.
3. With approval, run one narrow read-only AWS smoke against exact user-selected
   account, region and queue. This is provider evidence, not a model benchmark.
4. Stop on any hard protocol/safety/lifecycle defect. If the smoke returns one
   valid reviewable Enrichment proposal, ask before model-backed qualification.
5. Model qualification is sequential: one probe; one identical replica only if
   the probe is valid without a clear blocker; third run only for final acceptance.
6. Every report separates OKF/MCP defects from benchmark harness/scorer defects
   and compares improvements plus new regressions against the previous run.
7. Do not rerun Initial Ingest qualification unless implementation changes its
   observable behavior; this plan forbids such a change.

## Complexity Tracking

No constitution exception. Proposal scope changes are broad but required to
represent a Domain/multi-Repository unit honestly; a fake Repository ID would
be smaller code with an incorrect product contract.
