# Expert Review Evidence: AgentBase MVP

> **Terminology correction (2026-08-12):** The original review used one draft
> `OKF.md` as shorthand before the official Google OKF source was checked.
> Capability 002 supersedes those single-file examples with a conformant OKF
> `v0.2` bundle of linked concepts. The recommended small graph -> draft ->
> guidance -> rebuild loop remains applicable.

> **Provider ownership update (2026-08-12):** The owner later rejected the
> temporary user-supplied binary boundary. AgentBase now owns exact official npm
> dependency `codebase-memory-mcp@0.10.1`; its maintained wrapper performs
> verified platform bootstrap without global installation or `PATH` reuse.

- **Captured:** 2026-08-12
- **Status:** Independent review synthesis; proposed MVP boundary
- **Review lenses:** developer-tool product experience, technical architecture,
  and AI knowledge/review workflows

## Consensus

The product direction is coherent and feasible. Its strongest premise is the
intentional asymmetry between two parts:

- local Code Intelligence is cheap, fast and rebuildable;
- OKF synthesis is AI-assisted, provisional and improved through use;
- review and enrichment are where knowledge converges toward correctness;
- cross-repository and cloud evidence are valuable but should follow a proven
  single-repository loop.

The largest risk is not the architecture itself. It is building graph
abstractions, a universal observation platform, a knowledge state machine and a
hub before one user can create and improve one useful OKF file.

## Recommended MVP promise

> On one local repository, an agent can retrieve a small relevant code context,
> generate one useful draft `OKF.md`, preserve a maintainer correction or defer
> instruction, and rebuild without repeating the same mistake.

Product language should continue to describe two parts. Internal capability
boundaries must not become separate products, workflows or screens.

## Minimum end-to-end experience

1. The user selects one local TypeScript repository.
2. AgentBase uses one pinned, compatible Code Intelligence engine to index or
   refresh it and reports concise status.
3. The coding agent can obtain a repository overview and a small relevant
   neighborhood for a concrete question.
4. The current coding agent, rather than an embedded model SDK, uses the graph,
   README/docs and targeted source evidence to create `OKF.md`.
5. The draft contains repository purpose, main components, important technical
   flows, external dependencies, important evidence and open questions.
6. The user can correct guidance and defer an uncertain item.
7. A rebuild shows a diff, preserves human guidance, uses new source evidence
   and does not treat the previous AI draft as new evidence.
8. A failed rebuild leaves the previous usable OKF unchanged.

## Minimal OKF ownership model

The first format needs only two ownership classes:

1. **Replaceable generated draft** — AI-generated sections may be rewritten or
   removed as evidence changes.
2. **Protected maintainer guidance** — human corrections, confirmed facts and
   defer/ignore instructions are preserved across rebuilds.

The Markdown should have a small frontmatter block for format version,
repository identity, source revision, dirty state and provider version. Stable
identifiers are initially required only for review questions or guidance that
must be referenced across rebuilds, not for every sentence.

Suggested conceptual shape:

```markdown
---
format_version: 1
repository: example
source_revision: abc123
worktree: dirty
provider: codebase-memory-mcp@0.10.1
status: draft
---

# Summary
# Components
# Important Flows
# External Dependencies
# Open Questions

# Maintainer Guidance
<!-- Generator must preserve this section. -->
```

This is evidence for a later contract, not a finalized file schema.

## Minimum invariants worth enforcing

Only a small set of strict rules is justified before MVP:

1. raw graph data remains local and disposable;
2. an important claim either references source evidence or is visibly an
   inference/open question;
3. rebuild never overwrites maintainer guidance or confirmed facts;
4. previous generated prose is continuity context, not independent evidence;
5. absence of a new observation does not delete maintainer-confirmed knowledge;
6. old generated draft claims may be corrected or removed;
7. basic build reads no credentials and runs no AWS/Terraform command;
8. a failed rebuild cannot corrupt the previously usable OKF.

These protect recovery and trust without requiring semantic perfection from
the first draft.

## Technical correction: do not force the fake graph shape onto the real engine

The current foundation contract proves provider neutrality and deterministic
behavior, but its complete `repositoryMap` should not automatically become the
real-engine adapter requirement. A large Codebase Memory index may contain
millions of nodes, while the engine's intended query surface emphasizes
architecture summaries, paginated search and bounded trace queries.

The next provider work should first capture actual version-pinned outputs for
the representative fixture. AgentBase can then keep, amend or supersede the
foundation demonstration contract using evidence. It should not load or
serialize an entire real graph merely to resemble the fake.

Likewise, the MVP should not build an installer, updater, custom watcher or
multi-version process manager. Start with an explicitly configured compatible
engine, validate its version and fail clearly on mismatch. The distribution
experience can be improved only after the OKF loop proves useful.

## Cut from the MVP

- multi-repository hub and automatic reconciliation;
- Terraform/Terragrunt plan or state collection;
- AWS CLI and credentials;
- frontend/backend business-feature linking;
- GUI or GitHub App;
- multiple graph engines or provider parity;
- comparison benchmark against an alternative engine;
- custom background daemon and advanced scheduling;
- installer, updater and rollback across platforms;
- embedded model SDK, model credentials and provider orchestration;
- universal observation schema;
- numeric confidence scoring;
- per-claim accept/reject and a full lifecycle state machine;
- concurrent Git proposal/merge governance.

Cross-repository relationships remain in the vision. The first later experiment
should match one explicit external identifier across two repository OKFs and
emit a candidate link, not attempt universal AWS identity resolution.

## Product risks to measure

### Graph exists but gives no visible value

Measure whether a real coding question retrieves a small relevant context, not
whether indexing merely completes.

### OKF becomes a long stale README

Include only knowledge that helps an agent or teammate decide or act. Avoid
restating every code structure.

### Governance delays usefulness

Require only protected human guidance and non-destructive rebuild initially.
Add states when a real user action requires them.

### Old AI output reinforces itself

Never increase confidence because a generated statement survived multiple
files or rebuilds. Only new source evidence or explicit human guidance can
strengthen it.

### Review becomes another large job

Prioritize corrections and high-impact questions. Do not ask a user to accept
hundreds of low-value claims.

## Recommended delivery order

```text
time-boxed real-engine output spike
  -> real repository overview and relevant context
  -> single-repository OKF draft
  -> protected maintainer guidance and defer behavior
  -> non-destructive rebuild with diff
  -> dogfood on two or three repositories
  -> one static cross-repository identifier experiment
  -> hub-wide enrichment and cloud confirmation
```

The next capability should be a narrow walking skeleton, not a complete Phase 1
platform. Planning may cover provider/process risk, but implementation approval
must explicitly exclude automatic installation, global configuration mutation,
credentials and background daemon management.

## MVP acceptance evidence

- A real graph query answers one representative coding task without broad
  repository reading.
- One useful draft `OKF.md` is created during a short agent session.
- The user adds one correction and defers one question.
- An unchanged-evidence rebuild preserves both decisions and does not repeat the
  deferred question.
- New relevant evidence may resurface the deferred question.
- The old AI draft does not become evidence for itself.
- A rebuild failure leaves the prior OKF byte-identical.
- A new agent can use the graph plus OKF to explain the repository without
  rescanning it broadly.

## Sources reviewed

- `docs/product/vision.md`
- `docs/product/evidence/2026-08-12-owner-product-model.md`
- `docs/ARCHITECTURE.md`
- `docs/roadmap.md`
- `docs/specs/project-foundation.md`
- the existing provider-neutral contract and foundation tests
- Codebase Memory v0.10.1 documentation:
  <https://github.com/DeusData/codebase-memory-mcp/blob/v0.10.1/README.md>
