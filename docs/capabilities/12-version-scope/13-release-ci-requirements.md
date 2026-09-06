# Release CI requirements

> Status: Implemented and locally verified for repository checks, derived
> evidence and exact-tag `linux-x64` qualification. The first operational CI
> result can exist only after this workflow lands and its version tag runs.
>
> Release evidence: Required

Product Contract:
[Scope and authority](../../product/00-scope-and-authority.md)

Architecture Contracts:
[Runtime boundaries](../../architecture/runtime.md),
[Ownership](../../architecture/ownership.md), and
[Flows](../../architecture/flows.md)

## Boundary

This capability owns repository verification automation, derived release-
requirement evidence and qualification of distributable platform archives. It
does not redefine requirements, install an application, select a Hub, sign an
artifact or add a release-discovery service.

The first CI release target is `linux-x64`, matching the only checked-in native
provider artifact. A platform becomes required only after its reviewed provider
artifact exists and the release contract admits it.

## Requirements

- **AB-RELEASE-CI-001** — Pull requests, protected-branch pushes and explicit
  maintainer dispatch run one required repository-verification workflow from a
  clean checkout with the exact supported Node major, lockfile installation and
  pinned verification tooling.
- **AB-RELEASE-CI-002** — The repository workflow invokes the canonical
  `npm run verify` gate. It does not maintain a second reduced list of contract,
  test, type, dependency, generated-output or secret checks.
- **AB-RELEASE-CI-003** — A Capability Contract opts into release evidence with
  the exact `Release evidence: Required` marker. The checker derives active
  requirement IDs from those documents and test-title references from repository
  `*.test.ts` and `*.test.mjs` files; no traceability matrix or retained coverage
  report becomes another authority.
- **AB-RELEASE-CI-004** — Release-evidence validation fails on a duplicate
  active definition, an active requirement without a test reference, or a test
  reference in an active release namespace that names no defined requirement. Compact inclusive references
  such as `AB-RELEASE-001..011` are expanded deterministically; more than one
  test may cite the same requirement.
- **AB-RELEASE-CI-005** — Release qualification runs only in GitHub Actions for
  an exact `v<product-version>` tag whose annotated or lightweight target and
  checked-out `HEAD` equal the source commit. A dirty tree, version mismatch or
  non-tag invocation fails before archive publication.
- **AB-RELEASE-CI-006** — The release job completes the canonical repository
  verification gate before invoking the existing deterministic platform
  builder. Qualification never bypasses source, provider, payload, SBOM,
  checksum, extraction or packaged-runtime verification.
- **AB-RELEASE-CI-007** — Each job builds only the target matching its host and
  a checked-in admitted provider artifact. The required target set is explicit;
  unsupported or missing targets cannot be presented as a partial release.
- **AB-RELEASE-CI-008** — A qualified archive manifest contains one
  deterministic `agentbase-release-ci-v1` result declaring the passed contract,
  release-evidence and repository-verification gates. Run IDs, runner paths,
  credentials and timestamps are excluded so same-input archives remain byte
  reproducible.
- **AB-RELEASE-CI-009** — CI distributes only the archive and adjacent outer
  checksum produced by the qualifier. Workflow retention is the first trusted-
  enterprise distribution adapter; automatic download and public release
  publication remain outside the application lifecycle.
- **AB-RELEASE-CI-010** — Workflows use read-only repository permission,
  bounded timeouts and concurrency cancellation. Dependencies or credentials
  used by CI never enter the archive, manifest or logs by product design.
- **AB-RELEASE-CI-011** — A failed or cancelled verification, qualification or
  platform build uploads no distributable artifact. Existing releases and local
  application state are never changed by CI.
- **AB-RELEASE-CI-012** — Focused tests cover evidence derivation and failure
  cases, exact CI tag/source admission, qualified-manifest validation and the
  workflow's event, permission, toolchain, gate ordering, target and output
  boundaries.

## Validation evidence

Requirement-linked tests beside the checker and release builder are the local
evidence. The release workflow then executes the same canonical verification
gate and embeds only its deterministic pass declaration in the archive
manifest. GitHub retains workflow logs and uploaded artifacts operationally;
they are not AgentBase contract authority.

## Deferred boundary

The trusted-enterprise baseline does not require signing, provenance
attestation, public GitHub Release publication, an artifact registry adapter or
automatic client download. Those policies may wrap the qualified archive later
without changing its application lifecycle or knowledge model.
