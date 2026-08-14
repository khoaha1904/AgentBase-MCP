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

- **AB-FND-010** — Every authored runtime/test file has exactly one registered
  owner except explicit composition files; unknown, overlapping and stale owners
  fail with exact paths.
- **AB-FND-011** — Cross-capability imports use registered public entrypoints;
  private imports fail verification.
- **AB-FND-012** — Core never imports providers/apps, providers never import
  apps, and local dependency cycles fail with the exact loop.
- **AB-FND-013** — Review budgets are measured. Exceptions are exact,
  owner-approved and non-growing; split only distinct responsibilities, never
  metric-driven wrappers or fragments.
- **AB-FND-014** — Tests and deterministic support stay with the narrowest
  behavior owner or explicit repository fixture owner.
- **AB-FND-015** — `npm run verify` is the canonical offline specification,
  type, architecture, test and diff gate.
- **AB-FND-016** — Core owns provider-neutral repository-map and
  relevant-neighborhood contracts.
- **AB-FND-017** — The deterministic fake passes the same neutral conformance
  scenarios required of real providers.
- **AB-FND-018** — Provider-private graph records never leak into public core
  values; adapters translate at their boundary.
- **AB-FND-019** — Foundation verification needs no network, credentials, model,
  daemon or arbitrary executable fallback.
