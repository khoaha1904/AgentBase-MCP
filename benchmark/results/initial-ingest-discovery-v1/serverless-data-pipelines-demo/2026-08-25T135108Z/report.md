# serverless-data-pipelines-demo — agent OKF benchmark

- Agent: gpt-5.6-sol via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-author-v19
- Agent outcome: failed
- OKF validation: failed
- Authoring assessment: invalid
- Owner review: needs_revision
- Initial Ingest acceptance: invalid
- Discovery qualification: failed; 2 representative checks
- Regression: No prior accepted run in this suite
- Semantic metrics: not scored because the mcp arm lifecycle failed

## Hard failures

- OKF bundle could not be loaded: agent run failed: agent workspace must contain exactly .agents/ and okf/, found: .agents; required MCP tool did not complete successfully: get_okf_authoring_schemas; required MCP tool not observed: prepare_hub_okf; required MCP tool not observed: validate_okf_changes; required MCP tool not observed: finalize_hub_okf_proposal; required MCP tool not observed: inspect_hub_okf_proposal; prepare_hub_okf must run exactly once; observed 0; inspect_hub_okf_proposal must run exactly once; observed 0; finalize_hub_okf_proposal must run once, or twice after one repair; observed 0; validate_okf_changes must run once, or twice after one repair; observed 0; get_okf_authoring_schemas must freeze one Receipt after at most one input correction; observed 2; successful guidance Inventory does not bind the observed Discovery Seed; P0 discovery group lacks an Inventory disposition: discovery-group-f108ff084a950d5763249777; P0 discovery group lacks an Inventory disposition: discovery-group-52e7741d3288dc14a44bfcc3; P0 discovery group lacks an Inventory disposition: discovery-group-dc4e86a371b2096e57ddda70; P0 discovery group lacks an Inventory disposition: discovery-group-39a19f6defb004464a342b53; representative Seed group lacks a proposal disposition: discovery-group-52e7741d3288dc14a44bfcc3; representative Seed group lacks a proposal disposition: discovery-group-f108ff084a950d5763249777; successful guidance did not return one Discovery Receipt
- OKF output contains no concept documents

## Defect boundaries

### OKF

- OKF bundle could not be loaded: agent run failed: agent workspace must contain exactly .agents/ and okf/, found: .agents; required MCP tool did not complete successfully: get_okf_authoring_schemas; required MCP tool not observed: prepare_hub_okf; required MCP tool not observed: validate_okf_changes; required MCP tool not observed: finalize_hub_okf_proposal; required MCP tool not observed: inspect_hub_okf_proposal; prepare_hub_okf must run exactly once; observed 0; inspect_hub_okf_proposal must run exactly once; observed 0; finalize_hub_okf_proposal must run once, or twice after one repair; observed 0; validate_okf_changes must run once, or twice after one repair; observed 0; get_okf_authoring_schemas must freeze one Receipt after at most one input correction; observed 2; successful guidance Inventory does not bind the observed Discovery Seed; P0 discovery group lacks an Inventory disposition: discovery-group-f108ff084a950d5763249777; P0 discovery group lacks an Inventory disposition: discovery-group-52e7741d3288dc14a44bfcc3; P0 discovery group lacks an Inventory disposition: discovery-group-dc4e86a371b2096e57ddda70; P0 discovery group lacks an Inventory disposition: discovery-group-39a19f6defb004464a342b53; representative Seed group lacks a proposal disposition: discovery-group-52e7741d3288dc14a44bfcc3; representative Seed group lacks a proposal disposition: discovery-group-f108ff084a950d5763249777; successful guidance did not return one Discovery Receipt
- OKF output contains no concept documents

### MCP/runtime

- agent workspace must contain exactly .agents/ and okf/, found: .agents
- required MCP tool did not complete successfully: get_okf_authoring_schemas
- required MCP tool not observed: prepare_hub_okf
- required MCP tool not observed: validate_okf_changes
- required MCP tool not observed: finalize_hub_okf_proposal
- required MCP tool not observed: inspect_hub_okf_proposal
- prepare_hub_okf must run exactly once; observed 0
- inspect_hub_okf_proposal must run exactly once; observed 0
- finalize_hub_okf_proposal must run once, or twice after one repair; observed 0
- validate_okf_changes must run once, or twice after one repair; observed 0
- get_okf_authoring_schemas must freeze one Receipt after at most one input correction; observed 2
- successful guidance Inventory does not bind the observed Discovery Seed
- P0 discovery group lacks an Inventory disposition: discovery-group-f108ff084a950d5763249777
- P0 discovery group lacks an Inventory disposition: discovery-group-52e7741d3288dc14a44bfcc3
- P0 discovery group lacks an Inventory disposition: discovery-group-dc4e86a371b2096e57ddda70
- P0 discovery group lacks an Inventory disposition: discovery-group-39a19f6defb004464a342b53
- representative Seed group lacks a proposal disposition: discovery-group-52e7741d3288dc14a44bfcc3
- representative Seed group lacks a proposal disposition: discovery-group-f108ff084a950d5763249777
- successful guidance did not return one Discovery Receipt

### Benchmark

- None

## Limitations

- Deterministic source-path checks do not prove that authored observations are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
