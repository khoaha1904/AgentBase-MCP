# Research: Observed Value Snapshots

- **Decision**: clean cutover, no compatibility reader. **Rationale**: no legacy
  contract is Published. **Rejected**: dual-read/migration complexity.
- **Decision**: ordinary query is snapshot-only. **Rationale**: avoids hidden
  source permission and latency behavior. **Rejected**: automatic live resolve.
- **Decision**: preserve current private Question workflow while changing its
  evidence type. **Rationale**: shared Question documents are separately designed
  and not required to prove snapshot-first. **Rejected**: combining Parts 07/08.
- **Decision**: provider variant deferred. **Rationale**: it adds CLI/credential
  lifecycle and is independently useful only with Domain Enrichment.
