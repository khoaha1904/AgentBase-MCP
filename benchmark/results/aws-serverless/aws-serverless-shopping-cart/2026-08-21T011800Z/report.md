# aws-serverless-shopping-cart — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.147.0
- Catalog/prompt: 6.0.0 / okf-author-v13
- Agent outcome: failed
- OKF validation: failed
- Authoring assessment: invalid
- Owner review: needs_revision
- Semantic metrics: not scored because the mcp arm lifecycle failed

## Hard failures

- OKF bundle could not be loaded: agent run failed: agent workspace must contain only okf/, found: nothing; required MCP tool not observed: index_repository; required MCP tool not observed: get_architecture; required MCP tool not observed: finalize_hub_okf_proposal; required MCP tool not observed: inspect_hub_okf_proposal; finalize_hub_okf_proposal must run exactly once; observed 3; inspect_hub_okf_proposal must run exactly once; observed 0; validate_okf_changes must run once, or twice after one repair; observed 4
- OKF output contains no concept documents

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
