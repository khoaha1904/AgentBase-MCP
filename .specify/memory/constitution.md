<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles: Evidence Before Abstraction; Local-First Explicit Authority;
  Agent-Navigable Ownership; Cumulative Knowledge Without Implicit Destruction;
  Specification and Deterministic Verification
- Added sections: Architecture and Safety Constraints; Development Workflow
- Removed sections: none; template placeholders were replaced
- Follow-up items: none
-->
# AgentBase Constitution

## Core Principles

### I. Evidence Before Abstraction

Every provider integration and product inference MUST start from bounded real
evidence before a reusable abstraction is accepted. Provider-private schemas,
process behavior and cache layout MUST remain behind an AgentBase-owned
contract. Claims about accuracy, latency, compatibility or parity MUST identify
their evidence and limitations; unmeasured claims are prohibited.

### II. Local-First Explicit Authority

Mandatory Code Intelligence MUST work locally without model calls, cloud
credentials or a user-managed provider installation. AgentBase MUST NOT search
for arbitrary executables, mutate global tool configuration, activate a daemon,
watcher or network access, or perform destructive state changes without an
explicit accepted product contract. Background or expensive work MUST remain
observable, bounded and disableable.

### III. Agent-Navigable Ownership

Every authored runtime and test file MUST have one clear capability owner.
Cross-capability imports MUST use small public entrypoints and obey the declared
dependency direction. Living requirements, architecture ownership, focused
tests and the smallest responsible implementation MUST be reachable through the
ordered repository route. Generic folders and speculative boundaries require a
current responsibility and consumer.

### IV. Cumulative Knowledge Without Implicit Destruction

The detailed code graph is private, disposable machine state. Only normalized,
provenance-bearing evidence may enter knowledge workflows. Shared OKF knowledge
MUST be proposed and reviewed before apply; missing evidence MUST NOT silently
delete accepted or ambiguously owned knowledge. Human-authored, human-verified
and unknown extension content MUST be preserved unless an explicit governed
operation authorizes change.

### V. Specification and Deterministic Verification

Observable product or architecture changes MUST have one active numbered
capability, stable requirement IDs and requirement-linked acceptance evidence
before implementation. Tests MUST cover success, explicit failure and recovery
at the responsible boundary. One canonical offline verification command MUST
compose specification, type, architecture, test and diff checks. Real external
or native integration remains separately opt-in unless its runtime requirements
are explicitly accepted for the canonical gate.

## Architecture and Safety Constraints

- The repository remains a modular monolith until measured evidence justifies
  distribution.
- Core policy MUST NOT import concrete providers or application presentation.
  Providers MUST NOT import application code, and engine-private records MUST
  NOT cross public core values.
- Source repositories are read-only from provider workflows. Caches, proposals
  and recovery state MUST use exact owned paths and MUST NOT expose secrets or
  machine-local roots in shared evidence.
- Dependencies and native binaries MUST be version-bound and reviewed. A new
  production dependency, provider, runtime, process lifecycle, credential
  boundary, migration or irreversible operation requires owner-visible approval.
- Repository architecture and review-size exceptions MUST be exact,
  owner-approved, non-growing and mechanically stale-detected.

## Development Workflow

1. Read the ordered session route, current living requirements and active
   capability before editing.
2. Use the Direct route for non-behavioral maintenance, the Bug route for a
   requirement regression, the Fast Feature route for one bounded low-risk
   behavior and the Full Feature route for lifecycle, provider, dependency,
   migration, security or cross-subsystem work.
3. Record owner product decisions in `spec.md`; keep implementation choices in
   `plan.md`; generate dependency-ordered `tasks.md` before implementation.
4. Implement the smallest independently useful slice with colocated,
   requirement-linked tests. Preserve unrelated dirty-tree work.
5. Update living contracts and handoff evidence when behavior becomes current,
   run `npm run verify`, and close the active selector only when no required work
   remains.

## Governance

This constitution is the highest project process authority. `AGENTS.md`, living
requirements, ADRs, feature plans and skills MUST conform to it; a lower-level
artifact cannot silently waive a principle.

Amendments require an explicit owner decision, a documented Sync Impact Report,
semantic version change and updates to affected workflow evidence. MAJOR changes
remove or redefine a principle incompatibly, MINOR changes add or materially
expand governance, and PATCH changes clarify existing intent. Every Full
Feature plan MUST evaluate constitution compliance before and after design.

Compliance is enforced through owner review and the canonical repository gate.
Necessary deviations MUST name the exact scope, risk, owner approval and removal
or re-review trigger; broad or permanent implicit exceptions are invalid.

**Version**: 1.0.0 | **Ratified**: 2026-08-11 | **Last Amended**: 2026-08-12
