# Verification: English repository language

## Result

The migration is complete. All AgentBase-owned tracked prose is in English,
while vendor snapshots, generated Hub CI and immutable fixtures remain excluded
from translation and language enforcement. No runtime contract or `src/` file
changed.

## Landed translation snapshot

- Final translation commit: `4886c52`
- Changed in the final batch: 44 current design files and one bug assessment

## Enforcement evidence

- `scripts/checks/check-specs.mjs` scans tracked, project-owned text and reports
  the first Vietnamese occurrence with its file and line.
- Explicit exclusions are limited to `vendor/`, `fixtures/` and generated
  `assets/hub-ci/` bytes.
- `[AB-LANG-006]` verifies rejection, line reporting, international Unicode and
  vendor exclusion.

## Repository evidence

- Focused repository-language test — passed.
- `npm run spec:check` — passed.
- `npm run verify` — passed.
- Full test suite — 138 passed, 0 failed.
- `git diff --check` — passed.

## Covered requirements

- `AB-LANG-001..005`: repository policy, translation scope, preservation rules,
  exclusions and reviewable commits are complete.
- `AB-LANG-006`: deterministic enforcement is part of the canonical repository
  gate and has requirement-linked acceptance evidence.
