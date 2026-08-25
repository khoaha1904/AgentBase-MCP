# serverless-data-pipelines-demo — agent OKF benchmark

- Agent: gpt-5.6-sol via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-author-v22
- Agent outcome: failed
- OKF validation: failed
- Authoring assessment: invalid
- Owner review: needs_revision
- Initial Ingest acceptance: invalid
- Discovery qualification: passed; 2 representative checks
- Regression: No prior accepted run in this suite
- Semantic metrics: not scored because the mcp arm lifecycle failed

## Hard failures

- OKF bundle could not be loaded: agent run failed: agent exited 1; required MCP tool not observed: validate_okf_changes; required MCP tool not observed: finalize_hub_okf_proposal; required MCP tool not observed: inspect_hub_okf_proposal; inspect_hub_okf_proposal must run exactly once; observed 0; finalize_hub_okf_proposal must run once, or twice after one repair; observed 0; validate_okf_changes must run once, or twice after one repair; observed 0
- OKF output contains no concept documents

## Defect boundaries

### OKF

- OKF bundle could not be loaded: agent run failed: agent exited 1; required MCP tool not observed: validate_okf_changes; required MCP tool not observed: finalize_hub_okf_proposal; required MCP tool not observed: inspect_hub_okf_proposal; inspect_hub_okf_proposal must run exactly once; observed 0; finalize_hub_okf_proposal must run once, or twice after one repair; observed 0; validate_okf_changes must run once, or twice after one repair; observed 0
- OKF output contains no concept documents

### MCP/runtime

- agent exited 1
- required MCP tool not observed: validate_okf_changes
- required MCP tool not observed: finalize_hub_okf_proposal
- required MCP tool not observed: inspect_hub_okf_proposal
- inspect_hub_okf_proposal must run exactly once; observed 0
- finalize_hub_okf_proposal must run once, or twice after one repair; observed 0
- validate_okf_changes must run once, or twice after one repair; observed 0

### Benchmark

- None

## Limitations

- Deterministic source-path checks do not prove that authored observations are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
