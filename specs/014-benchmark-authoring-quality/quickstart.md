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
- v2 prompts contain no fixture answers;
- quality and efficiency remain separate.

## Retained evidence

Regenerate deterministic derived metrics only:

```sh
npm run benchmark:okf -- compare aws-serverless 2026-08-14T184644Z aws-health-aware
```

Expected: MCP is `reviewable`; missing Business Flow metadata/provenance remains
visible coverage, and no context-saving claim is made.

## Heterogeneous opt-in evidence

After offline acceptance:

```sh
npm run benchmark:okf -- pair aws-serverless aws-serverless-shopping-cart
npm run benchmark:okf -- compare aws-serverless <UTC-pair-id> aws-serverless-shopping-cart
```

Use the unchanged v2 prompts. If MCP is invalid, diagnose a general hard-gate or
tool failure; do not add shopping-cart answers to the prompt.
