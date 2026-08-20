# Research: Single-Repository Initial Ingest

## Decision 1: Compose existing primitives through a skill

**Decision**: Keep semantic discovery in a new public host skill and reuse the
managed graph and Hub proposal primitives.

**Rationale**: The repository already has bounded graph sessions, exact source
evidence, isolated authoring workspaces, changed-set validation and inspection.
The missing product behavior is ordered orchestration, not another runtime.

**Alternatives considered**:

- A fixed autonomous MCP scan: rejected because it would become repository- and
  provider-specific and duplicate host-agent reasoning.
- A persistent workflow/candidate database: rejected because Phase 1 has one
  repository and candidates can be rebuilt from source.

## Decision 2: Cleanly replace catalog 5.x selection

**Decision**: Release generic catalog `6.0.0`, AWS Profile `1.0.0` and Terraform
Detector `1.0.0` together, with separate versions and one mapping call.

**Rationale**: Current `selectWhen` strings mix architectural role, vendor
product and source tool. A clean replacement is smaller and clearer than dual
authoring because no Published concept requires compatibility.

**Alternatives considered**:

- Add more AWS/Azure types: rejected because schema count would grow with each
  provider even when architectural roles are identical.
- Preserve vendor types as aliases for new authoring: rejected because it keeps
  two competing meanings and hides cutover failures.

## Decision 3: Resolve Repository identity through Hub knowledge

**Decision**: Treat remote URL, repository name, root commit and checkout path as
hints. Match a stored canonical ID through strong aliases before assigning an
initial ID, then store the assignment in the Repository concept.

**Rationale**: Current identity hashing changes when an origin or checkout name
changes. Hub ownership is the only place that can preserve continuity across
machines and renames.

**Alternatives considered**:

- A remote Repository Claim service: rejected as disproportionate for the rare
  duplicate Initial Ingest race.
- Root-commit identity: rejected because forks can share lineage.
- Current remote URL as identity: rejected because organization transfer and
  rename are normal.

## Decision 4: Evidence-bearing candidates, no scoring

**Decision**: A temporary candidate carries identity basis, query/link value,
source IDs and ambiguity. The guidance boundary rejects source-less semantic or
resource observations.

**Rationale**: This makes schema recommendations auditable without pretending a
percentage can measure semantic truth. It also keeps the Agent flexible across
repository styles.

**Alternatives considered**:

- Numeric confidence/completeness: rejected as false precision and an incentive
  to over-ingest.
- Hard-coded per-repository detectors: rejected as brittle and domain-specific.

## Decision 5: Optional snapshot stays attached to evidence

**Decision**: Allow a small primitive/identifier observation on an evidenced
claim, with revision/time and explicit non-current semantics.

**Rationale**: Hub Markdown remains readable to humans while the exact reference
continues to be the way to retrieve current change-prone values.

**Alternatives considered**:

- References only: rejected because directly readable Hub documents become
  unnecessarily opaque.
- Durable copied config values or source excerpts: rejected because they stale,
  increase Hub weight and risk copying sensitive data.

## Decision 6: Deterministic gate plus opt-in real qualification

**Decision**: Use captured/fake evidence for the canonical gate and retain a
separate three-run model-backed timing/quality qualification.

**Rationale**: Account usage, model availability and host load cannot define an
offline repository gate, but the product still needs measured real workflow
evidence before claiming stability and speed.

**Alternatives considered**:

- One real run as acceptance: rejected because V12 demonstrated high variance
  and one successful process can still produce invalid knowledge.
- No elapsed target: rejected because the owner explicitly needs a practical
  balance between rigid workflow and open-ended reasoning.
