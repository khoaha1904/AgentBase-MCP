# Research: ECS Full-stack Qualification

## Decision: Use two existing benchmark workflows

Initial Ingest reuses immutable `okf-author-v15` with `gpt-5.6-sol`. Refresh
reuses immutable `okf-refresh-v2` behavior under a new repository-specific
prompt identity with `gpt-5.6-terra` only if the Sol output is accepted as its
baseline.

**Rationale**: Model policy differs by workflow, while lifecycle contracts do
not. Separate manifests already express this without a runner abstraction.

## Decision: Pin a real full-stack source fixture

Use `aws-samples/amazon-ecs-fullstack-app-terraform` at commit
`98ee8e693a5ebc4b14f3dfe731bdc786637c1eb4`.

**Rationale**: It contains Vue client code, Node.js server code and Terraform for
two ECS services, ALBs, DynamoDB, S3, SNS, autoscaling and CI/CD. It is
structurally different from the Lambda fixture and still inside the approved
AWS/Terraform MVP.

## Decision: Mutate one cross-layer health contract

Replace `/status` with `/health` in `Code/server/src/app.js` and the two server
target groups in `Infrastructure/main.tf`.

**Rationale**: This is durable knowledge spanning implementation and desired
infrastructure, unlike a change-prone capacity number. Fixture preparation can
verify exact occurrence counts before committing the synthetic source revision.

## Decision: Do not change catalog behavior from this run

Concept coverage and granularity remain measured findings. Only deterministic
contract defects may be fixed directly; semantic variance requires recurrence
across structurally different repositories.
