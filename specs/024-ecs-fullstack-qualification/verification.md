# Verification: ECS Full-stack Qualification

## Sol Initial Ingest probe

- Run: `aws-ecs-fullstack/amazon-ecs-fullstack/2026-08-22T031535Z`
- Outcome: succeeded; validation passed; authoring reviewable; acceptance `valid_partial`.
- Reference concepts, recognized schemas, provenance and reference relationships: 100%.
- Human review: accepted as the Refresh baseline. Seven concepts form useful
  boundaries for the system, frontend, backend, API and delivery flow without
  promoting individual AWS resources.
- Health contract: `GET /status` is explicit in `interfaces/backend-http-api.md`
  with server-code and repository evidence identifying it as the ECS health check.
- Scorer-only finding: embedded knowledge reported 50% because the curated probes
  required exact file combinations within one concept. The same health and delivery
  knowledge is present with equivalent exact evidence, so this is not an OKF blocker.

## Terra Refresh

- Probe: `aws-ecs-fullstack-refresh/amazon-ecs-fullstack/2026-08-22T032358Z`.
- Replica: `aws-ecs-fullstack-refresh/amazon-ecs-fullstack/2026-08-22T032612Z`.
- Both runs succeeded, completed the exact Refresh lifecycle once, passed the
  `/health` present + Terraform evidence + `GET /status` absent gate and scored
  100% reference concepts, schemas, provenance and relationships.
- Embedded-knowledge coverage improved from the Init scorer's 50% to 75%. The
  only remaining scorer finding is the pre-existing delivery-pipeline exact-file
  combination; it is unrelated to Refresh and the Flow contains the knowledge.
- Both runs changed only `interfaces/backend-http-api.md` plus Repository
  observation metadata. They cite the server route and both Terraform target
  groups, and preserve the stale README `/status` statement as a limitation.
- Semantic output is stable. The probe/replica differ only in evidence ID/span,
  equivalent wording and independently generated synthetic commit/time metadata.

## Separated findings

### OKF/MCP

- No blocking defect found. Init boundaries are sparse and useful; Refresh
  reconciles one cross-code/infrastructure contract without unrelated edits.
- README conflict is retained honestly instead of silently selecting a winner.

### Benchmark

- The Init embedded probes were too exact about which equivalent source files
  must coexist in one parent, understating present health/delivery knowledge.
- Bounded multi-file mutation and subject-placeholder support were added without
  changing the existing single-mutation Refresh suite.

### Truthful partial coverage

- Initial Ingest does not claim complete AWS resource coverage and leaves live
  deployment/account/region values unresolved. This is acceptable partial
  knowledge, not a failed workflow.

## Final gate

`npm run verify` passed on 2026-08-22: specification checks, TypeScript,
dependency boundaries, unused-code analysis, secret scan, 50/50 tests and
`git diff --check`.
