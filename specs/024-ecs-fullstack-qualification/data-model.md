# Data Model: ECS Full-stack Qualification

## QualificationStage

- workflow: `initial-ingest` or `refresh`
- immutable prompt identity
- pinned model and reasoning effort
- prerequisite artifact, absent for Initial Ingest and required for Refresh
- sequential outcome: blocked, invalid, valid partial or review ready

## SourceMutation

- exact repository-relative path
- exact old and new literal
- expected occurrence count
- all entries apply to one temporary source commit or none apply

## BaselineDecision

- structural validation
- owner-review usefulness
- health-contract concept/path and exact source evidence
- separated OKF/MCP and benchmark findings
- accepted only for isolated Refresh seeding, never Hub publication

## StabilityComparison

- changed concept identities and bytes
- source paths and canonical relationships
- expected new and superseded health-contract terms
- per-run Repository observation commit ignored for byte-stability comparison
