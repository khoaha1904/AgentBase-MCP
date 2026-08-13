# AgentBase-MCP Session Handoff

- **Prepared:** 2026-08-13
- **Application:** `AgentBase-MCP`
- **OKF repository:** `AgentBase-Hub`
- **Current checkout:** canonical `AgentBase-MCP`
- **Active capability:** None
- **Most recent completed:** `009-lazy-hub-bootstrap`
- **Current state:** lazy optional Hub setup, local-only knowledge and first
  remote bootstrap are implemented and canonically verified
- **Next checkpoint:** owner reviews the completed capability and selects the next slice

## Session checkpoint

The owner provided a more detailed mental model for the two product parts,
incremental OKF buildup, cross-repository AWS/Terraform relationships and a
separate hub-wide review/enrichment phase. It is preserved, together with
technical review corrections, in
[`docs/product/evidence/2026-08-12-owner-product-model.md`](product/evidence/2026-08-12-owner-product-model.md).
The owner then clarified that initial OKF output may be wrong or incomplete and
that review/enrichment, not strict first-build validation, owns convergence.
Accepted parts of that correction are now in the product vision.

Three independent product, technical and knowledge-loop reviews are synthesized
in
[`docs/product/evidence/2026-08-12-expert-mvp-review.md`](product/evidence/2026-08-12-expert-mvp-review.md).
They recommend replacing the long sequential path with a narrow walking
skeleton: real graph context, one repository OKF draft, protected maintainer
guidance and non-destructive rebuild. The owner accepted the recommended product
checkpoint. A later source check found that the single-file examples did not
match Google Open Knowledge Format. Capability 002 now keeps the same small
product loop but expresses it as an OKF `v0.2` concept bundle. Implementation
was approved after a focused delta review corrected draft mutability,
conservative protection, defer, host-agent state, provenance and recovery.

The corrected expert delta and approval interpretation are recorded in
[`docs/product/evidence/2026-08-12-okf-v02-delta-review.md`](product/evidence/2026-08-12-okf-v02-delta-review.md).

The terminology correction and impact are recorded in
[`docs/product/evidence/2026-08-12-okf-terminology-correction.md`](product/evidence/2026-08-12-okf-terminology-correction.md).
The pinned primary-source reference is
[`docs/references/open-knowledge-format.md`](references/open-knowledge-format.md).

Capability 002 is now complete. The real managed integration reached all five
critical facts within three of 12 files and left no standing provider process.
It corrected two assumptions: the Codebase Memory cache must be outside
`CBM_ALLOWED_ROOT`, and boundaries require `get_architecture` with
`aspects: ["all"]`. The host-agent rehearsal created five linked files, applied
one stable human defer, preserved its bytes through rebuild, deleted one
reviewed AgentBase draft and completed explicit apply. Canonical verification
is offline and green. Full evidence is in
[`specs/002-single-repo-okf-walking-skeleton/verification.md`](../specs/002-single-repo-okf-walking-skeleton/verification.md).

Capability 003 is also complete. AgentBase owns exact
`@modelcontextprotocol/client@2.0.0` and now opens one stdio MCP session for one
explicit graph evidence round. Three alternating real fixture pairs preserved
provider/source/fact/path parity, source integrity and clean process cleanup.
Median total time fell from `67073.047ms` one-shot to `14405.099ms` scoped
session (`4.656x`). Scoped session is the default; one-shot remains explicit
rollback and is never an automatic retry. No daemon, watcher, registered MCP or
automatic refresh was introduced. Full evidence is in
[`specs/003-scoped-graph-session/verification.md`](../specs/003-scoped-graph-session/verification.md).

Capability 004 is complete. One AgentBase-owned atomic receipt
binds source, exact engine and opaque graph namespace outside both the checkout
and provider cache files. Exact match skips indexing but retains all queries,
source checks and process cleanup. Missing/changed/forced freshness invokes one
provider index; failed cache reuse tells the caller to use `--refresh` and never
retries invisibly. Exact initial/reuse/add/modify/delete/forced qualification is
green: reuse measured `0ms` indexing and `650.714ms` total versus `3660.121ms`
index and `4373.481ms` total initially. Changed index cost remained near full
fixture cost, so no incremental-latency claim is accepted. Evidence is in
[`specs/004-graph-refresh-reuse/verification.md`](../specs/004-graph-refresh-reuse/verification.md).

Capability 005 is complete. `node src/cli.ts mcp` serves exactly 12 pinned
Codebase Memory-compatible tools through the official server SDK. A connection
starts without a provider, then binds lazily to one absolute repository on
`index_repository`; source persistence/cross-repo authority is rejected and
one exact-root provider child closes with the connection. The concise
`use-codebase-memory` skill delegates graph-first usage without the upstream
global installer or watcher claim. Fresh-process qualification from an
unrelated cwd passed in `14678.579ms`; see
[`specs/005-codebase-memory-mcp-surface/verification.md`](../specs/005-codebase-memory-mcp-surface/verification.md).

The first ordinary-repository exercise indexed `agentbase-next` twice in
`15.110s` and `13.669s`; architecture, search, trace, snippet and coverage reads
completed in tens of milliseconds and every provider child closed cleanly. It
also exposed a valid `detect_changes` bug: the confined provider process had no
system `PATH`, so its shell pipeline serialized `sort: not found` as a changed
file. Bug `mcp-detect-changes-path` now supplies fixed `/usr/bin:/bin` without
inheriting caller path, home or identity values. The real reproduction returns
actual dirty paths, focused tests pass 9/9 and canonical verification passes
138/138. Assessment, fix and verification are under
`.specify/bugs/mcp-detect-changes-path/`.

Capability 006 is complete. Codebase Memory remains the sole detailed graph
authority; `observe` is a separate explicit evidence action and never creates
OKF. The MCP keeps its 12 provider tools and adds four AgentBase-owned schema
tools over catalog `1.0.0`: list, read, advisory select and concept validation.
The initial 11-type software vocabulary is sparse and extensible; unknown
Google OKF types remain valid. Real fixture observation returned four queries,
eight facts and three source files with clean cleanup and no OKF side effect.
Canonical verification passes 144/144. Full evidence is in
[`specs/006-explicit-observation-command/verification.md`](../specs/006-explicit-observation-command/verification.md).

Capability 007 is complete, including separately authorized real qualification.
The coding agent orchestrates explicit prepare, Markdown authoring, finalize,
inspect and submit primitives; AgentBase creates one deterministic non-target
branch and PR and has no merge action. Real qualification against the private
Hub selected only `Software Repository` from bounded Codebase Memory evidence,
created PR #3, and left `main` unchanged. The legacy Hub is preserved at
`archive/legacy-hub-2026-08-12`; cleanup is staged in bootstrap PR #2. The run
found and fixed `hub-partial-checkout-auth`, then passed 179/179 canonical tests.
The credential used for qualification was memory-only but broader than the
intended exact-Hub fine-grained scope. Full evidence is in
[`specs/007-agentbase-hub-pr-lifecycle/verification.md`](../specs/007-agentbase-hub-pr-lifecycle/verification.md).

Post-qualification bug `hub-epoch-commit-date` removes the hardcoded
2000-01-01 Git timestamp. Future Hub proposal commits use the immutable proposal
creation time for both author and committer dates, retaining deterministic
recovery without misleading GitHub history. Local Git E2E and canonical
verification pass 180/180. Existing merged history was not rewritten.

The owner corrected the Hub model after Capability 007 qualification.
AgentBase-MCP owns a persistent AgentBase-Hub clone. `new`/`refresh` preparation
remains non-mutating, but reviewed knowledge is accepted first as a commit on
local `main` and is queryable before any PR. Several repository proposals may
accumulate locally; explicit publication selects a safe group for one branch
and PR. After merge, synchronization fetches and rebases remaining pending
commits safely. AgentBase-MCP does not write remote `main` or merge.

A focused read-only audit of the legacy MCP implementation is captured in
[`docs/product/evidence/2026-08-12-legacy-agentbase-mcp-lessons.md`](product/evidence/2026-08-12-legacy-agentbase-mcp-lessons.md).
Retain its intent-aware bounded evidence, human-Markdown preservation,
proposal-before-apply, atomic failure recovery and disposable lifecycle
rehearsal lessons. Do not port its Hub sidecars, claim ledger, GitHub workflow,
provider-specific analyzer estate or broad tool surface.

The owner chose a clean repository because the previous implementation grew
from several changing product ideas and now carries too much accidental
complexity. Do not restart by porting it.

The accepted direction is:

```text
repository source
  -> local detailed Code Intelligence graph
  -> selected, provenance-bearing observations
  -> AI-assisted investigation and human review
  -> cumulative OKF knowledge
```

The first graph is machine-local, detailed, cheap and disposable. Different
machines do not need identical graphs. OKF is the durable shared layer and is
built from higher-level observations, not by publishing the raw graph.

Repeated OKF ingests are cumulative evidence rounds. If one machine observes
`1, 2, 3` and another observes `2, 3, 4`, repeated support strengthens `2` and
`3`; `1` and `4` remain weaker or reviewable. Absence in a later ingest is not
proof of deletion. Existing knowledge must be detached, marked stale or queued
for review only through explicit scoped rules.

## Start here

Read these files fully:

1. `AGENTS.md`
2. `docs/product/vision.md`
3. `docs/ARCHITECTURE.md`
4. `docs/roadmap.md`
5. `docs/specs/project-foundation.md`
6. `docs/specs/single-repository-okf.md`
7. `docs/specs/observations.md`
8. `docs/specs/okf-schema-catalog.md`
9. `docs/specs/agentbase-hub.md`
10. `specs/CURRENT.md`

Read the completed `001-clean-foundation` feature artifacts or reference
documents only when the current decision needs historical evidence.

## Decisions already made

- Build in a new, independent Git repository.
- Keep the old repositories unchanged as historical evidence.
- Follow the agent-friendly architectural principles distilled from AgentDocks.
- Treat Code Intelligence as a provider capability behind an AgentBase-owned
  contract.
- Evaluate Codebase Memory MCP as the leading first engine, pinned to an exact
  tested version rather than tracking every upstream release.
- Allow an independently installed user version to coexist; AgentBase must not
  silently use or replace it.
- Keep AgentBase ownership above the engine: observation selection,
  provenance, confidence, review, re-ingest and OKF lifecycle.
- Demonstrate both a repository map and relevant-neighborhood query first.
- Use a 12-file TypeScript modular-monolith fixture; the accepted query must
  contain all expected evidence within at most three files and produce the same
  normalized bytes across five unchanged runs.
- Own exact dependency `codebase-memory-mcp@0.10.1`; its official npm wrapper
  performs checksum-verified platform bootstrap into package-private storage.
- Own exact `@modelcontextprotocol/server@2.0.0` for the filtered stdio gateway;
  do not hand-write framing or expose the provider's mutation tools.
- Do not request a user path, reuse a global binary, duplicate the downloader,
  invoke native install/update/config, register MCP, start a daemon/watcher or
  discover a provider from `PATH`.
- Use the current host coding agent for OKF synthesis without adding a model SDK
  or model credentials to AgentBase.
- Generate a complete proposed OKF `v0.2` bundle under local AgentBase state,
  show a bundle-level diff and require separate explicit apply to shared `okf/`.
- Use concept-per-file YAML frontmatter, bundle-relative IDs, standard Markdown
  links, root `index.md` progressive disclosure and draft/generation/provenance
  signals from the pinned OKF specification.
- Modify or delete only concepts explicitly owned by an `agentbase/` producer
  and still marked `draft`; protect every other concept byte-for-byte. Represent
  maintainer correction/defer as linked guidance concepts, and treat previous
  generated concepts as continuity rather than evidence.
- Keep defer active until explicit maintainer reopen, use repository-relative
  provenance URIs, and serialize state-changing OKF work through an atomic
  repository-local lock.
- Keep detailed code graphs repository-local while allowing explicit Hub OKF
  proposals to describe selected cross-repository concepts.
- Fix one private AgentBase-Hub repository and remote `main` in MCP
  configuration. `new` and `refresh` prepare locally; reviewed `accept` commits
  to local `main`; a later selected-prefix `submit` creates one branch and PR.
  AgentBase-MCP never merges.
- Keep the dedicated GitHub token memory-only and outside tool/CLI arguments.
  Canonical qualification remains fake/local until a real run is separately
  authorized.

## Decisions intentionally still open

- Managed-provider upgrade/rollback hardening after MVP value is measured; exact
  dependency ownership and no-global-reuse are settled.
- Background refresh scheduling, cache repair/generations and ordinary-
  repository resource thresholds; explicit source identity and `--refresh`
  recovery are settled.
- Large-repository latency, memory, context-reduction and correction thresholds;
  the accepted fixture benchmark only establishes lifecycle evidence.
- Claim-scoped evidence identities and long-term Hub review/retention policy;
  the GitHub repository/PR storage boundary is now settled.
- Final AgentBase concept taxonomy beyond the small descriptive MVP types; OKF
  itself intentionally leaves types open.
- Which legacy behavior, if any, is worth reimplementing after the first slice.

Node.js 24 with directly executed erasable TypeScript and `node:test` is
accepted by ADR 0004. Capability 002 adds exact production dependencies
`codebase-memory-mcp@0.10.1` and `yaml@2.9.0`.

Do not turn these into hidden implementation assumptions. Resolve them in the
active specification using evidence and owner-visible outcomes.

## Repository boundaries

The sibling repositories `../agentbase-mcp`, `../agentbase-docs` and
`../agentbase-hub` contain the previous implementation and valuable tests, but
also large uncommitted working trees. They are read-only references for this
rebuild unless the owner explicitly changes scope.

The separate `/home/khoa/workspace/AgentDocks` repository inspired the
architecture. Its relevant patterns are recorded locally in
`docs/references/agentdocks-architecture.md`, so normal sessions do not need to
access a project outside this workspace.

Reusable Capability 002, 003 and 004 lessons were also captured for owner review in sibling
`/home/khoa/workspace/agentstack/docs/patterns/`: the existing Open Knowledge
Format pattern now records proposal/protection/recovery policy, and the managed
native provider boundary records package-owned distribution, admission, cache
isolation, process containment and real-integration evidence. These entries are
candidate patterns, not automatic mandates for future repositories.

## Next action

Capability 009 is complete. Its product direction is: install only the one global
token; keep Code Graph independent; ask for existing-vs-new Hub only when OKF
first needs one; allow a local-only base plus knowledge history; and bootstrap
a user-created empty GitHub repository under one explicit mode. AgentBase-MCP
does not create GitHub repositories. Do not
fragment cohesive files merely to satisfy architecture metrics: split only
across distinct responsibilities, otherwise retain one exact owner-reviewed
non-growing mark.

The official private repositories and local clones are
`khoaha1904/AgentBase-MCP` and `khoaha1904/AgentBase-Hub`. Codex has one enabled
`agentbase` STDIO entry; client registration remains deliberately deferred in
the installer contract. The dirty legacy Hub and historical repositories remain
untouched references.

Root `install.sh` now prepares dependencies and offers Codex/Claude Code
multi-selection, while truthfully reporting registration as deferred and
editing neither client. Optional Hub-token entry masks each character and
writes one atomic owner-private global credential. Runtime prefers an explicit
process token and otherwise admits that file. Tests cover paste, Backspace,
interruption, non-interactive behavior, permissions, symlinks, malformed files,
preservation and precedence.

The owner merged [AgentBase-Hub PR #4](https://github.com/khoaha1904/AgentBase-Hub/pull/4).
Explicit synchronization recognized proposal `73420160d16893b75470d1f2`,
advanced local Hub `main` to remote merge head
`9fcb2aec8790fcfe31f30354c09ac51a0d65fc92` and left zero pending proposals.
Local search no longer returns the qualification-only `agentbase-next` subject.
No token value or legacy `.env` was read.

Capability 009 implementation artifacts live under
`specs/009-lazy-hub-bootstrap/`; its living requirements are
`AB-HUB-SETUP-001..017` in `docs/specs/agentbase-hub.md`.
