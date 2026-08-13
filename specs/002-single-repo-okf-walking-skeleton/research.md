# Research: Single-Repository OKF Walking Skeleton

- **Date:** 2026-08-12
- **Scope:** first real Codebase Memory boundary, host-agent OKF `v0.2` bundle
  authoring, human guidance and benchmark design

## Product route

**Decision:** Build one vertical loop before a general observation platform or
Hub: real graph evidence -> host-agent proposal -> maintainer guidance -> safe
rebuild.

**Rationale:** Product, technical and knowledge-loop reviews agreed that the
largest risk is platform construction without demonstrated user value. The
legacy implementation also produced correct answers but was 76% slower than
direct repository reading in its accepted value screen. This capability must
therefore measure context and correction effort, not merely validate schemas.

**Evidence:**

- `docs/product/evidence/2026-08-12-expert-mvp-review.md`;
- `docs/product/evidence/2026-08-12-legacy-agentbase-mcp-lessons.md`;
- `docs/product/evidence/2026-08-12-owner-product-model.md`.

## Provider version, distribution and lifecycle

**Decision:** AgentBase owns exact runtime dependency
`codebase-memory-mcp@0.10.1` and uses only its package-private native executable
through ordinary one-shot CLI commands. Users never provide a binary path.

The pinned upstream README documents that one-shot CLI mode does not start or
connect to the coordination daemon, register a daemon session, or leave a
watcher/UI process. It also documents an exact-build admission barrier and
per-project locks. `index_repository` may start one supervised temporary worker,
which exits before the command completes.

Official evidence:

- <https://github.com/DeusData/codebase-memory-mcp/blob/v0.10.1/README.md#cli-mode>;
- <https://github.com/DeusData/codebase-memory-mcp/releases/tag/v0.10.1>;
- <https://github.com/DeusData/codebase-memory-mcp/blob/v0.10.1/LICENSE>.

The official npm wrapper is a small package with `bin.js`, `install.js` and a
postinstall hook. Inspection with `npm pack --ignore-scripts` confirmed that the
installer selects the current platform/architecture, downloads the release
archive over HTTPS, bounds redirects and checksum-manifest size, verifies the
archive against `checksums.txt`, allowlists archive members, extracts only the
native executable, validates `--version`, and publishes through a staged rename.
Linux uses the portable release asset. The shim makes one package-owned recovery
attempt if install scripts were disabled and the native file is missing.

AgentBase pins npm integrity in its lockfile, records the reported engine
version and native executable SHA-256, and never claims version text alone proves
provenance. It resolves the dependency package directly rather than searching
`PATH`. Provider upgrades happen only through a reviewed AgentBase dependency
and lockfile change.

**Alternatives considered:**

- **MCP/daemon integration:** better for later continuous refresh, but inherits
  shared lifecycle, watcher and exact-cache-root coordination before the first
  product loop proves value.
- **Custom AgentBase downloader/store:** duplicates a security-sensitive
  platform installer already maintained and shipped by the pinned provider.
- **Embed every platform binary in the AgentBase package:** avoids first-install
  download but greatly enlarges distribution and complicates platform releases.
- **Discover from `PATH`:** convenient but cannot guarantee the reviewed version
  and may collide with an independently managed installation.

## Provider mutation spike

**Decision:** The first implementation task runs `v0.10.1` only against a
disposable copy of the 12-file fixture and captures stdout, stderr shape, exit
behavior, cache behavior and before/after filesystem manifests.

The upstream README states that explicit indexing writes or refreshes
`.codebase-memory/graph.db.zst` and may create a `.gitattributes` merge rule.
That behavior conflicts with AgentBase's default of local, disposable, unshared
graphs. Direct indexing of a selected user repository is therefore forbidden
until the spike proves a non-mutating configuration or selects an AgentBase-
owned mirror strategy.

The spike is an implementation discovery task. Dependency bootstrap is now an
approved AgentBase-owned installation step, but no selected user repository is
indexed before disposable-fixture mutation evidence chooses a safe workspace.

**Observed result:** Direct indexing is accepted for `v0.10.1` only with an
explicit owner-private `CBM_CACHE_DIR`, exact `CBM_ALLOWED_ROOT`, deterministic
project name, `mode=fast` and `persistence=false`. The provider-default cache
failed closed with `cache-private`; `XDG_CACHE_HOME` was not its cache override.
The first real adapter integration additionally confirmed that v0.10.1 rejects
a cache nested inside `CBM_ALLOWED_ROOT`; the managed adapter now uses a private
per-user temporary state root outside the checkout.
The accepted run created only private cache/config/log files, left every source
hash unchanged and left zero provider processes after command exit. ADR 0005 and
`fixtures/codebase-memory-v0.10.1/` contain the sanitized evidence.

Each cold CLI query took roughly nine seconds and fixture indexing roughly
eleven seconds on the accepted machine because temporary coordination startup
is paid per command. This is walking-skeleton evidence, not proof of the final
Part 1 latency objective. The MVP will not hide it by silently adding a daemon.

## Provider query surface

**Decision:** Shape the adapter around actual task-directed tools rather than a
complete in-memory graph dump.

The first surface uses only:

- `index_repository` to create or refresh engine state;
- `get_architecture` for the overview;
- `search_graph` for bounded structural discovery;
- `trace_path` for a named call chain (`inbound`, `outbound` or `both`);
- `get_code_snippet` only for exact source evidence selected by the agent.

The official tool list and examples are documented in the pinned README:
<https://github.com/DeusData/codebase-memory-mcp/blob/v0.10.1/README.md#mcp-tools>.

The spike also established response-shape details: structured JSON is present
for search/trace/snippet, architecture overview may arrive only as bounded text,
and snippet `file_path` is absolute and must pass containment before conversion
to a repository-relative reference.

The existing `RepositoryMap` fake contract remains useful foundation evidence,
but it is not allowed to force the real adapter to materialize every provider
node and edge. Capability 002 adds a smaller repository-overview and task-
context surface after inspecting the real response fixtures.

## Local state and repository identity

**Decision:** Evidence and provider caches remain local and ignored by Git.
Source identity is the clean commit plus a deterministic dirty-state digest;
a dirty worktree is accepted.

The implementation spike must decide between direct non-mutating indexing and
an AgentBase-owned stable mirror. It may not clean the worktree, alter user
global configuration or expose absolute checkout paths in evidence. Cache or
mirror paths use repository identity, engine identity and adapter schema.

This now follows the long-term architecture statement that AgentBase manages its
supported provider version. The exact upstream npm dependency owns platform
bootstrap; AgentBase owns dependency selection, identity admission, invocation,
cache/workspace policy and upgrade decisions. A separately installed global
copy can coexist but is never inspected or reused.

## AI runtime

**Decision:** Use the host coding agent through a repository-local skill and
explicit CLI stages; add no model SDK or runtime provider.

Codebase Memory intentionally contains no LLM and expects the coding agent to
translate tasks into graph queries and explanations. AgentBase follows that
shape:

```text
AgentBase prepare -> evidence bundle + proposal template
host agent         -> authored linked draft concepts
AgentBase validate -> generated tree digest + bundle diff -> explicit apply
```

This keeps model identity, credentials and cost in the already-active coding
environment. Offline automated tests use deterministic authored proposal text;
one manual acceptance rehearsal uses the real host agent.

## Open Knowledge Format source correction

**Decision:** Target Google Open Knowledge Format `v0.2` at the pinned source in
`docs/references/open-knowledge-format.md`.

The earlier single-file `OKF.md` design was based on an unverified local
interpretation and is withdrawn. Official OKF is a knowledge bundle directory:
each non-reserved Markdown file is one concept with YAML frontmatter and a
non-empty `type`; concept identity is its bundle-relative path; standard
Markdown links create relationships; `index.md` and `log.md` are reserved for
progressive navigation and chronological history.

OKF is intentionally permissive. `type` values are producer-defined, optional
fields may be absent, unknown fields/types survive, and broken links remain
consumable. AgentBase adds producer rules without claiming they are Google
requirements:

- root `index.md` declares `okf_version: "0.2"`;
- generated concepts explicitly use `status: draft`;
- `generated` records the AgentBase actor/time;
- `verified` is absent until a real verifier confirms the concept;
- `sources` and stable footnote IDs support important claims;
- early types such as `Software Repository`, `Software Component`,
  `Software Flow`, `Open Question` and `Maintainer Guidance` are AgentBase
  conventions.

The shareable output is `okf/`. The complete proposed next bundle lives under
AgentBase-owned ignored state until explicit apply.

**Alternatives considered:**

- **One aggregate Markdown file:** smaller apply surface but not the Google OKF
  concept/bundle pattern and weak for later cross-repository links.
- **Copy the full reference-agent ontology:** would couple AgentBase to BigQuery
  examples and violate OKF's deliberately free-form type model.
- **Adopt every v0.2 optional family immediately:** provenance/generation/draft
  state are useful now; attested computations and richer credibility signals are
  deferred until a real use case exists.

## Human correction

**Decision:** Represent durable correction as a conformant human-authored or
human-verified concept instead of one protected marker range.

A `Maintainer Guidance` concept uses a `human:<id>` actor and links normally to
its subject. Automatic rebuild preserves human-authored and human-verified files
byte-for-byte. New evidence that conflicts with them creates a separate draft or
open question rather than rewriting reviewed knowledge.

After the corrected-format delta review, ownership is intentionally more
conservative: a concept is mutable only when it explicitly identifies an
`agentbase/` generator, has `status: draft`, and has no human verifier. Every
other concept is protected byte-for-byte. This also protects imported or manual
OKF concepts whose producer metadata is absent.

## Defer behavior

**Decision:** Encode an optional machine-readable defer directive as documented
AgentBase extension frontmatter on a `Maintainer Guidance` concept.

The directive carries a stable ID and subject and remains active until a
maintainer removes or explicitly reopens it. A whole-bundle evidence digest was
rejected after delta review because unrelated edits would resurface ignored
questions. Evidence-scoped automatic reconsideration and review ledgers are
deferred.

## Bundle apply and recovery

**Decision:** Bind proposals to the current bundle tree digest and stage a
complete next bundle. Applying a multi-file bundle cannot honestly reuse the
single-file atomic-rename claim.

The implementation separately validates base conformance, AgentBase producer
rules, source/evidence digests and protected concept bytes before mutation. It
acquires an atomic repository-local single-writer lock, materializes a
same-filesystem staged sibling, records exact current/next/backup paths and
digests in a recovery manifest, then switches directories with bounded renames.
Every declared injected process-interruption checkpoint has a deterministic
restore/finish action. Startup recovery must complete before new work. Sudden
power-loss durability is not claimed without an fsync design.

An explicitly diffed mutable AgentBase draft may be deleted so early wrong
knowledge can converge. Protected/ambiguous deletion, rename and semantic merge
remain prohibited.

## Benchmark

**Decision:** Optionally compare one graph-assisted arm with one direct-source
arm on the same representative task and capture:

- elapsed wall time;
- files and bytes presented to the agent;
- manifest-declared required-fact coverage;
- maintainer correction count after the first OKF draft.

The graph-assisted structural gate remains 100% required facts within no more
than three of 12 authored fixture files. The comparison itself does not block
walking-skeleton release; when run, time and correction results are reported,
not gated. A later capability may set thresholds or evaluate another engine.

## SDD tooling fallback

This repository has no `.specify/` installation. Capability 002 therefore uses
the already-established repository-local artifact layout from Capability 001:
`spec.md`, requirement checklist, research, data model, contracts, plan,
quickstart and dependency-ordered tasks. No Spec Kit automation is copied from
the separate AgentDocks repository.
