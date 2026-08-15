# aws-health-aware — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.147.0
- Catalog/prompt: 3.0.0 / okf-author-v2
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: invalid
- Reference concept coverage: 80%
- Recognized schema agreement: 100%
- Metadata completeness: 75%
- Provenance coverage: 71%
- Reference relationship coverage: 83%
- Unjudged concepts / relationships: 1 / 2
- Missing reference concepts / relationships: 1 / 1

## Hard failures

- repositories/repository-aws-health-aware-779eb7e1bc7a/infrastructure/aws/lambda/aha-lambda-function.md: relationship declared-by -> aha-deployment-terraform-module has no resolving Markdown link

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
