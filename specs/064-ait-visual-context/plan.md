# Implementation Plan: AIT useful visual context

**Branch**: `064-ait-visual-context` | **Date**: 2026-08-30 | **Spec**: [spec.md](spec.md)

## Summary

Record a small AIT diagram portfolio and its data-readiness assessment, then add
one workspace qualification script that injects deterministic AWS CLI responses
under the real adapter and prepares an ordinary `hub-3` enrichment proposal.
Accept, submit, external merge and synchronization continue through the existing
Hub workflow as separate observable steps.

## Upstream Contracts

- **Product Contract**: `docs/product/07-ai-sdlc-context.md` — decision-useful
  visuals for Feature Discovery and Task Planning.
- **Architecture Contract**: `docs/architecture/flows.md` — Published Phase 1
  and session-local/revision-bound Phase 2 projections.
- **Capability Contract**:
  `docs/capabilities/14-ai-sdlc-context/07-useful-visual-context.md` and
  `docs/capabilities/09-ingest-and-refresh/07-domain-enrichment.md`.
- **Affected Requirements**: `AB-CONTEXT-VIS-001..008`,
  `AB-ENRICH-015..018`, `AB-QUESTION-003`.
- **Baseline Commit**: `c2fe125d91e6154891e37a8344abc719747ab71c`.

## Technical Context

**Language/Version**: TypeScript/JavaScript on Node.js 24.12

**Primary Dependencies**: existing `AwsCliAdapter`, Hub runtime actions and Node
standard library; no new package

**Storage**: existing owner-private Hub runtime state and Git checkout; no new
durable store or schema

**Testing**: Node test runner plus existing canonical `npm run verify`

**Target Platform**: this workspace's Linux development environment

**Project Type**: modular-monolith MCP/CLI with internal qualification scripts

**Performance Goals**: one bounded STS call and two bounded SQS calls for one
candidate; performance is diagnostic, not an admission criterion

**Constraints**: exact `khoaha1904/hub-3#main` guard; no real owner Hub, secret
read, account scan, public mock flag, automatic merge or schema change

**Scale/Scope**: one Domain, two selected repositories, one queue identity and
one factual Question in this slice

## Constitution Check

- **Evidence Before Abstraction**: pass. The fake is beneath the released exact
  AWS/SQS adapter and does not create a second provider contract.
- **Local-First Explicit Authority**: pass. The script is explicit and bounded;
  normal runtime never invokes it. Remote publication remains owner-authorized.
- **Agent-Navigable Ownership**: pass. Qualification orchestration stays under
  `scripts/qualification`; the application change is one optional adapter
  dependency at the current runtime-actions owner.
- **Cumulative Knowledge Without Implicit Destruction**: pass. Ordinary proposal,
  review, Accept and Publish transitions are reused; failure never deletes or
  silently overwrites accepted knowledge.
- **Specification and Deterministic Verification**: pass. Current contracts and
  numbered capability precede code; focused requirement-linked tests and
  `npm run verify` are required.

Post-design recheck: pass with no exception, dependency, migration, daemon,
schema or architecture-baseline growth.

## Project Structure

```text
docs/product/07-ai-sdlc-context.md
docs/architecture/flows.md
docs/capabilities/09-ingest-and-refresh/07-domain-enrichment.md
docs/capabilities/14-ai-sdlc-context/
├── README.md
└── 07-useful-visual-context.md
scripts/qualification/
├── hub3-sqs-fixture.mjs
└── hub3-sqs-fixture.test.mjs
src/app/hub-okf/query/runtime-actions.ts
specs/064-ait-visual-context/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/qualification-cli.md
└── tasks.md
```

**Structure Decision**: keep workspace-specific fixture identity and target
allowlist outside application runtime in `scripts/qualification`. Reuse the
existing runtime action composition with a single optional injected
`AwsCliAdapter`; production/default construction still creates the real adapter.

## Implementation Decisions

| Concern | Choice | Rationale and trade-off |
|---|---|---|
| Diagram portfolio | Contracts and benchmark admission rules only in this slice | Phase 1 can reuse current packets; Phase 2 packet needs a later focused implementation |
| Fake boundary | Inject `AwsCliAdapter` into the existing runtime action composition | AgentBase downstream behavior stays identical and receives no mock flag |
| Fixture orchestration | Script prepares one ordinary proposal; existing CLI performs inspect/Accept/submit/sync | Keeps governance transitions explicit and independently recoverable |
| Target safety | Exact repository/branch allowlist before any authoring call | Prevents accidental fixture publication to the real Hub |
| Question policy | Candidate targets only the factual provider Question; answers array is empty | Automatic provider evidence resolves only what it proves; ownership remains open |
| Migration/recovery | No migration; rerun only from unchanged Published base after clearing/using normal recoverable state | Existing proposal and synchronization recovery remain authoritative |

## Validation Mapping

| Requirement | Implementation surface | Verification evidence |
|---|---|---|
| `AB-CONTEXT-VIS-001..008` | Product/Architecture/Capability contracts | `npm run spec:check`, contract review and retained benchmark follow-up |
| `AB-ENRICH-015` | runtime adapter injection + qualification script | focused test observes bounded runner calls through real adapter |
| `AB-ENRICH-016` | exact target guard in qualification script | wrong repo/branch tests fail before actions |
| `AB-ENRICH-017` | script plus existing Hub CLI transitions | proposal receipt, Accept receipt, PR receipt and synchronized Published commit |
| `AB-ENRICH-018` | one factual candidate with no maintainer answers | fixture test and post-publication Question state inspection |
| `AB-QUESTION-003` | Question renderer and resolution transition | resolved body/missing-evidence regression test and rebuilt Hub validator |

## Complexity Tracking

No constitution violation or complexity exception.
