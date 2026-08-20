# Foundation contract

Current accepted repository navigation, architecture controls and deterministic
foundation behavior. Numbered `specs/` directories record changes and do not
override this contract after completion.

## Session and history

- **AB-FND-001** — A new session reads `AGENTS.md`, `docs/README.md`,
  `specs/CURRENT.md` and Git status, then loads only the affected domain docs.
- **AB-FND-002** — Current requirements live under `docs/contracts/` (plus
  product requirements in `docs/PRODUCT.md`); `specs/CURRENT.md` selects at most
  one active capability and completed numbered capabilities are historical.
- **AB-FND-003** — Sibling legacy AgentBase repositories are read-only evidence,
  never dependencies or mutation targets.

## Deterministic foundation demonstration

- **AB-FND-004** — The demo returns a repository map followed by the accepted
  relevant-neighborhood result.
- **AB-FND-005** — The demo composes a deterministic fake through the neutral
  Code Intelligence public contract, without parsing or an external engine.
- **AB-FND-006** — Its fixture contains exactly 12 authored TypeScript files with
  modular public/private boundaries and a cross-capability chain.
- **AB-FND-007** — The accepted query returns every manifest-declared node and
  edge while citing at most three fixture files.
- **AB-FND-008** — Five unchanged runs produce byte-equivalent normalized output
  regardless of provider insertion order.
- **AB-FND-009** — Missing snapshots, unknown subjects and invalid queries remain
  distinct failures; a known isolated subject is a successful empty result.

## Architecture and verification

- **AB-FND-010** — Every authored runtime/test file remains attributable to one
  capability through the source layout and architecture ownership index. No
  duplicate exact ownership registry is required.
- **AB-FND-011** — Cross-capability imports use the target capability's public
  `index.ts`; native dependency analysis rejects private imports with exact
  source and target paths.
- **AB-FND-012** — Native dependency analysis rejects core imports of
  providers/apps, provider imports of apps and local dependency cycles.
- **AB-FND-013** — Architecture verification has no file line, byte, line-
  length, density or local-import budget and no non-growing metric baseline.
  Split only distinct responsibilities, never metric-driven wrappers.
- **AB-FND-014** — Tests and deterministic support stay with the narrowest
  behavior owner or explicit repository fixture owner.
- **AB-FND-015** — `npm run verify` is the canonical offline specification,
  type, dependency architecture, dead-code/dependency, redacted-secret, test
  and diff gate.
- **AB-FND-016** — Core owns provider-neutral repository-map and
  relevant-neighborhood contracts.
- **AB-FND-017** — The deterministic fake passes the same neutral conformance
  scenarios required of real providers.
- **AB-FND-018** — Provider-private graph records never leak into public core
  values; adapters translate at their boundary.
- **AB-FND-019** — Foundation verification needs no network, credentials, model,
  daemon or arbitrary executable fallback.
- **AB-FND-020** — Knip uses explicit runtime, script and test entrypoints and
  gates unused files and dependencies. Intentionally public exports/types are
  outside its initial blocking scope.
- **AB-FND-021** — Gitleaks extends maintained default rules, scans the working
  tree with redacted output and never auto-installs or silently skips a missing
  native binary.
- **AB-FND-022** — Dependency-cruiser, its parser and Knip are exact lockfile-
  backed development dependencies. The reviewed native gitleaks version remains
  an explicit environment prerequisite, not a production dependency.
