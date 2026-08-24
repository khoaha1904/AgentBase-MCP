# serverless-data-pipelines-demo — agent OKF benchmark

- Agent: gpt-5.6-sol via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-author-v17
- Agent outcome: failed
- OKF validation: failed
- Authoring assessment: invalid
- Owner review: needs_revision
- Initial Ingest acceptance: invalid
- Semantic metrics: not scored because the mcp arm lifecycle failed

## Hard failures

- OKF bundle could not be loaded: agent run failed: final validate_okf_changes omitted finalized concepts: questions/question-e537834aff0b2f93d0870a23; prepare_hub_okf must run exactly once; observed 2
- OKF output contains no concept documents

## Limitations

- Deterministic source-path checks do not prove that authored observations are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
