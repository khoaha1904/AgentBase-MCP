# aws-health-aware — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-author-v15
- Agent outcome: failed
- OKF validation: failed
- Authoring assessment: invalid
- Owner review: needs_revision
- Initial Ingest acceptance: invalid
- Semantic metrics: not scored because the mcp arm lifecycle failed

## Hard failures

- OKF bundle could not be loaded: agent run failed: agent workspace must contain only okf/, found: nothing; required MCP tool did not complete successfully: get_okf_authoring_schemas; required MCP tool not observed: prepare_hub_okf; required MCP tool not observed: validate_okf_changes; required MCP tool not observed: finalize_hub_okf_proposal; required MCP tool not observed: inspect_hub_okf_proposal; prepare_hub_okf must run exactly once; observed 0; finalize_hub_okf_proposal must run exactly once; observed 0; inspect_hub_okf_proposal must run exactly once; observed 0; validate_okf_changes must run once, or twice after one repair; observed 0
- OKF output contains no concept documents

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
