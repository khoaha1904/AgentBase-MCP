# Research: Bundled provider installation

## Decision 1 — Bundle verified binaries in AgentBase

**Decision**: Track one executable plus its existing integrity manifest per
supported platform inside the private AgentBase release.

**Rationale**: It preserves one-command, offline enterprise installation and
keeps the current source/profile/tool-surface audit chain.

**Alternatives considered**:

- Download upstream release binaries: rejected because company installation
  cannot call GitHub and AgentBase owns a patched provider.
- Compile during ordinary installation: rejected because it exposes compiler,
  Make and platform headers to end users.
- Vendor zlib and every build prerequisite: rejected because it solves release
  building, not the simpler end-user installation problem.
- Add an artifact registry/package: rejected until a real company distribution
  authority exists.

## Decision 2 — Keep build and install separate

**Decision**: The existing native preparation remains explicit and a new
maintainer packaging command publishes its verified result. `./install.sh`
never invokes either source-build step.

**Rationale**: Release maintainers accept native prerequisites once; ordinary
users only consume reviewed bytes.

## Decision 3 — Reuse runtime admission and atomic switch

**Decision**: Validate the tracked bundle with the same provider-owned checks as
the active runtime, then reuse the existing same-filesystem directory switch.

**Rationale**: One trust policy prevents installer/runtime drift and preserves
the last valid artifact if staging fails.

## Decision 4 — Two targets only

**Decision**: Release `linux-x64` here and `darwin-arm64` on the company Mac.
Windows is explicit post-MVP work.

**Rationale**: These are the already approved AgentBase targets. Upstream's
broader platform list is not AgentBase release evidence.
