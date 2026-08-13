# Verification: Graph Refresh Reuse

- **Date:** 2026-08-12
- **Provider:** exact managed `codebase-memory-mcp@0.10.1`
- **Transport:** bounded scoped session
- **Result:** exact-provider qualification passed

## Offline evidence

Requirement-linked tests cover receipt validation and atomic replacement,
private workspace separation, exact reuse, source/provider drift, malformed
state, explicit forcing, zero/one index calls, failure non-advancement, visible
`--refresh` recovery, no hidden retry and post-cleanup commit ordering.

The focused implementation run passed 18 tests, TypeScript checking and
architecture enforcement without an architecture exception or baseline growth.
Canonical `npm run verify` passed all 129 tests plus specification, type,
architecture and diff checks. Production audit reported zero vulnerabilities.
The architecture gate retains one non-failing review-size warning for the
245-line graph-round orchestrator; no exception or raised baseline was added.

## Exact-provider qualification

A disposable copy of the 12-file TypeScript fixture and a disposable private
state root ran six explicit short-lived sessions:

| Operation | Decision | Index ms | Total ms | Freshness observation |
|---|---|---:|---:|---|
| initial | refreshed / missing-receipt | 3660.121 | 4373.481 | accepted symbol found |
| reuse | reused / exact-match | 0 | 650.714 | same facts/sources |
| add | refreshed / source-changed | 3765.283 | 4471.857 | added symbol found |
| modify | refreshed / source-changed | 3634.960 | 4245.835 | modified symbol found |
| delete | refreshed / source-changed | 3613.085 | 4309.925 | deleted symbol absent |
| forced | refreshed / forced | 4832.556 | 5525.939 | accepted symbol found |

Every round reported unchanged source during its lifecycle and clean process
cleanup. A post-run process check found zero provider processes, and disposable
source/cache/receipt state was removed. Sanitized structured evidence is in
`fixtures/codebase-memory-v0.10.1/refresh.json`.

The delete check intentionally used search-only. Asking `trace_path` to trace an
already deleted function is an invalid provider request and correctly produces
a tool error; absence is therefore established through the provider's search
result after refresh.

## Accepted limitation

Reuse removed indexing and reduced the measured round from `4373.481ms` to
`650.714ms` on this warm fixture run. Changed and forced indexing still took
`3.61–4.83s`, so AgentBase makes no claim that the exact provider's refresh is
incrementally faster than full indexing, nor that this fixture predicts large-
repository performance.
