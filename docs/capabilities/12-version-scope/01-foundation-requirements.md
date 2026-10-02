# Foundation requirements

Current accepted repository navigation, architecture controls and deterministic
foundation behavior.

## Session and history

- **AB-FND-001** — A new session reads `AGENTS.md`, `docs/README.md` and Git
  status, then loads only the affected domain docs.
- **AB-FND-002** — Current product direction lives under `docs/product/` and
  current architecture, design and requirements live under `docs/architecture/`
  and `docs/capabilities/`; Git history is explanatory rather than authoritative.
- **AB-FND-003** — Sibling legacy AgentBase repositories are read-only evidence,
  never dependencies or mutation targets.

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
- **AB-FND-015** — `npm run verify` is the canonical offline contract,
  type, dependency architecture, dead-code/dependency, redacted-secret, test
  and diff gate.
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

## AgentBase CLI surface

- **AB-CLI-001** — The user-facing executable name is `abs`; `abs --help` uses
  AgentBase terminology and never presents `okf` as a command namespace.
- **AB-CLI-002** — Public CLI contains only `status`, `hub connect` and
  `hub sync` in this MVP. Each command maps to one owner-visible bounded
  workflow and has secret-free output and errors.
- **AB-CLI-003** — `mcp` remains a technical stdio launcher for registered
  clients but is not advertised as an ordinary user workflow.
- **AB-CLI-004** — Ingest, Refresh, Batch, Domain Enrichment, Query, Accept,
  Publish, Question review, validator actions remain skill/MCP or
  developer/internal routes; they are not duplicated as public CLI commands.
- **AB-CLI-005** — Internal routes may retain compatibility during migration,
  but public help, README examples and product skills reference only the
  canonical `abs` surface.
- **AB-CLI-006** — CLI naming changes do not alter MCP tool names, Hub data,
  local storage identity, Published/Draft state or authorization boundaries.
