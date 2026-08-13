# Plan: Single-Repository OKF Walking Skeleton

- **Status:** Owner-approved after corrected OKF delta review
- **Feature:** `002-single-repo-okf-walking-skeleton`
- **OKF target:** Google Open Knowledge Format `v0.2`

## Technical context

- Runtime: Node.js `>=24.12 <25` from the accepted foundation ADR.
- Language: directly executed erasable TypeScript with ES modules.
- Static checking: TypeScript `--noEmit`.
- Tests: `node:test` through the existing recursive runner.
- Production YAML dependency: exact `yaml@2.9.0`, wrapped behind the knowledge
  capability according to ADR 0006.
- Managed production dependency: exact `codebase-memory-mcp@0.10.1`; its official
  npm wrapper owns platform selection, checksum verification and package-private
  binary bootstrap.
- AI runtime: the current host coding agent through a repository-local skill;
  no AgentBase model SDK or API key.
- Shared output: conformant `okf/` knowledge bundle.
- Local state: normalized evidence, proposals and recovery manifests under
  `.agentbase/`; provider cache/mirror location selected by the mutation spike.
- Network and credentials: not used by AgentBase runtime or mandatory tests.

## Architecture compliance and deviations

The implementation remains a modular monolith:

- core owns provider-neutral code context, evidence normalization and OKF
  conformance/proposal policy;
- the Codebase Memory provider owns child-process translation only;
- the application owns prepare/validate/diff/apply/recover orchestration and
  repository-local single-writer coordination;
- the root CLI composes public capability entrypoints;
- tests remain colocated with owners, with sanitized external fixtures in the
  explicit fixture area;
- provider-private graph rows and machine-local paths do not enter OKF.

Three owner-visible implementation choices are approved:

1. AgentBase owns the exact provider dependency and never asks the user for a
   binary path or reuses a global installation.
2. Correct OKF `v0.2` support requires YAML parsing and preservation. A small
   maintained dependency is safer than a hand-written general YAML parser.
3. The managed provider uses the upstream npm package's verified bootstrap;
   AgentBase does not duplicate its downloader or invoke native install/config
   behavior.

No broad architecture exception is planned. New capability roots are registered
before source grows. Review budgets change only from measured implementation.

## Capability map

```text
src/
  core/
    code-intelligence/             # overview/task-context public values
    observations/                  # one RepositoryEvidenceBundle model
    knowledge/
      index.ts                     # public OKF bundle lifecycle entrypoint
      okf-document.ts              # YAML/frontmatter and concept rules
      okf-bundle.ts                # reserved files, links, tree digest
      proposal.ts                  # complete proposal and diff model
      directives.ts                # AgentBase guidance extension
      switch.ts                    # bundle switch/recovery policy
      *.test.ts
  providers/
    fake-code-intelligence/        # retained/adapted conformance fake
    codebase-memory/               # exact one-shot process adapter
  app/
    foundation-demo/               # retained foundation demonstration
    repository-okf/
      index.ts
      source-state.ts
      provider-workspace.ts
      prepare-evidence.ts
      workflow.ts
      recovery.ts
      *.test.ts
  cli.ts                           # composition/argument routing only

.agents/skills/agentbase-okf/SKILL.md
fixtures/codebase-memory-v0.10.1/
scripts/module-boundaries.json
scripts/architecture-baseline.json
```

Only cohesive files needed by the tasks are created. Names define ownership,
not arbitrary splitting quotas.

## Dependency direction

```text
src/cli.ts -> app/repository-okf public entrypoint

app/repository-okf
  -> core/code-intelligence public entrypoint
  -> core/observations public entrypoint
  -> core/knowledge public entrypoint
  -> providers/codebase-memory public entrypoint

providers/codebase-memory -> core/code-intelligence public entrypoint
core/knowledge -> core/observations public entrypoint
core/observations -> core/code-intelligence public entrypoint
core/code-intelligence -> Node.js/platform only
```

The provider cannot import knowledge policy. Core cannot import the concrete
provider or application. The YAML library is wrapped by `core/knowledge`; its
library-specific representation does not cross the public entrypoint.

## Phase 0: real provider output and mutation spike

After the exact managed dependency is installed:

1. resolve only the dependency's package-private executable and record package
   integrity, version and executable SHA-256;
2. create an exact disposable copy of the 12-file fixture;
3. record source/Git-visible/cache/process before manifests;
4. invoke one-shot index, architecture, search, trace and snippet operations;
5. wait for every child and temporary worker to exit;
6. capture bounded stdout/stderr, duration and after manifests;
7. sanitize absolute/nondeterministic values into fixtures;
8. choose direct non-mutating indexing or an AgentBase-owned stable mirror
   before any selected user repository is indexed.

The slice stops rather than substituting another version if `v0.10.1` cannot
meet the lifecycle/mutation boundary without disproportionate machinery.

## Code Intelligence and evidence

The complete foundation `RepositoryMap` behavior remains for its fake demo.
Capability 002 adds task-directed operations derived from actual output:

```text
repositoryOverview(repositoryId) -> bounded overview result
relevantContext(task query)      -> ordered evidence result
```

The adapter composes architecture, search and trace calls and retrieves exact
snippets only when needed. `RepositoryEvidenceBundle` binds engine identity,
adapter version, commit, dirty digest, ordered query evidence and deterministic
digest. It is disposable proposal input, not the shared OKF bundle.

## OKF v0.2 producer model

The normative source is `docs/references/open-knowledge-format.md`. AgentBase
uses the interoperable base rather than inventing a replacement:

- `okf/` is the bundle and unit of sharing;
- concept ID is bundle-relative path without `.md`;
- every concept has YAML frontmatter and non-empty `type`;
- root `index.md` declares `okf_version: "0.2"` and provides progressive links;
- an existing `log.md` is consumed/validated as newest-first date-grouped
  history; the MVP producer does not need to generate one;
- normal Markdown links connect concepts;
- unknown types/keys are accepted and preserved;
- broken links warn but do not invalidate the bundle.

AgentBase producer conventions for new content:

- initial concepts use `status: draft`;
- `generated.by` identifies the AgentBase producer and `generated.at` records the
  meaningful content change;
- `verified` is absent until real verification;
- supported claims use `sources` and matching stable footnote IDs; repository
  source code uses normalized `repository://<repository-id>/<path>#Lx-Ly`
  resources without absolute checkout paths;
- only unsupported interpretations that affect an emitted concept,
  relationship or conclusion become `Open Question` concepts;
- initial descriptive types are not a universal ontology.

The accepted fixture creates at least a repository concept, two linked technical
concepts and one question. This is enough to prove progressive navigation and
graph-shaped knowledge without building a large taxonomy.

## Human correction and continuity

Human correction is stored as a normal concept with
`type: Maintainer Guidance`, `generated.by: human:<id>` and a Markdown link to
its subject. A current concept is mutable only when it explicitly has
`generated.by: agentbase/<version>`, `status: draft`, and no human verifier.
Every other concept is conservatively protected and preserved as exact bytes.

If new evidence conflicts with protected knowledge, the agent creates a linked
draft question or alternative concept. It does not edit or erase the reviewed
concept. Previous agent-generated content is supplied separately as continuity
and cannot become provenance by repetition.

AgentBase defer behavior is a documented optional extension under
`agentbase.directive`. It matches a stable directive ID and subject, remains
active until a maintainer removes or reopens it, and is not presented as a
Google OKF base field. Evidence-triggered automatic reopening is deferred.

## Proposal, diff and apply

Preparation byte-copies the current bundle into a workspace under:

```text
.agentbase/proposals/<proposal-id>/bundle/
```

It records state `prepared`, the base tree digest and evidence digest, and grants
the host agent write authority only inside that proposal's `bundle/` subtree.
Successful validation records state `generated` plus the exact generated tree
digest. Base OKF conformance and AgentBase producer rules are separate result
families. Diff reports created, modified, preserved, deleted-AgentBase-draft and
prohibited-deletion files. Any post-validation edit makes the proposal stale.

Apply cannot claim a one-file atomic replacement. It:

1. atomically acquires the repository-local single-writer lock;
2. revalidates current/proposed digests and mutable/protected ownership;
3. copies the complete proposal to a same-filesystem staged sibling;
4. verifies staged bytes;
5. writes exact current/next/backup paths and digests to a recovery manifest;
6. renames current to backup;
7. renames next to `okf/`;
8. verifies, finalizes and releases the lock.

Every declared injected process-interruption checkpoint has a deterministic
manifest-driven restore or finish path. New state-changing work is blocked
until recovery is complete. Cleanup targets only exact AgentBase-owned paths.
The MVP does not claim sudden power-loss durability without fsync of files and
parent directories.

An explicitly diffed AgentBase-generated draft may be deleted so wrong early
knowledge can converge. Protected or ambiguously owned content cannot be
deleted. Concept rename and semantic merge remain prohibited.

## CLI and host-agent workflow

```text
agentbase okf prepare --repo <root>
agentbase okf validate --repo <root> --proposal <id>
agentbase okf diff --repo <root> --proposal <id>
agentbase okf apply --repo <root> --proposal <id>
agentbase okf recover --repo <root>
```

Development composition continues through `node src/cli.ts`. The repository-
local skill teaches concept boundaries, YAML/OKF fields, provenance, links,
continuity and the explicit apply stop. It does not invoke a model itself.

The normal owner experience is prepare, inspect the validated diff presented by
the host agent, then apply. `validate` and `diff` remain callable diagnostics;
`recover` is presented only when an incomplete switch is detected.

## Test strategy

### Mandatory offline evidence

- task-context contract and normalization tests;
- captured-output provider parsing and process failure tests;
- evidence digest/path-safety tests;
- YAML/frontmatter, concept ID, reserved-file and link conformance tests;
- generated/draft/provenance/verification producer-rule tests;
- unknown key/type preservation and broken-link warning tests;
- proposal/tree-digest/protected-concept/owned-draft-deletion tests;
- defer extension tests;
- single-writer and declared directory-switch interruption/recovery tests;
- application flow and disposable lifecycle rehearsal;
- architecture, specification, type and diff checks.

### Opt-in real evidence

- phase 0 provider spike using the managed `v0.10.1` dependency;
- accepted graph query with 100% critical evidence within three files;
- real host-agent multi-concept proposal and guidance/rebuild rehearsal;
- optional graph-assisted/direct-source benchmark arms.

`npm run verify` stays offline. A separate exact-binary command owns the
external prerequisite.

## Benchmark protocol

The same fixture manifest defines task, expected facts and authored files for
both arms. The graph arm starts with the evidence bundle and bounded justified
snippets. The direct arm uses normal repository search/read without graph
evidence. Sessions do not reuse the other arm's answer.

Each arm records elapsed time, presented files/bytes, required facts,
unsupported statements and maintainer corrections to the first bundle. Machine,
agent and source-state metadata keep the comparison honest. The first run sets a
baseline rather than a universal threshold.

## Documentation and living contract

On accepted implementation:

- add `docs/specs/single-repository-okf.md` with implemented `AB-MVP-*` behavior;
- keep `docs/references/open-knowledge-format.md` as the pinned terminology
  source;
- update architecture ownership/provider wording and README/quickstart;
- record conformance, recovery and real rehearsal evidence plus an optional
  benchmark when run;
- close Capability 002 when offline, real-provider and host-agent evidence
  agree; the benchmark is not a release gate.

## Explicit non-goals

- custom downloader, global installation, native provider configuration,
  self-update or account-wide activation;
- MCP registration, persistent daemon, watcher or continuous refresh;
- cloud, Terraform/Terragrunt, cross-repository or Hub behavior;
- GitHub publishing, remote review or product UI;
- fixed universal concept taxonomy;
- generalized analyzer/claim/review ledger;
- attested computation execution;
- deletion of protected or ambiguously owned concepts; concept rename/merge;
- multi-language or alternative-engine comparison.

## Risks and mitigations

- **Provider shape differs from fake:** capture real fixtures first.
- **Managed bootstrap is unavailable or corrupted:** bind the exact npm package,
  verify its private executable identity/SHA and fail closed without `PATH`
  fallback; canonical verification never downloads.
- **Provider writes into source:** block live indexing until spike selects safe
  direct or AgentBase-owned mirror mode.
- **YAML round-trip damages unknown fields:** use a reviewed safe parser with
  duplicate-key, alias/resource and size limits; preserve parsed unknown values,
  while protected documents bypass serialization and retain exact bytes.
- **Agents over-split concepts:** acceptance uses a small minimum and skill
  guidance, not a general ontology.
- **Absent status implies stable:** reject AgentBase-generated concepts without
  explicit `status: draft`.
- **Old verification or ambiguous ownership appears mutable:** only explicit
  unverified AgentBase drafts are editable; every other concept is protected and
  conflicts become separate drafts.
- **Multi-file switch interruption or competing agent:** atomic single-writer
  lock, exact recovery manifest and state-specific injected tests; no power-loss
  durability or single-file atomicity claim.
- **Previous AI output self-reinforces:** continuity stays separate from sources.
- **Deferred question becomes noisy:** keep defer durable until explicit reopen;
  evidence-scoped automatic reconsideration remains later work.
- **MVP grows into a platform:** every task maps to the three accepted stories.

## Implementation sequence

1. Pin and inspect the exact managed provider package and its bootstrap boundary.
2. Run/record the package-private provider output and mutation spike.
3. Select and record the YAML library and safe provider workspace mode.
4. Finalize captured provider fixtures and task-context contract.
5. Register ownership and implement evidence normalization.
6. Implement OKF `v0.2` concept/bundle conformance and producer rules.
7. Implement complete proposal, diff, guidance/defer preservation and recovery.
8. Implement application stages and host-agent skill.
9. Run offline lifecycle and interruption rehearsals.
10. Run real provider/host-agent acceptance and optionally capture benchmark
    arms without blocking release.
11. Update living requirements, verify and close.
