# Research: AgentStack Foundation

## Native tools instead of the custom checker

**Decision**: Use dependency-cruiser for dependency facts, knip for dead
code/dependencies and gitleaks for secrets. Delete rather than translate the
custom file metrics and exception baseline.

**Rationale**: The current checker duplicates dependency analysis and adds
unproven line/byte/import thresholds. AgentStack and the already-applied
AgentDocks setup demonstrate the native-tool route.

**Alternatives considered**: Keep the custom checker beside native tools
(duplicate gates and drift); remove all architecture checks (loses real cycle
and layer protection); build a shared AgentStack engine (explicit non-goal).

## Dependency rule encoding

**Decision**: Use dependency-cruiser's recommended rules plus exact AgentBase
rules for cycles, core/provider/app direction and cross-capability private
imports. Capture-group placeholders allow imports within one capability while
requiring other capabilities to target `index.ts`.

**Rationale**: This preserves the useful behavior of AB-FND-011/012 without an
enumerated ownership registry or custom parser.

**Alternatives considered**: Enumerate each capability in JSON (restores stale
registry); enforce only layers (would silently drop public boundaries); keep
the old scanner for private imports (two engines).

## Tool versions

**Decision**: Reuse the proven AgentDocks versions exactly:
`dependency-cruiser@18.2.0`, `@swc/core@1.16.0`, `knip@6.32.2`. Keep
machine-managed `gitleaks@8.30.1` as an explicit native prerequisite.

**Rationale**: Exact package versions and the lockfile satisfy deterministic
development tooling. The machine inventory already records gitleaks 8.30.1;
AgentBase must not download native tools during verification.

**Alternatives considered**: Floating versions (non-deterministic); an
unofficial npm gitleaks wrapper (extra supply-chain boundary); automatic binary
download (violates explicit authority).

## Dead-code scope

**Decision**: Gate unused files and dependencies with explicit runtime, script
and test entrypoints. Disable export/type findings initially.

**Rationale**: Public exports and types are library/MCP contracts and create
high-noise cleanup pressure. Unused files/dependencies provide immediate value
without changing public API policy.

**Alternatives considered**: Enable every knip category immediately (large
unrelated cleanup); broad ignore patterns (hide real findings); defer knip
entirely (does not meet the adopted standard).

## Secret scanning

**Decision**: Extend gitleaks default rules, scan the working tree with
`--no-git --redact`, and add only narrow reviewed allowlists if committed
fixtures cause confirmed false positives.

**Rationale**: Default rules are maintained upstream; redaction prevents gate
output from repeating a finding. Working-tree scanning covers pending changes.

**Alternatives considered**: Custom regex scanner (reimplementation); full Git
history on every local verify (unbounded for this gate); silently skip when the
binary is missing (false pass).

## AgentStack relationship

**Decision**: Copy no AgentStack source/config at runtime. AgentBase owns its
small native configs and may be audited by AgentStack's facts-only `abs_check`.

**Rationale**: AgentStack's current shared config phase is incomplete, and its
principle is “depend, don't clone,” not “make every repo depend on AgentStack.”

**Alternatives considered**: Reference sibling paths (non-portable); publish a
shared config package now (premature abstraction); copy AgentDocks-specific
boundaries (wrong architecture).
