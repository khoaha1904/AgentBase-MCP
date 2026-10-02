# Release artifact requirements

> Status: Implemented and verified for the source-only `linux-x64` application
> artifact and compact Profile 1.0. Lifecycle, integration and release CI
> consume the artifact boundary unchanged.
>
> Release evidence: Required

Product Contract:
[Scope and authority](../../product/00-scope-and-authority.md)

Architecture Contracts:
[Runtime boundaries](../../architecture/runtime.md),
[State and trust boundaries](../../architecture/state-and-trust.md), and
[Flows](../../architecture/flows.md)

## Boundary

This capability turns one versioned AgentBase-MCP source commit into an
immutable, self-contained archive for one supported host target. It owns build,
artifact composition, reproducibility and artifact-local verification. It does
not install, upgrade, roll back, uninstall, discover, download or grant CI
qualification to releases.

The first release identity is `0.1.0`. The current source tree qualifies only
`linux-x64`, under the existing CI and host qualification boundary.

## Requirements

- **AB-RELEASE-001** — Product version has one checked source constant and must
  equal the root package and lockfile versions. The first releasable version is
  `0.1.0`; manifests and generated AgentBase ownership strings use that identity.
- **AB-RELEASE-002** — A build explicitly selects one supported target and
  admits the target-matching production dependency closure. No native graph
  provider artifact or source build is required.
- **AB-RELEASE-003** — A public build requires a clean Git worktree, resolves
  the exact source commit and committed timestamp, refuses an existing output
  name and never silently overwrites a release.
- **AB-RELEASE-004** — The payload contains application runtime source, the
  installed production dependency closure, released product skills, static
  runtime assets, versioned lifecycle bootstrap/control, license/provenance
  files. It excludes native graph providers, AgentBase tests, test fixtures, development
  dependencies, other platform artifacts, imported upstream source and the
  upstream Graph UI.
- **AB-RELEASE-005** — Dependency admission is derived from the installed
  lockfile-resolved production tree. Release assembly performs no download,
  dependency installation, lifecycle script or native compilation.
- **AB-RELEASE-006** — The canonical manifest declares product/release/source
  identity, target, Node range, entry point, supported MCP eras, local-state
  and integration-state schemas, supported AgentBase OKF read/author profiles,
  qualified scale claims, SBOM identity and every payload file's mode, size and
  SHA-256 digest.
- **AB-RELEASE-007** — Each archive carries a deterministic CycloneDX JSON SBOM
  derived from the lockfile production closure. Volatile serial and timestamp
  fields are normalized to the source identity.
- **AB-RELEASE-008** — Each archive carries an internal `SHA256SUMS` covering
  all other files and an adjacent checksum covering the final compressed
  archive. Verification rejects a missing, additional or changed file.
- **AB-RELEASE-009** — Paths, ordering, ownership, permissions and timestamps
  are normalized. Repeating a build for the same source, target and dependency
  tree produces byte-identical archive and checksum output.
- **AB-RELEASE-010** — Before publication, the builder verifies source
  integrity, manifest/file closure, internal and outer hashes, safe extraction
  and a clean extracted `node src/cli.ts --help` smoke run. Failure publishes no
  final artifact.
- **AB-RELEASE-011** — Focused tests build the same injected clean source
  identity twice, prove byte equality, inspect the exact payload boundary and
  reject representative drift, collision and unsafe archive cases.

## Compatibility declarations for `0.1.0`

The first supported release reads and authors exact compact
`agentbase-okf@1.0` Hubs and continues reading base OKF `0.2` legacy-unprofiled
Hubs for diagnosis and reviewed migration. G5-C1 compact bootstrap, authoring,
lifecycle, query, CI and visualization are verified together, so the candidate
artifact declares Profile 1.0 `author` compatibility. The final manifest keeps
`qualified_scale: null`: deterministic compact Profile round-trip and isolated
disposable-domain qualification establish compatibility, while capacity and
real-model benchmarks remain explicitly deferred.

## Downstream boundaries

- Transactional application lifecycle is implemented by
  [`11-application-lifecycle-requirements.md`](11-application-lifecycle-requirements.md).
- Client registration migration and released-skill activation are implemented
  by [`12-client-and-skill-integration-requirements.md`](12-client-and-skill-integration-requirements.md).
- Exact-tag CI qualification and first-stage workflow retention are implemented
  by [`13-release-ci-requirements.md`](13-release-ci-requirements.md).
- Additional platform jobs, public release publication and registry adapters.
- Signing/attestation for a future hardened or public deployment profile.

## Acceptance evidence

The requirement-linked release tests assemble the real production payload
twice with the deterministic CI qualification declaration, compare the archive
bytes, extract and re-verify it, run the packaged CLI
smoke check, inspect production/SBOM closure and reject dirty source, collision,
payload drift and path traversal. The packaged installer qualification also
registers a deterministic Codex double through the stable launcher, verifies the
released skill closure and uninstalls both integrations. The canonical
repository gate includes these tests; a distributable build additionally
requires a clean exact version-tag CI invocation.
