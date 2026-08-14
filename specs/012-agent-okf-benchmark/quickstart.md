# Quickstart: Agent-driven OKF Benchmark

## Offline gate

```bash
node --test scripts/benchmark-agent.test.mjs scripts/benchmark-okf.test.mjs
npm run verify
```

Expected: fake-process lifecycle and semantic scoring pass without network or
model credentials.

## Explicit real qualification

```bash
npm run benchmark:okf -- run aws-serverless aws-health-aware
npm run benchmark:okf -- finalize aws-serverless <run-id> aws-health-aware
```

Expected result directory contains `run.json`, rendered prompt, JSONL agent
events, final response, `okf/`, metrics and report. The source fixture remains
clean at its pinned commit.
