# Verification: Unify Product Skills

Verified on 2026-08-24.

## Focused evidence

- All eight released directories pass `skill-creator`'s `quick_validate.py`.
- `node --test scripts/installation/product-skills.test.mjs` passes one
  requirement-linked test for the exact six-public/two-internal catalog on
  Codex and Claude Code, exact rerun, conflict preflight and rollback.
- Catalog assertions reject `speckit-*` installation and any `abs-*` entry.
- Manual routing review covers Hub-first, Code-first, combined, degraded and
  conflicting evidence with no mutating authorization.

## Canonical gate

`npm run verify` passes:

- specification and generated Hub-validator checks;
- TypeScript, dependency-cruiser and Knip;
- Gitleaks with no detected leak;
- 50/50 design-level tests;
- `git diff --check`.

The released MCP inventory remains 42 tools. No dependency, router tool, model
runtime, alias artifact or model benchmark was added.
