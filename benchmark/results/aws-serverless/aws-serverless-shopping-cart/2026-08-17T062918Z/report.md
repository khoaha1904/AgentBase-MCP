# aws-serverless-shopping-cart — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.147.0
- Catalog/prompt: 5.0.0 / okf-author-v12
- Agent outcome: failed
- OKF validation: failed
- Authoring assessment: invalid
- Owner review: needs_revision
- Semantic metrics: not scored because the mcp arm lifecycle failed

## Hard failures

- OKF bundle could not be loaded: agent run failed: agent exited 1; required MCP tool not observed: index_repository; required MCP tool not observed: get_okf_authoring_schemas; required MCP tool not observed: validate_okf_changes
- OKF output contains no concept documents

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
