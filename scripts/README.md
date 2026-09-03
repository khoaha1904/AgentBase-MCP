# Scripts

Repository automation is grouped by its operator goal:

- `checks/` — verification and test discovery used by `npm run verify`.
- `installation/` — installer, client registration and repository migration.
- `benchmark/` — opt-in benchmark engine/scorer; benchmark data lives in the
  sibling `AgentBase-Benchmark` repository.

Product runtime code belongs under `src/`; scripts should compose existing
public entrypoints instead of becoming another application layer.
