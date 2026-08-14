# Data Model: Agent-driven OKF Benchmark

## Benchmark Suite

- `suite`, `version`
- `catalogVersion`, `promptVersion`
- `agent`: provider, executable version, model, reasoning effort, timeout
- repositories: fixture identity and expectation file

## Repository Expectation

- concepts: expected `key`, semantic `identityTerms`, concrete OKF `type`, required metadata keys and required source paths
- relationships: source key, target key and relationship kind
- unexpected output policy: every authored concept needs one unique expected key

## Agent Run

- immutable input identity and timestamps
- agent executable/model/config and rendered prompt digest
- process outcome, exit/signal/duration
- source before/after commit and cleanliness
- artifact paths and required MCP tool usage derived from JSONL events

State transition: `created -> agent-succeeded|agent-failed -> finalized|invalid`.
Only `agent-succeeded` with required artifacts and unchanged source may finalize.

## Benchmark Metrics

- OKF conformance and validation failures
- schema precision/recall
- concept instance precision/recall
- metadata fields present/required
- relationships present/expected
- provenance paths present/required
- unexpected concept and relationship counts
