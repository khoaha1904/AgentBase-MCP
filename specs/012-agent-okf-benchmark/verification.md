# Verification: Agent-driven OKF Benchmark

**Date**: 2026-08-14

## Offline evidence

`npm run verify` passed specification, type, architecture, 273 tests and diff
checks. Benchmark tests cover isolated Codex command construction, MCP policy,
fake-process artifacts, source immutability, semantic identity matching,
wrong-schema detection, shallow metadata, unexpected output and scoring through
an invalid root index.

## Real Terraform qualification

Codex CLI `0.147.0` with `gpt-5.6-terra` completed run
`2026-08-14T113246Z` against pinned `aws-health-aware` commit
`928494c70a904a65b877d426516882397541eafd`. The trace proves successful graph
index/read, catalog list/select/get and concept validation calls. The source
fixture remained clean.

The unmodified agent bundle scored:

- concept precision/recall: 83% / 100%
- schema precision/recall: 83% / 100%
- metadata completeness: 100%
- provenance coverage: 86%
- relationship coverage: 100%
- unexpected concepts/relationships: 1 / 5
- OKF conformance: failed because root `index.md` contains prose outside the
  admitted heading/link grammar

This is a valid non-passing baseline, not a product success claim. Semantic
scoring continues through the invalid index so the conformance defect does not
hide useful quality signals.

## Failure evidence

Runs `2026-08-14T112402Z` and `2026-08-14T112834Z` remain preserved as failed
diagnostics. They exposed Codex MCP-specific approval behavior; the runner now
sets `default_tools_approval_mode = "approve"` explicitly and counts only
successfully completed required tool calls.
