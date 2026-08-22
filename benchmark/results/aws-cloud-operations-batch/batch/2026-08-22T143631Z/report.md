# aws-cloud-operations-batch — Batch Initial Ingest

- Outcome: valid_partial
- Proposal: 2422668c07e8418b3a2a43c8
- Domain: domains/cloud-operations
- Concepts: 7 {"Component":1,"Domain":1,"Repository":2,"Resource":1,"System":2}
- Elapsed: 426963 ms
- Tokens: {"inputTokens":1678744,"cachedInputTokens":1563136,"cacheWriteInputTokens":0,"uncachedInputTokens":115608,"outputTokens":17137,"reasoningOutputTokens":2125}

## Member attribution

- aws-health-aware (repository-aws-health-aware-ef3e83846625): 3 attributable concepts — components/components-aws-health-aware-event-processor.md, repositories/aws-health-aware.md, systems/systems-aws-health-aware.md
- sample-aws-devops-agent-terraform (repository-sample-aws-devops-agent-terraform-602f2c2bcf7c): 3 attributable concepts — repositories/sample-aws-devops-agent-terraform.md, resources/resources-aws-devops-agent-space.md, systems/systems-aws-devops-agent-monitoring.md
- Shared paths: components/index.md, domains/cloud-operations.md, domains/index.md, index.md, repositories/index.md, resources/index.md, systems/index.md

## OKF findings

- repository-aws-health-aware-ef3e83846625: Initial ingest is bounded to the repository README, the central Python event-processing paths identified by the graph, and selected Terraform resources.
- repository-aws-health-aware-ef3e83846625: CloudFormation parity, every message formatter, every deployment variant, and live AWS runtime state were not exhaustively verified.
- repository-aws-health-aware-ef3e83846625: Terraform describes desired infrastructure only; no deployed account, region, ARN, endpoint, or current event state is asserted.
- repository-sample-aws-devops-agent-terraform-602f2c2bcf7c: Initial ingest is bounded to the README, the graph-identified central Terraform agent-space and association declarations, and selected integration and cross-account declarations.
- repository-sample-aws-devops-agent-terraform-602f2c2bcf7c: All optional integration blocks, helper shell scripts, outputs, IAM policy details, and provider behavior were not exhaustively reviewed.
- repository-sample-aws-devops-agent-terraform-602f2c2bcf7c: Terraform represents desired state only; no deployed account, region, ARN, integration status, credential value, or live monitoring state is asserted.

## MCP/runtime findings

- None

## Benchmark findings

- None

Deterministic structure and paths cannot prove every authored claim; human review remains required.
