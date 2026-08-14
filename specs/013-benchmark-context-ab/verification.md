# Verification: Benchmark Context A/B

**Date**: 2026-08-15

## Offline acceptance before real execution

- `node --test scripts/benchmark-agent.test.mjs scripts/benchmark-okf.test.mjs`
  passed 19/19 focused tests.
- `npm run verify` passed specification checks, TypeScript checking,
  architecture checking, the full offline suite and `git diff --check`.
- The full offline suite passed 282/282 tests with zero failures, skips or
  cancellations.
- Architecture verification reported zero errors and six unchanged warnings in
  previously baselined or review-sized runtime files.
- The final post-convergence gate passed again after exact MCP-call counting and
  the source-drift guard were added.

## Covered evidence

- MCP/direct process argument isolation and versioned prompt selection.
- Final completed-turn token normalization with unknown fields preserved.
- Sequential paired execution with common pinned inputs and isolated outputs.
- Side-by-side semantic quality, duration and token deltas without a winner.
- First-arm failure, timeout, missing output, malformed usage, source drift,
  retry rejection and retained partial evidence.

## Real product evidence

- `npm run benchmark:okf -- pair aws-serverless aws-health-aware 2026-08-14T181910Z`
  completed both arms successfully.
- `npm run benchmark:okf -- compare aws-serverless 2026-08-14T181910Z aws-health-aware`
  produced a complete deterministic comparison with no missing evidence.
- MCP/direct elapsed time was 155,167/205,359 ms. Input tokens were
  674,260/675,861; uncached input was 58,836/58,133; output was 6,023/9,359.
- MCP/direct concept precision and recall were 60%/60% and 22%/40%.
  Both bundles failed OKF conformance; MCP relationship coverage was 0%.
- Evidence is retained under
  `benchmark/results/aws-serverless/aws-health-aware/2026-08-14T181910Z/`.
- Conclusion: the pair shows faster MCP execution and better semantic quality,
  but neither adequate authoring quality nor meaningful input-token savings.
