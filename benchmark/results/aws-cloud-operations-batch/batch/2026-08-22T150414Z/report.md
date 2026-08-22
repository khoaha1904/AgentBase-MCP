# aws-cloud-operations-batch — Batch Initial Ingest

- Outcome: valid_partial
- Proposal: c7175b9206bff9723fa63da8
- Domain: domains/cloud-operations
- Concepts: 7 {"Component":1,"Domain":1,"Repository":2,"Resource":1,"System":2}
- Elapsed: 360904 ms
- Tokens: {"inputTokens":1459729,"cachedInputTokens":1339648,"cacheWriteInputTokens":0,"uncachedInputTokens":120081,"outputTokens":12989,"reasoningOutputTokens":2909}

## Member attribution

- aws-health-aware (repository-aws-health-aware-ef3e83846625): 3 attributable concepts — components/aws-health-alert-delivery.md, repositories/aws-health-aware.md, systems/aws-health-aware.md
- sample-aws-devops-agent-terraform (repository-sample-aws-devops-agent-terraform-602f2c2bcf7c): 3 attributable concepts — repositories/sample-aws-devops-agent-terraform.md, resources/aws-devops-agent-space.md, systems/aws-devops-agent-monitoring.md
- Shared paths: components/index.md, domains/cloud-operations.md, domains/index.md, index.md, repositories/index.md, resources/index.md, systems/index.md

## OKF findings

- repository-aws-health-aware-ef3e83846625: Static repository evidence and Terraform desired state were reviewed; no deployed AWS account, region, ARN, endpoint configuration, or runtime health was verified.
- repository-aws-health-aware-ef3e83846625: Image assets were excluded from the code graph by design, and no runtime/provider CLI inspection was performed.
- repository-aws-health-aware-ef3e83846625: Internal message formatting, state tables, Lambda runtimes, and schedules are embedded because the source does not show independent ownership or operation.
- repository-sample-aws-devops-agent-terraform-602f2c2bcf7c: Static README and Terraform desired state were reviewed; no terraform plan/apply, AWS account, agent-space ID, ARN, region, association status, credentials, or runtime health was verified.
- repository-sample-aws-devops-agent-terraform-602f2c2bcf7c: Optional cross-account and third-party integration paths depend on configuration and may not be instantiated.
- repository-sample-aws-devops-agent-terraform-602f2c2bcf7c: Account associations, IAM roles, third-party registrations, and the echo Lambda are embedded because they are supporting or example resources rather than separately owned operational concepts.

## MCP/runtime findings

- None

## Benchmark findings

- None

Deterministic structure and paths cannot prove every authored claim; human review remains required.
