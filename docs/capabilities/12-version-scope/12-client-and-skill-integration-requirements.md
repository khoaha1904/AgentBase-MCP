# Client and skill integration requirements

> Status: Implemented and verified for Codex and Claude Code on the local
> `linux-x64` release path.
>
> Release evidence: Required

Product Contract:
[Scope and authority](../../product/00-scope-and-authority.md)

Architecture Contracts:
[Runtime boundaries](../../architecture/runtime.md),
[State and trust boundaries](../../architecture/state-and-trust.md), and
[Flows](../../architecture/flows.md)

## Boundary

This capability connects an immutable application release to explicitly
selected Codex and/or Claude Code clients. It owns stable MCP registration,
released product-skill activation, one-time recognition of the checkout-based
developer installation and integration recovery inside the application
lifecycle transaction. It never selects a Hub, stores a credential or changes
knowledge.

The selected client set is fixed for the installed application lifecycle.
Changing that set requires uninstall followed by a new explicit install; a
separate client reconfiguration workflow is not part of G2-C3.

## Stable client registration

- **AB-INTEGRATION-001** — Release installation requires one or more explicitly
  selected supported clients. Interactive installation asks for the selection;
  non-interactive installation requires `--clients` and never guesses from
  ambient tools.
- **AB-INTEGRATION-002** — Every selected `agentbase` stdio entry directly uses
  the absolute `AGENTBASE_HOME/bin/abs` launcher with the sole argument `mcp`.
  It contains no checkout/version path, shell command, Hub identity, environment
  override or token and does not depend on `PATH` at runtime.
- **AB-INTEGRATION-003** — Initial installation preflights every selected client,
  same-name entry and skill destination before application or external
  integration mutation. Missing clients and uninspectable or unknown same-name
  entries fail visibly without changing another client.
- **AB-INTEGRATION-004** — An absent entry is created and an exact stable entry
  is adopted as AgentBase-managed state. A checkout entry is migrated once only
  when it is exact stdio `node <agentbase-mcp-checkout>/src/cli.ts mcp`, has empty
  environment fields and the checkout manifest identifies `agentbase-mcp`.
  Every other same-name entry is a conflict and is never overwritten.
- **AB-INTEGRATION-005** — Client mutation uses the client's supported user-scope
  MCP management commands and verifies the effective entry. A failed migration
  restores the exact prior AgentBase entry while unrelated client configuration
  remains owned by the client.
- **AB-INTEGRATION-006** — Successful installation records the selected clients
  and managed entry identity in owner-private, non-secret installation state.
  Upgrade and rollback verify but do not rewrite exact stable entries; uninstall
  removes only the still-exact managed entries.

## Versioned product skills

- **AB-INTEGRATION-007** — The target release manifest and payload must contain
  exactly the fixed thirteen-skill AgentBase catalog. Only those skills are
  considered for the explicitly selected clients at their documented global
  skill roots.
- **AB-INTEGRATION-008** — Initial installation creates an absent released skill
  and adopts an exact released copy as recognized AgentBase legacy state. A
  different, symbolic-link, non-directory or partial unsafe target is an
  explicit conflict before mutation.
- **AB-INTEGRATION-009** — Installation state records the release and exact digest
  of every managed skill. Upgrade and rollback replace a skill only when its
  current digest equals recorded state, activate the target release's digest and
  keep the previous copy until the application transaction commits.
- **AB-INTEGRATION-010** — Uninstall removes only skill directories that still
  equal recorded AgentBase state. Drift or an unknown same-name target blocks
  application removal and preserves the conflicting bytes for explicit owner
  resolution.

## Transaction and recovery

- **AB-INTEGRATION-011** — Application bytes, stable launcher, selected client
  entries and released skills share the application lifecycle lock and durable
  commit decision. No second independent release lifecycle or integration lock
  is introduced.
- **AB-INTEGRATION-012** — A durable non-secret integration receipt records exact
  before/after entry identities, skill digests and installer-owned backup paths.
  Pre-commit failure restores prior entries and skills; a committed operation
  resumes forward. Recovery is idempotent and refuses unknown concurrent drift.
- **AB-INTEGRATION-013** — Integration state and recovery contain no Hub token or
  client environment value. Install, upgrade, rollback and uninstall preserve
  `config/`, `hubs/`, unrelated `state/` and all unselected-client state.
- **AB-INTEGRATION-014** — Focused tests use isolated homes and deterministic
  client doubles to cover fresh install, exact adoption, recognized checkout
  migration, no-rewrite upgrade, versioned rollback, uninstall, conflict, drift
  and injected failure recovery. Release qualification exercises the packaged
  installer, stable MCP entry and released skill set without real user state.

## Validation evidence

Requirement-linked tests beside the installation owners are the evidence for
this contract. The repository verification gate must also prove that every
release carries the integration/control modules and that its manifest skill
catalog equals its packaged skill closure.

- **AB-INTEGRATION-015** - Upgrade recognizes the prior managed thirteen-skill
  catalog and transactionally removes its owned `use-codebase-memory` skill.
  Drift fails before mutation; rollback restores the prior release's exact
  catalog. Independently registered external graph tools are untouched.
