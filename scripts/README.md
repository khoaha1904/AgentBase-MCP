# Scripts

Repository automation is grouped by its operator goal:

- `checks/` — verification and test discovery used by `npm run verify`.
- `installation/` — installer, client registration and repository migration.
- `release/` - immutable application packaging and release qualification.
- `qualification/` - deterministic Hub workflow fixtures.
- `upstream/` - offline diagram skill asset and dependency checks.

Product runtime code belongs under `src/`; scripts should compose existing
public entrypoints instead of becoming another application layer.
