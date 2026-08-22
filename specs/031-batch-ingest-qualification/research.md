# Research: Batch Initial Ingest Qualification

## One orchestrator process

**Decision**: Use one isolated Sol process to coordinate the batch while indexing
and authoring members sequentially.

**Rationale**: This tests the actual batch skill and one atomic proposal while
the MCP checkpoints keep member work isolated.

**Alternatives considered**: Combining independent single-repo benchmark outputs
would not test preflight, record, composition or batch finalization.

## Domain and fixtures

**Decision**: Pin AWS Health Aware and AWS DevOps Agent Terraform under explicit
owner guidance `domains/cloud-operations`.

**Rationale**: Both are operational systems with independent repository identity
and Terraform evidence; the Domain is semantic rather than provider-shaped.

## Assessment

**Decision**: Validate production structure and lifecycle, then report manual
owner-review findings per member; do not create another fixed completeness score.

**Rationale**: Capability 030 must remain useful with sparse partial knowledge,
and the existing reference expectations are diagnostic rather than exhaustive.
