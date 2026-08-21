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
- Provenance coverage: 11%
- Reference relationship coverage: 13%
- Source-conflict visibility: 100%
- Live-evidence reference coverage: 100%
- Unjudged concepts / relationships: 0 / 0
- Missing reference concepts / relationships: 5 / 7

## Hard failures

- Reference aws-health-aware-system matched resources/aha-excluded-account-list-storage but expected schema System, found Object Storage

## Owner-review findings

- domains/health-operations.md: confirmed Domain does not navigate to a System
- domains/health-operations.md: Markdown body lacks reviewable substance

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
