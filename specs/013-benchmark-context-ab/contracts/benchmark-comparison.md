# Contract: Paired benchmark comparison

## Commands

The existing single-arm commands remain valid. The capability adds:

```text
npm run benchmark:okf -- pair <suite> <repository> [UTC-pair-id]
npm run benchmark:okf -- compare <suite> <UTC-pair-id> <repository>
```

`pair` is the only model-backed step and remains explicit opt-in. It creates the
common envelope, runs `mcp` and `direct` sequentially, and retains each arm's
artifacts even when one fails. `compare` is deterministic and model-free; it
scores available successful arms and writes a complete or incomplete report.

## Result layout

```text
benchmark/results/<suite>/<repository>/<UTC-pair-id>/
├── pair.json
├── mcp/
│   ├── run.json
│   ├── prompt.md
│   ├── agent-events.jsonl
│   ├── agent-final.md
│   ├── okf/
│   ├── metrics.json
│   └── report.md
├── direct/
│   └── <same arm artifacts>
├── comparison.json
└── report.md
```

Failed arms may omit artifacts they never produced. Their `run.json`, trace,
stderr and explicit failures remain when available.

## Arm policy

### `mcp`

- Uses the pinned existing MCP authoring prompt and AgentBase MCP CLI config.
- Must observe all tools required by the current benchmark contract.
- May inspect authorized source when graph evidence is insufficient.

### `direct`

- Uses a versioned prompt with the same authoring goal and output restrictions.
- Receives no AgentBase MCP configuration and has no AgentBase tool requirement.
- Investigates the authorized source directly with ordinary host-agent
  capabilities and must not read expectations or previous results.

## Usage normalization

From the final valid completed-turn usage event:

- `inputTokens` <- `input_tokens`
- `cachedInputTokens` <- `cached_input_tokens`
- `cacheWriteInputTokens` <- `cache_write_input_tokens`
- `outputTokens` <- `output_tokens`
- `reasoningOutputTokens` <- `reasoning_output_tokens`
- `uncachedInputTokens` <- `inputTokens - cachedInputTokens` only when both are
  present and the result is non-negative

Unknown fields remain unavailable. The raw event trace is authoritative.

## Comparison behavior

- Quality contains the existing metric set unchanged for each arm.
- Efficiency contains token categories and elapsed milliseconds for each arm.
- Deltas use `mcp - direct`; negative token or duration deltas mean the MCP arm
  used less.
- Activity counts are observations, not proof of total source-read volume.
- No overall winner is emitted.
- If either arm is not finalizable, the comparison is `incomplete`, lists exact
  reasons, retains any available per-arm values and causes the compare command to
  exit unsuccessfully.

## Compatibility

- Existing `run` and `finalize` commands and historical single-arm result layout
  remain supported.
- Existing expectation and scoring formats do not change.
- Canonical verification uses only a fake executable and local temporary Git
  fixtures.
