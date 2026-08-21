# aws-health-aware — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-refresh-v1
- Agent outcome: failed
- OKF validation: failed
- Authoring assessment: invalid
- Owner review: needs_revision
- Initial Ingest acceptance: invalid
- Semantic metrics: not scored because the mcp arm lifecycle failed

## Hard failures

- OKF bundle could not be loaded: agent run failed: Refresh must finalize exactly one proposal; observed 0; required MCP tool did not complete successfully: validate_okf_changes; required MCP tool not observed: inspect_hub_okf_proposal; inspect_hub_okf_proposal must run exactly once; observed 0
- OKF output contains no concept documents

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
