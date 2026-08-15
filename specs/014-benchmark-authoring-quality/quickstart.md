# Quickstart: Evidence-First Benchmark Readiness

## Offline acceptance

```sh
node --test scripts/benchmark-agent.test.mjs scripts/benchmark-okf.test.mjs
npm run verify
```

Expected:

- invalid lifecycle, empty, conformance, policy, provenance, relationship and
  known-schema fixtures fail with exact hard failures;
- incomplete coverage and unjudged valid output remain reviewable;
- v3 prompts contain no fixture answers and MCP requires relationship-set validation;
- quality and efficiency remain separate.

## Retained evidence

Regenerate deterministic derived metrics only:

```sh
npm run benchmark:okf -- compare aws-serverless 2026-08-14T184644Z aws-health-aware
```

Expected: retained v2 MCP remains `invalid` for the exact missing relationship
link; missing Business Flow coverage is not the failure.

## Heterogeneous opt-in evidence

After offline acceptance:

```sh
npm run benchmark:okf -- pair aws-serverless aws-serverless-shopping-cart
npm run benchmark:okf -- compare aws-serverless <UTC-pair-id> aws-serverless-shopping-cart
```

Run both Health Aware and shopping cart with unchanged v3 prompts. If either MCP
arm is invalid, diagnose a general hard-gate or tool failure; do not add fixture
answers to the prompt.
