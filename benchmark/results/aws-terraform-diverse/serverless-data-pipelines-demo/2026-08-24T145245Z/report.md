# serverless-data-pipelines-demo — agent OKF benchmark

- Agent: gpt-5.6-sol via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-author-v15
- Agent outcome: failed
- OKF validation: failed
- Authoring assessment: invalid
- Owner review: needs_revision
- Initial Ingest acceptance: invalid
- Semantic metrics: not scored because the mcp arm lifecycle failed

## Hard failures

- OKF bundle could not be loaded: agent run failed: agent workspace must contain only okf/, found: nothing; required MCP tool did not complete successfully: configure_hub; required MCP tool did not complete successfully: preflight_hub_ingest; required MCP tool not observed: index_repository; required MCP tool not observed: get_architecture; required MCP tool not observed: get_okf_authoring_schemas; required MCP tool not observed: prepare_hub_okf; required MCP tool not observed: validate_okf_changes; required MCP tool not observed: finalize_hub_okf_proposal; required MCP tool not observed: inspect_hub_okf_proposal; index_repository must run exactly once; observed 0; get_architecture must run exactly once; observed 0; prepare_hub_okf must run exactly once; observed 0; finalize_hub_okf_proposal must run exactly once; observed 0; inspect_hub_okf_proposal must run exactly once; observed 0; validate_okf_changes must run once, or twice after one repair; observed 0; get_okf_authoring_schemas must succeed once, or succeed on one correction after retryable INVALID_ARGUMENT; observed 0
- OKF output contains no concept documents

## Limitations

- Deterministic source-path checks do not prove that authored observations are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
