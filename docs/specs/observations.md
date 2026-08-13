# Living Requirements: Explicit Repository Observations

- **Status:** Active
- **Established by:** Capability `006-explicit-observation-command`
- **Last updated:** 2026-08-12

Observations are the explicit evidence bridge from the disposable Codebase
Memory graph to later user-authorized knowledge work. They are not another code
graph and do not themselves create OKF.

### AB-OBS-001 — Explicit observation action

The user selects one repository and symbol through the `observe` command. No
watcher, schedule or implicit graph event starts observation collection.

### AB-OBS-002 — Codebase Memory graph authority

The exact managed Codebase Memory provider owns indexing, graph structure,
node/edge meaning and graph queries. AgentBase does not maintain a parallel
canonical graph model.

### AB-OBS-003 — Evidence-only bridge

AgentBase emits a normalized repository evidence bundle containing exact source
and engine identity, bounded query inputs, facts, sources, completeness,
limitations and digest. Provider-private graph records do not cross the bridge.

### AB-OBS-004 — OKF requires another command

Observation collection never creates, changes, validates or applies `okf/` or
an OKF proposal. Every OKF action begins with a separate explicit `okf` command.

### AB-OBS-005 — Stable normalization

Equivalent evidence normalizes with stable ordering and deterministic digest;
source or engine identity changes remain visible.

### AB-OBS-006 — No partial success

Invalid input, provider failure, source mutation or cleanup failure emits no
partial successful observation bundle and returns a distinct failure.

### AB-OBS-007 — Existing provider safety

Observation preserves exact package-private admission, private cache, bounded
process/session, source-integrity and clean-cleanup requirements.
