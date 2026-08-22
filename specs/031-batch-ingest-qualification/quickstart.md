# Quickstart: Batch Initial Ingest Qualification

## Offline

Run the focused deterministic lifecycle scenario, then `npm run verify`. Prove exact lifecycle,
one combined proposal, retained failure artifacts and forbidden call rejection.

## Explicit model probe

```bash
npm run benchmark:okf -- batch aws-cloud-operations-batch
```

Review `run.json`, `agent-events.jsonl`, `agent-final.md`, `okf/` and `report.md`.
Stop after the first run if lifecycle fails or a clear OKF blocker exists. Never
Accept, Publish, call provider CLI or open a Hub PR in this checkpoint.
