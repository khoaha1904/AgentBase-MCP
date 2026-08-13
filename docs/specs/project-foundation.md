# Living Requirements: Project Foundation

- **Status:** Active
- **Established by:** Capability `001-clean-foundation`
- **Last updated:** 2026-08-11

This document is the durable contract for AgentBase repository navigation,
foundation Code Intelligence behavior and architecture controls. Numbered
feature artifacts explain historical changes; they do not replace these current
requirements.

## Session context

### AB-FND-001 — Ordered session route

Trigger: a new agent session begins in the repository.

Outcome: the root guide routes the session through handoff, product vision,
architecture, this living contract and the active change selector in one order.

Failure evidence: the specification gate identifies the missing route.

### AB-FND-002 — Living and historical requirements

Trigger: an agent needs current behavior or investigates a past change.

Outcome: current requirements remain under `docs/specs/`; numbered `specs/`
directories become historical after completion and `specs/CURRENT.md` names the
one active capability.

Failure evidence: missing living IDs or a broken active selector fail the
specification gate.

### AB-FND-003 — Legacy isolation

Trigger: legacy AgentBase evidence is consulted.

Outcome: sibling legacy repositories remain read-only references and are not
runtime or build dependencies.

Failure evidence: a legacy repository package dependency fails verification.

## Foundation demonstration

### AB-FND-004 — Map and neighborhood flow

Trigger: the foundation demonstration runs.

Outcome: it returns a complete map for the representative repository followed
by the accepted relevant-neighborhood result.

### AB-FND-005 — Fake through neutral contract

Trigger: the foundation flow requests Code Intelligence.

Outcome: a deterministic fake is composed through the provider-neutral public
contract; no parser or external engine is used.

### AB-FND-006 — Representative fixture

Trigger: foundation conformance or product-flow evidence runs.

Outcome: the checked-in fixture contains exactly 12 authored TypeScript files in
a modular monolith with public/private boundaries and a cross-capability chain.

### AB-FND-007 — Context quality boundary

Trigger: the accepted neighborhood query runs.

Outcome: every manifest-declared expected node and edge is returned while the
result references no more than three fixture files.

Failure evidence: missing expected evidence or a fourth referenced file fails
the product-flow test.

### AB-FND-008 — Deterministic normalization

Trigger: unchanged fake input is queried repeatedly.

Outcome: five normalized serializations are byte-equivalent regardless of
provider insertion order.

### AB-FND-009 — Explicit failures

Trigger: a snapshot, subject or query is invalid.

Outcome: the contract distinguishes missing snapshot, unknown subject and
invalid query without fabricating evidence or presenting partial data as
complete. A known isolated subject remains a successful empty result.

## Agent-friendly architecture

### AB-FND-010 — Exhaustive ownership

Every authored runtime source and colocated test file has exactly one registered
capability owner, except explicitly allowlisted root composition files. Unknown,
overlapping and stale ownership fails with exact paths.

### AB-FND-011 — Public-only cross-capability imports

External callers import a capability only through its registered public
entrypoint. Private cross-capability imports fail architecture verification.

### AB-FND-012 — Dependency direction and cycles

Core never imports providers or application code. Providers never import
application code. Local cycles fail with their exact dependency loop.

### AB-FND-013 — Measured reviewability

Source and test files use separate measured budgets. Any exception is exact,
owner-approved, non-growing and fails when missing or resolved. Broad wildcard
allowances are invalid.

A budget finding MUST trigger a cohesion review, not metric-driven fragmentation.
Files may be split only across distinct responsibilities that can evolve
independently. A cohesive entrypoint or composition root may use an exact
owner-approved baseline mark with a review condition; forwarding-only wrappers
or low-value fragments created to satisfy the checker are prohibited.

### AB-FND-014 — Owned tests and support

Tests live with their behavior owner. Deterministic shared setup belongs to the
narrowest responsible capability or to the explicit repository fixture area.

### AB-FND-015 — Canonical offline verification

One `npm run verify` command composes specification, type, architecture, test
and diff checks. Completion evidence uses this gate.

## Provider boundary

### AB-FND-016 — Provider-neutral core

Core defines repository-map and relevant-neighborhood contracts before a real
engine is added.

### AB-FND-017 — Reusable conformance

The deterministic fake passes the same core conformance scenarios required of a
future real provider.

### AB-FND-018 — No private schema leakage

Public core values contain no fake-private or future engine-private graph
record. Adapters translate provider surfaces at their boundary.

### AB-FND-019 — Mandatory local path

The foundation demonstration and verification require no network, credentials,
AI inference, daemon or external binary. Failure never falls back to an
arbitrary executable from `PATH`.
