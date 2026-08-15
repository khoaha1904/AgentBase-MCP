# Validation Quickstart: Canonical OKF Graph

Run focused catalog, relationship and Hub lifecycle tests:

```sh
node --test src/core/knowledge/schema-catalog.test.ts \
  src/core/knowledge/okf-relationships.test.ts \
  src/app/hub-okf/prepare.test.ts \
  src/app/hub-okf/refresh.test.ts
```

Run deterministic v5 scorer and sequential qualification tests:

```sh
node --test scripts/benchmark-okf.test.mjs scripts/benchmark-agent.test.mjs
```

Run the complete offline repository gate:

```sh
npm run verify
```

Expected outcome: canonical schemas and cross-root refresh tests pass; a
three-source scenario preserves one system graph; v5 reports owner-review
usefulness separately from validity and does not require `benchmark_key`.
