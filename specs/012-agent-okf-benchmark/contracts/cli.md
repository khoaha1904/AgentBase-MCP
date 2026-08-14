# CLI Contract

```text
npm run benchmark:okf -- run <suite> [repository] [UTC-run-id]
npm run benchmark:okf -- finalize <suite> <UTC-run-id> [repository]
```

`run` is the only command that invokes a model. It validates pinned clean
fixtures and Codex version before any agent process, creates one result per
selected repository, and records failure artifacts without claiming success.

`finalize` is deterministic and model-free. It rejects an unsuccessful run,
source drift, missing trace/prompt/output, invalid OKF or mismatched catalog.
It writes `metrics.json` and `report.md` for every selected repository.

Exit `0` means every selected operation completed. Invalid input, agent
failure, semantic/structural validation failure or source drift returns
non-zero while preserving bounded diagnostics.
