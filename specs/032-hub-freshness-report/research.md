# Research: Hub Freshness Report

## Report level

**Decision**: Start with Repository observed-source checkpoints; retain the
existing per-value query for detailed snapshots.

**Rationale**: A maintainer needs to choose which Repository may need Refresh.
Scanning every value would duplicate detailed query output and make the report heavy.

**Alternatives considered**: Per-concept and per-value reports were rejected for
the first slice because they add volume without a clearer Refresh decision.

## Automation boundary

**Decision**: Return structured, in-memory data through local CLI and MCP; defer
CI and persisted Markdown.

**Rationale**: This makes freshness independently useful and gives later CI one
policy-free boundary to call. It also avoids writing derived data into Hub truth.

**Alternatives considered**: A checked-in report and GitHub workflow were deferred
because each adds publication, permissions and lifecycle decisions unrelated to
computing freshness.

## Age policy

**Decision**: Show exact time and age, clamp future-clock values to zero, and use
no stale threshold.

**Rationale**: Age is context rather than confidence or correctness.

**Alternatives considered**: 7/14/30-day labels were rejected as arbitrary global policy.

