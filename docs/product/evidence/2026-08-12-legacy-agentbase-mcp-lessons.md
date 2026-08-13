# Legacy Evidence: AgentBase MCP Lessons for the MVP

> **Terminology correction (2026-08-12):** Proposal-before-apply, human-content
> preservation and recovery remain useful outcomes, but the single-file
> `OKF.md` examples below are not the Google OKF format. Capability 002 applies
> these lessons at OKF `v0.2` bundle/concept level and does not inherit the
> single-file atomicity claim.

- **Captured:** 2026-08-12
- **Source:** read-only inspection of sibling `agentbase-mcp`
- **Status:** selective legacy evidence; no code is approved for direct porting

## Executive conclusion

The legacy implementation contains several well-tested trust and recovery
mechanisms worth reusing as product lessons. It also provides strong evidence
that correctness machinery alone does not create product value.

An accepted legacy value screen compared raw-repository AI with AgentBase on
four locked questions across one SAM and one Terraform repository. Both arms
passed all four questions with no critical fabrication or major correction,
but AgentBase was slower on both repository pairs and 76% slower overall. The
recorded decision was `stop-component-pivot` before further standalone
lifecycle expansion.

The new MVP must therefore measure time, context size and correction effort for
real agent tasks. Passing schemas and preserving provenance are safety
properties, not sufficient success criteria.

Legacy evidence:

- `specs/evaluations/post-r1b-wave-a-value-screen.md`
- result commit recorded there as `95b1f3b`

## Keep the behavior, not the old architecture

### 1. Intent-aware evidence escalation

The legacy investigation acceptance used a useful routing principle:

```text
contextual question -> reviewed knowledge
structural question -> graph query
implementation detail -> graph location, then bounded source evidence
unsupported question -> stop honestly
```

This avoids a universal “read everything” or “Hub first” sequence. The new
Codebase Memory flow should keep the same economy principle: start with an
architecture/search/trace operation, then read only exact source locations
needed for the answer or OKF draft.

Relevant evidence:

- `specs/evaluations/intent-aware-fresh-agent-investigation-acceptance.md`
- `src/evaluation/intent-aware-investigation-acceptance.ts`
- `tests/evaluation/intent-aware-investigation-acceptance.test.ts`

### 2. Bounded source evidence with exact identity

The old `GetSourceEvidence` contract bound a source ID, commit,
repository-relative path and line range; normalized line endings; bounded
context and output size; rejected unsafe paths; and avoided exposing local
checkout roots.

The MVP does not need to port that reader because Codebase Memory and the host
agent already provide source access. It should retain the output discipline:
important OKF evidence references remain repository-relative, revision-aware
and bounded rather than embedding whole files or machine-local paths.

Relevant evidence:

- `src/modules/source/application/get-source-evidence.ts`
- `tests/application/get-source-evidence.test.ts`

### 3. Preserve human-authored Markdown during regeneration

The legacy service renderer regenerated known managed sections while preserving
unmanaged human Markdown byte-for-byte, including headings inside fenced code
blocks. This directly supports the new protected `Maintainer Guidance` model.

The new implementation should use a much narrower contract: one explicitly
protected section or marker range. It should copy the behavioral tests for
preservation ideas, not port the general service bundle renderer.

Relevant evidence:

- `src/modules/knowledge/domain/service-ingest/service-document.ts`
- `tests/application/reviewable-okf-service-ingest-proposal.test.ts`

### 4. Proposal before mutation

The old lifecycle separated proposal construction from application. An exact
digest bound the reviewed proposal payload, and the apply path rejected stale
base content before mutation.

For the new MVP this can become:

```text
generate proposal file
  -> show diff
  -> validate protected guidance and expected base digest
  -> atomically replace OKF.md
```

There is no need for Hub commits, proposal branches, promotion receipts or
GitHub publication yet.

Relevant evidence:

- `src/modules/knowledge/application/apply-okf-proposal.ts`
- `src/modules/knowledge/infrastructure/git-okf-proposal-applier.ts`
- `tests/hub/git-okf-proposal-applier.test.ts`

### 5. Failure must leave prior knowledge unchanged

Legacy tests injected a later-file replacement failure and proved that earlier
changes were rolled back. They also rejected stale base bytes and concurrent
changes before replacement.

The MVP modifies only one OKF file, so it can provide the same user outcome far
more simply: validate first, write a same-filesystem temporary file, then use
one atomic rename. A failure before rename leaves the old file unchanged.

### 6. Unresolved must remain visible

The old analyzers deliberately retained unresolved deployment identity and
unsupported relationships instead of fuzzy-matching them. This principle is
still valuable for inferred dependencies and future cross-repository links.

The MVP representation can simply use `Open Questions` and maintainer defer
guidance. It does not need the old unresolved/discrepancy schemas or numeric
coverage machinery.

### 7. One disposable end-to-end rehearsal is more valuable than many isolated
contracts

The legacy `local-okf-lifecycle-rehearsal` composed an exact source revision,
proposal, human review, changed evidence, apply and later read inside disposable
Git fixtures. That test exposed real lifecycle defects that isolated suites had
missed.

The new MVP should retain one much smaller rehearsal:

```text
fixture revision A
  -> graph context
  -> generated draft
  -> maintainer correction + defer
fixture revision B or unchanged rebuild
  -> preserved guidance
  -> appropriate question suppression/resurfacing
  -> failed apply leaves prior OKF unchanged
```

Relevant evidence:

- `specs/active/local-okf-lifecycle-rehearsal.md`
- `tests/e2e/local-okf-lifecycle-rehearsal.test.ts`

## Do not carry forward

The following legacy areas solved later-stage Hub and governance problems and
would delay the new MVP:

- service/interaction-specific schemas and sidecar bundles;
- per-claim revisions, evidence-set digests and append-only review ledgers;
- stale deadlines and the complete trust-state taxonomy;
- catalog/index generation and commit-bound Hub reads;
- GitHub proposal publishing, review polling, merge and refresh;
- registry-managed cloning and repository lifecycle;
- bespoke Terraform/SAM/CDK analyzer families where a selected graph engine can
  provide the first navigation layer;
- multi-file proposal locks, receipts and rollback orchestration;
- exact-clean-worktree as a prerequisite for ordinary source analysis;
- broad MCP tool inventory and viewer UI.

The old clean-worktree rule is particularly unsuitable for Part 1. Coding
agents often operate on dirty worktrees. The new system should record commit
plus dirty state and index current authored changes rather than reject normal
work.

## Do not repeat these product gaps

### AI authoring was simulated, not proven

The legacy local lifecycle passed AI-authored concepts as explicit test input;
the server did not actually prove an agent could produce a useful first OKF
with low effort. The new walking skeleton must exercise real host-agent
generation.

### Trust depth exceeded demonstrated value

The old implementation correctly handled exact commits, bundle bytes, claim
revisions, review applicability and stale state. The value screen still found
no advantage over direct repository reading. Add governance only when it
protects an observed user correction or recovery case.

### Provider-specific parsing consumed roadmap capacity

The legacy roadmap accumulated Terraform, SAM, CDK, AWS Health and project
adaptation analyzers. The new direction should first reuse Codebase Memory for
general code navigation and add narrow deterministic Terraform/AWS evidence
only after the single-repository OKF loop proves useful.

## Requirements to feed into the next capability

1. Capture actual Codebase Memory outputs before shaping the real adapter.
2. Compare at least one graph-assisted task against direct source exploration
   for elapsed time, context size and correction count.
3. Retrieve bounded evidence by repository-relative location and source state.
4. Generate a proposal before replacing the shared OKF.
5. Preserve one explicit human-owned Markdown region exactly.
6. Treat previous AI text as continuity context, never independent evidence.
7. Keep unresolved items visible and allow defer without rejection.
8. Prove a failed apply leaves the previous OKF unchanged.
9. Run one disposable vertical lifecycle rehearsal.

These are behavioral lessons. No legacy module, schema or test should be copied
wholesale into `agentbase-next`.
