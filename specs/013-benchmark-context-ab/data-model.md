# Data Model: Benchmark Context A/B

## BenchmarkPair

Represents one comparable two-arm experiment.

| Field | Meaning |
|---|---|
| `suite`, `repository`, `pairId` | Stable result identity |
| `status` | `running`, `complete`, or `incomplete` |
| `startedAt`, `completedAt` | Pair lifecycle timestamps |
| `commonInputs` | Fixture commit, expectation digest, catalog, model, effort and authoring-goal identity shared by both arms |
| `agentBaseSource` | AgentBase repository identity, commit, dirty flag and safe dirty digest captured before result creation |
| `arms` | Fixed references to `mcp` and `direct` arm directories and outcomes |
| `failures` | Pair-level reasons that prevent a complete comparison |

### Invariants

- Exactly one `mcp` and one `direct` arm belong to a pair.
- Common inputs are written before arm execution and never recomputed from
  generated results.
- `complete` requires both arms to have finalizable semantic metrics and required
  execution measurements; otherwise status is `incomplete`.

## BenchmarkArmRun

Extends the existing `run.json` evidence for one agent process.

| Field | Meaning |
|---|---|
| `arm` | `mcp` or `direct` |
| Existing run identity | Suite, repository, fixture, catalog, prompt digest and agent config |
| `startedAt`, `completedAt`, `outcome` | Arm lifecycle |
| `process` | Exit code, signal and bounded process error |
| `usage` | Optional token categories and derived uncached input |
| `activity` | Directly observed MCP and shell-command counts; source-read volume is nullable |
| `requiredToolUsage` | Required MCP observations for `mcp`; empty for `direct` |
| `failures` | Explicit lifecycle, source, output or arm-policy failures |

### Invariants

- A direct arm has no AgentBase MCP CLI configuration and no required MCP tools.
- An MCP arm retains all existing required-tool checks.
- Missing usage fields are `null` or absent, never coerced to zero.
- Portable artifacts contain placeholders instead of machine-local roots.

## ArmMetrics

The existing semantic benchmark metrics plus arm and pair identity. Scoring
behavior is unchanged.

## PairComparison

| Section | Contents |
|---|---|
| `completeness` | Complete/incomplete state and reasons |
| `quality` | Existing conformance and semantic metrics for each arm |
| `efficiency` | Duration and token categories for each arm, plus comparable deltas |
| `activity` | Directly observed tool/command data and explicit measurement limitations |

### Invariants

- No `winner`, aggregate score or weighted rank field exists.
- A delta is present only when both arm values have the same meaning and are
  available.
- Partial pair evidence remains readable even when comparison finalization exits
  unsuccessfully.

## State Transitions

```text
pair running
  -> MCP arm terminal
  -> direct arm terminal
  -> complete    (both arms finalizable and comparison written)
  -> incomplete  (either arm failed, drifted, lacks required evidence, or cannot be scored)
```
