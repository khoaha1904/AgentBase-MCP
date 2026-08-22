# Research: Batch Initial Ingest

## Decision 1: Compose isolated member sessions, not one shared authoring tree

**Decision**: Every repository authors against the same immutable base in its
existing isolated session. A batch composer applies only validated member diffs
in manifest order and owns shared append-only index reconciliation.

**Rationale**: This reuses the qualified single-repository workflow and prevents
one model context or repository evidence from contaminating another.

**Alternatives considered**: One mutable shared session makes recovery and
attribution ambiguous. Multiple independent proposals plus a batch PR violates
the owner-approved one-proposal/one-Accept boundary.

## Decision 2: Add a small deterministic batch coordinator

**Decision**: Add batch prepare/confirm/revise/finalize actions around existing
single-repository preflight and authoring sessions. The host skill still performs
README reasoning and sequential model work; MCP persists only manifests and
validated checkpoints. Shared navigation for the one confirmed Domain is the
only concept-level composition exception and is regenerated from exact
member-owned targets rather than merged as arbitrary Markdown.

**Rationale**: Session context alone cannot safely survive interruption or prove
that exact completed members were reused.

**Alternatives considered**: A generic workflow engine is unnecessary. No
durable state cannot meet explicit retry and membership revision requirements.

## Decision 3: Initial Ingest only

**Decision**: Reject canonical repositories and mixed Init/Refresh membership.

**Rationale**: Refresh has different diff, missing-evidence and lifecycle rules.
Keeping it separate is the smallest stable product slice.

**Alternatives considered**: Supporting both immediately doubles reconciliation
paths and weakens independent qualification.

## Decision 4: Offline qualification first

**Decision**: Use disposable repositories, fake/local graph boundaries and Git
Hub fixtures in the existing 50-case suite. Model qualification is separately
authorized after deterministic convergence.

**Rationale**: Batch atomicity/recovery defects must not be confused with model
variance or external provider availability.
