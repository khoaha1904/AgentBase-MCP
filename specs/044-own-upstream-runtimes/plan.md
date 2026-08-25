# Implementation Plan: Own Upstream Runtimes

**Branch**: `044-own-upstream-runtimes` | **Date**: 2026-08-25 | **Spec**: [spec.md](spec.md)

## Summary

First qualify Codebase Memory `v0.10.8` against AgentBase's current `v0.10.1`
behavior baseline. Then replace the public npm binary dependency with a pinned,
attributed source snapshot and an AgentBase-owned native build/admission path.
Keep the upstream snapshot pristine, apply one explicit parser-profile patch in
a disposable build stage, and retain only 12 accepted grammars. Import the
pinned diagram-design source as an inactive future rendering foundation. Expose
no new tool, skill, daemon or UI in this capability.

## Technical Context

**Language/Version**: AgentBase TypeScript on Node.js `>=24.12 <25`; upstream
Codebase Memory C/C++ built by its pinned Make-based build; diagram-design
Python/Markdown/HTML/SVG source retained but not integrated.

**Primary Dependencies**: Existing MCP SDK and YAML runtime; internally
available npm dependencies; native `make`, C/C++ compiler, Git and platform
system libraries. Remove the `codebase-memory-mcp` npm runtime dependency.

**Storage**: Tracked immutable source inventories under `vendor/`; ignored
staged source and native artifacts under repository `build/`.

**Testing**: Existing Node test inventory, offline upstream inventory/profile
checks, current captured MCP schema fixtures, one supported/unsupported-language
profile fixture, and explicit native qualification on Linux x64 and macOS arm64.

**Target Platform**: Linux x64 and macOS arm64. Other platforms fail closed.

**Project Type**: Local stdio MCP modular monolith with an owned native provider.

**Performance Goals**: No new runtime performance promise. Record build time,
artifact size and graph fixture timings as evidence only; preserve current
bounded process limits.

**Constraints**: No public egress during enterprise install/runtime; no nested
Git histories; no tracked file at or above 100 MB; Codebase Memory snapshot
below 200 MiB; exactly 43 public tools; no automatic build/update at MCP
runtime; no UI/diagram publication.

**Scale/Scope**: One isolated provider-version qualification, two pinned upstream
snapshots, one 12-language provider profile, two native platform lanes and the
current nine-action Code Graph contract.

## Constitution Check

### Before design

- **Evidence Before Abstraction**: Exact upstream commits, package behavior,
  registry audit, source sizes and all-language build wiring were inspected.
  The profile is one concrete overlay, not a generic plugin system.
- **Local-First Explicit Authority**: The owned provider remains local and
  bounded. Installation builds explicitly; ordinary MCP startup never downloads,
  builds, starts a daemon or enables upstream UI/watchers.
- **Agent-Navigable Ownership**: Imported bytes, AgentBase overlay, build tooling
  and runtime admission each have one named directory owner.
- **Cumulative Knowledge**: The migration changes no OKF, Hub, proposal or
  publication behavior.
- **Specification and Deterministic Verification**: Capability 044 owns the
  migration. Canonical verification stays offline; native platform builds are
  explicit retained qualification lanes.
- **Dependency/native approval**: This plan is the owner-visible approval gate
  for removing one production package path and owning its source/native build.

### After design

All gates pass. The only intentional upstream divergence is one versioned
parser-profile patch, applied outside the pristine snapshot. UI and diagram
activation remain separate future capabilities, preventing a migration from
silently becoming a product-surface expansion.

## Design Decisions

### 0. Separate the upstream upgrade from source ownership

Before importing or patching source, capture the current `v0.10.1` public tool
manifest and representative graph/evidence results, then run the same bounded
qualification against pristine `v0.10.8`. Exact provider-schema drift stops
automatic acceptance and is inspected explicitly; meaningful result drift
requires owner review. Accepted correctness fixes become the private-provider
admission baseline before the npm path is removed. Existing AgentBase public
descriptors remain the compatibility owner and are not silently replaced by
new optional upstream fields.

The owned build is then compared with that accepted `v0.10.8` baseline. This
creates two understandable transitions instead of one opaque change:

```text
current v0.10.1 package -> qualified pristine v0.10.8
qualified pristine v0.10.8 -> AgentBase-owned v0.10.8 build
```

The qualification is model-free and focused on tool schemas, representative
supported languages, graph relations, coverage reporting and normalized
AgentBase evidence. A model benchmark is added only if these deterministic
results expose a material authoring-risk change.

### 1. Preserve pristine upstream plus a separate overlay

```text
vendor/
├── README.md
├── codebase-memory/
│   ├── UPSTREAM.md
│   ├── inventory.sha256
│   ├── upstream/                 # selected pristine v0.10.8 bytes
│   └── agentbase/
│       ├── parser-profile.json
│       └── patches/
│           └── 0001-parser-profile.patch
└── diagram-design/
    ├── UPSTREAM.md
    ├── inventory.sha256
    └── upstream/                 # pristine 2.6.5/commit snapshot
```

The import is selective but deterministic: Codebase Memory core source and only
the 12 approved grammar shims/directories are retained; the `graph-ui/`
frontend and its dependency lock are excluded. A small upstream C HTTP/layout
layer remains unchanged because the upstream core build and index supervisor
share it, but AgentBase grants it no HTTP/UI authority. No imported file is
edited in place. A local-source import command regenerates the snapshot and
inventory; it never clones or downloads.

### 2. Apply the profile only in disposable build staging

The build owner verifies the pristine inventory, copies it to an ignored
platform-specific staging directory, applies the single patch, verifies the
resulting profile and calls the upstream build with version `0.10.8`. The patch:

1. compiles only selected grammar shims;
2. registers only selected grammar factories;
3. filters recognized-but-unavailable languages before extraction so they are
   reported as unsupported/skipped instead of generating parse failures; and
4. exposes a deterministic profile identity for admission and diagnostics.

Adding a language is a profile change: add its shim/directory, update the patch
registration and add focused qualification. It is not a new schema or generic
language-plugin framework.

### 3. Build before registration, never on ordinary MCP startup

`./install.sh` retains its current transaction order but expands dependency
preparation:

1. verify Node 24 and resolve the one configured registry authority;
2. run `npm ci` through that configured authority;
3. verify both upstream inventories;
4. build/admit the current platform provider into a staging target;
5. atomically publish the provider artifact/manifest; then
6. install skills and register selected clients as today.

Direct MCP startup with no admitted artifact fails with one actionable local
build instruction. It never invokes a recovery installer or network fallback.

### 4. Admit a source-built artifact, not an npm package

Replace `managed-package.ts` package resolution with an owned-runtime resolver.
The tracked source/profile identity and a generated platform manifest replace
npm lockfile integrity as provider provenance. The existing `EngineIdentity`
shape remains compatible: its `packageIntegrity` value becomes one canonical
source/profile integrity string rather than triggering an unrelated evidence
schema migration. Runtime admission validates:

- provider and reported version;
- upstream commit and pristine source digest;
- parser-profile ID/digest;
- platform and architecture;
- executable file/type/permission and SHA-256;
- captured tool-manifest digest; and
- AgentBase adapter version.

Build output is staged and renamed atomically. A failed build never overwrites
the last admitted platform directory. Runtime does not trust `PATH` or a
user-supplied executable.

### 5. Preserve present behavior and keep future rendering separate

The provider still runs through AgentBase's current short-lived/scoped bounded
adapters, with UI/watchers/daemon/config disabled. The Graph UI frontend is not
part of AgentBase source. The diagram-design snapshot remains inactive; its
default future boundary is static HTML/SVG with no Playwright, browser download,
remote font or URL onboarding.

### 6. Upstream updates are explicit migrations

A future update begins with a local approved upstream checkout. Maintainers
regenerate the pristine snapshot, provenance and notices, try applying the one
overlay patch, inspect conflicts, then run profile and two-platform
qualification. There is no updater, subtree history or implicit merge.

## Failure and Recovery

| Failure | Required result |
|---|---|
| Configured registry is unavailable or a nested install would use another authority | Stop before dependency mutation; never choose a fallback host. |
| Missing Node/compiler/make/Git/system library | Stop preflight; do not touch admitted artifact or client registration. |
| Snapshot/profile drift | Stop before build and identify the mismatched inventory path. |
| Patch no longer applies | Stop as an upstream-migration conflict; never patch imported bytes in place. |
| Compile/probe/schema failure | Remove staging only; preserve prior admitted artifact. |
| Wrong-platform or modified artifact | Reject before provider process startup. |
| Client registration fails after successful preparation | Use the existing skill/registration rollback; keep the valid provider artifact as reusable preparation. |
| Unsupported repository language | Skip/report it; continue supported files without claiming full repository coverage. |

## Project Structure

### Documentation (this capability)

```text
specs/044-own-upstream-runtimes/
├── spec.md
├── research.md
├── plan.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── upstream-runtime-contract.md
├── checklists/
│   └── requirements.md
├── tasks.md
└── verification.md
```

### Implementation targets

```text
vendor/                                      # new immutable upstream owner
scripts/upstream/                            # import, inventory and native build
src/providers/codebase-memory/
├── owned-runtime.ts                         # replaces npm managed-package admission
├── process.ts                               # unchanged bounded process owner
└── ...                                      # current adapter/session owners
scripts/installation/install.mjs             # prepare before registration
src/app/codebase-memory-mcp/                 # current public surface/parity checks
fixtures/codebase-memory-v0.10.1/            # current comparison baseline
fixtures/codebase-memory-v0.10.8/            # accepted upstream/owned contract
docs/design/01-repository-reading/05-runtime-requirements.md
docs/design/12-version-scope/02-installation-requirements.md
docs/design/12-version-scope/07-deferred-capabilities.md
docs/present/12-current-limits-and-open-decisions.md
package.json
package-lock.json
.gitignore
```

**Structure Decision**: `vendor/` owns third-party source and provenance only;
`scripts/upstream/` owns deterministic transformation/build; the existing
provider owns admission and the existing installer owns transaction ordering.
No new runtime layer or product service is introduced.

## Verification Strategy

1. **Version qualification**: compare current `v0.10.1` and pristine `v0.10.8`
   tool schemas plus representative graph/evidence fixtures; stop on unexplained
   material drift, then use accepted `v0.10.8` output as the owned-build baseline.
2. **Static inventory**: exact upstream revisions/licenses, no nested `.git`, no
   missing checksums, no file >=100 MB, only selected grammars, no forbidden URL
   in executable preparation paths.
3. **Profile contract**: all 12 fixture extensions parse; representative omitted
   languages are reported as unsupported/skipped; tool schema stays captured.
4. **Admission/recovery**: success plus source/profile/platform/executable drift,
   missing artifact and interrupted replacement using existing provider tests.
5. **Installer transaction**: preparation precedes mutation; failure preserves
   prior artifact and existing client/skill state.
6. **Canonical offline gate**: `npm run verify`; no model benchmark unless the
   deterministic version gate exposes material authoring risk.
7. **Native Linux lane**: clean source build, provider probe and exact current
   integration fixture on Linux x64.
8. **Native macOS lane**: the same evidence on macOS arm64 with company-approved
   Node 24 and registry.
9. **Closure audit**: update current high/low-level owners, record exact snapshot
   and artifact sizes/timings/identities, then close only after both lanes pass.

## Deliberate Non-Goals

- Supporting all 159 upstream grammars, SQL, Windows or Linux arm64.
- Publishing an internal npm binary package or requiring an artifact registry.
- Starting Codebase Memory UI, daemon, watcher, installer or updater.
- Releasing a Hub UI, diagram skill/tool, PNG/browser renderer or visualization.
- Changing OKF, Hub query, Ingest, Refresh, enrichment or PR workflows.
- Re-running model benchmark solely because provider distribution changed.

## Complexity Tracking

No constitution exception. Vendoring source adds repository size, but the
12-language profile and <200 MiB gate are the smallest self-contained approach
that satisfies enterprise no-public-download and future source ownership.
