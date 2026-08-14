# Quickstart: Benchmark Context A/B

## Offline acceptance

```bash
node --test scripts/benchmark-agent.test.mjs scripts/benchmark-okf.test.mjs
npm run verify
```

The fake executable must prove:

- MCP arguments and required tools exist only in the `mcp` arm;
- both arms receive identical common inputs and isolated output directories;
- final usage is captured without converting missing values to zero;
- source fixtures stay clean for success, failure and timeout cases;
- partial pairs retain evidence and produce an incomplete comparison;
- complete comparisons show quality and efficiency separately with no winner.

## One real product-evidence pair

Run only after implementation is approved, offline verification passes, the
pinned Codex CLI is available and the fixture is clean:

```bash
npm run benchmark:okf -- pair aws-serverless aws-health-aware
npm run benchmark:okf -- compare aws-serverless <UTC-pair-id> aws-health-aware
```

Inspect `comparison.json`, the pair `report.md`, and both arm directories before
drawing a product conclusion. A single pair is evidence about this pinned task,
not a universal performance claim.
