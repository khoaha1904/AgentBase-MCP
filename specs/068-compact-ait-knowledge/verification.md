# Verification: Compact AIT knowledge

## Deterministic verification

- `node --test src/app/hub-okf/authoring/initial-ingest.test.ts src/app/hub-okf/authoring/receipt-authoring.test.ts`: 3/3 passed.
- `node --test src/core/knowledge/schemas/catalog.test.ts src/core/knowledge/schemas/guidance.test.ts`: 17/17 passed.
- `node --test scripts/benchmark/benchmark-okf.test.mjs`: 8/8 passed.
- `node --test src/app/hub-okf/workspace/local-only-e2e.test.ts`: 1/1 passed.
- `node --test src/app/hub-okf/visualization/visualization.test.ts`: 4/4 passed,
  including embedded-resource admission, exact-ARN coalescing, evidence-backed
  Embedded Relations, compact Repository cards, ownership-constrained dragging,
  resettable positions and hidden structural links.
- `npm run verify`: passed, including 158/158 repository tests, typecheck, dependency validation, secret scan and diff checks.

## Model-backed qualification

- C0 Initial Ingest run `2026-08-31T083459Z`: `review_ready`, 4 concepts,
  10 physical files, 100% critical/important probes, 463,303 ms.
- C1 Refresh run `2026-08-31T090320Z`: `knowledge_recalled`, 5/5 critical and
  1/1 important probes, no forbidden claims, complete 4-path change accounting,
  264,126 ms.
- C1 retains the same four concepts and ten physical files. Retry, DLQ and alarm
  knowledge remains embedded in the existing runtime boundary.

## Published review fixtures

- `AgentBase-Hub` was reset to clean Published baseline
  `2aad994d575d15cc146b68df3bd72eb8fb4b4eb1`.
- `hub-2` publishes C0 at `ffdebfa0c75e28d050f98c53872717b059e1aa14`.
- `hub-3` publishes C0 plus C1 at
  `8f08c2ecf1b98bf575d89063bb208db46eb4f0cf` and remains the active profile.
- All three exact commits passed AgentBase Hub CI. Old proposal branches were
  deleted; local credentials were preserved and stale local workflow state was
  moved to a recoverable backup.

## Visualization finding

Offline C0/C1 Domain sites were regenerated from the same four Published
concepts. Domain is page context and Repository is a compact selectable card
inside a fixed visual region. Shared/external nodes are labeled outside their
Repository regions; normal nodes can be repositioned only within their
ownership zone and reset to deterministic positions. C0 projects six nodes/seven edges and displays five
nodes/three runtime arrows. C1 projects eight nodes/eleven edges and displays
seven nodes/five runtime arrows, including the evidenced DLQ redrive and alarm
monitoring edges. Structural containment links remain in the projection but are
hidden from the diagram. Evidence is grouped by repository file and exact
citations remain available on demand.

The owner-approved public test snapshots were published in Domain Hub commit
`55383eb9472c1a15840a5acdeabb8f6bd6a632c5`. GitHub Pages deployment passed and
the served build receipts report generator v6, projection v3 and the exact C0/C1
Hub commits above. Desktop and mobile snapshots were inspected with the compact
Repository card, shared/external label, constrained node movement, reset action,
repository grouping and canvas pan/zoom.

The downstream AIT comparison remains a separate owner-defined application
scenario, consistent with the benchmark rule that deterministic recall never
reports `useful_for_ait`.
