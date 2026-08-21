# aws-health-aware — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.149.0
- Catalog/prompt: 6.0.0 / okf-author-v13
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: invalid
- Owner review: needs_revision
- Reference concept coverage: 38%
- Recognized schema agreement: 67%
- Metadata completeness: 100%
- Provenance coverage: 0%
- Reference relationship coverage: 13%
- Source-conflict visibility: 100%
- Live-evidence reference coverage: 100%
- Unjudged concepts / relationships: 1 / 2
- Missing reference concepts / relationships: 5 / 7

## Hard failures

- Reference aws-health-aware-system matched components/aha-scheduled-health-alert-processor but expected schema System, found Function

## Owner-review findings

- root index links directly to domains/health-operations.md instead of a bounded role index
- root index links directly to repositories/aws-health-aware.md instead of a bounded role index
- confirmed Domain is not reachable from root domains/index.md
- domains/health-operations.md: confirmed Domain does not navigate to a System
- domains/health-operations.md: Markdown body lacks reviewable substance

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
