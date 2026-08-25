# Implementation Plan: Bundled provider installation

**Branch**: `046-initial-ingest-discovery` | **Date**: 2026-08-25 | **Spec**: [spec.md](spec.md)

## Summary

Split native provider work into two explicit phases. A maintainer-only packaging
command keeps the current pinned-source build and writes one verified immutable
platform bundle. Ordinary `./install.sh` stops compiling and instead verifies,
copies and atomically activates the matching repository-contained bundle before
installing product skills or registering clients.

## Technical Context

**Language/Version**: JavaScript/TypeScript on Node.js `>=24.12 <25`

**Primary Dependencies**: Node standard library and the existing pinned owned
Codebase Memory `0.10.8`; no new package

**Storage**: Tracked release bundles under
`vendor/codebase-memory/artifacts/<platform>/`; active private copies remain
under ignored `build/providers/codebase-memory/<platform>/`

**Testing**: Node test runner with tiny fake executables and isolated filesystem
roots; one opt-in native release preparation per real platform

**Target Platform**: `linux-x64` and `darwin-arm64`

**Project Type**: Local stdio MCP and repository installer

**Performance Goals**: One local bundle copy and bounded identity probe per
changed install; exact reruns avoid provider replacement

**Constraints**: No provider download, source build during ordinary install,
new dependency, updater, daemon, public MCP tool, Windows claim or ambient
binary lookup

**Scale/Scope**: One executable and manifest for each of two release targets

## Constitution Check

### Pre-design gate

- **Evidence Before Abstraction — PASS**: reuses the current artifact manifest,
  source/profile digests and runtime admission; no package framework is added.
- **Local-First Explicit Authority — PASS**: ordinary installation consumes
  repository bytes only and performs no provider network request.
- **Agent-Navigable Ownership — PASS**: the provider continues to own admission;
  installation owns local activation; release preparation remains in upstream
  build scripts.
- **Cumulative Knowledge — PASS**: Hub/OKF state is unaffected.
- **Specification/Verification — PASS**: capability 047 and `AB-INSTALL-032..038`
  updates precede runtime changes and focused recovery evidence is required.

### Post-design gate

PASS. The design changes native lifecycle but adds no dependency or hidden
authority. Tracked binaries are exact manifest-bound release inputs. The build
toolchain remains opt-in for maintainers; runtime still rejects any artifact
whose source, profile, surface, platform or executable identity drifts.

## Project Structure

### Documentation

```text
specs/047-bundled-provider-installation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/installer.md
├── checklists/
└── tasks.md
```

### Source ownership

```text
vendor/codebase-memory/artifacts/
├── linux-x64/
│   ├── artifact-manifest.json
│   └── codebase-memory-mcp
└── darwin-arm64/                 # produced on the company Mac release gate

src/providers/codebase-memory/
└── owned-runtime.ts              # verify any explicit bundle or active copy

scripts/upstream/
├── prepare-codebase-memory.mjs   # explicit source build
└── package-codebase-memory.mjs   # verified release-bundle publication

scripts/installation/
├── provider-bundle.mjs           # select, verify and atomically activate
├── provider-bundle.test.mjs
└── install.mjs                   # one-command user flow
```

**Structure Decision**: Add one installer-owned module and one release packaging
entrypoint. Reuse the existing provider verifier and atomic directory switch;
do not introduce an archive format, package manager, downloader or artifact
registry.

## Implementation Design

1. Refactor owned runtime admission so the same verifier accepts an explicit
   runtime directory. Keep `resolveOwnedRuntime` as the ordinary active-runtime
   entrypoint.
2. Add a local bundle activator that maps only the two supported targets,
   verifies the tracked bundle before mutation, returns no-op for an identical
   valid active copy, stages on the target filesystem and atomically switches.
3. Change `install.mjs` to invoke bundle activation after npm dependency
   preparation and before any skills/client mutation.
4. Add a maintainer packaging command that runs the existing native build,
   validates its output, copies only the current target into tracked artifacts
   and preserves any prior bundle on failure.
5. Package and qualify Linux here. Record macOS as the company-machine release
   gate; the installer remains ready to select it once its two files exist.

## Verification Strategy

1. Focused fake-bundle tests cover selection, exact no-op, corrupt/missing
   rejection, interrupted activation and preservation of the previous runtime.
2. Existing installer transaction test proves dependency → provider → client
   order and zero client mutation after provider failure.
3. Real Linux packaging verifies the patched `0.10.8` executable and manifest.
4. `npm run verify` checks living specs, source integrity, bundle integrity,
   TypeScript, architecture, secrets, all tests and diff hygiene.
5. On the company Mac, run the explicit packaging command once and then the
   quickstart ordinary installer test; no end user repeats that action.

## Complexity Tracking

No constitution violation or architecture exception is required.
