# Verification: AgentStack Foundation

**Date**: 2026-08-20

## Focused evidence

- Exact development dependencies installed: dependency-cruiser 18.2.0,
  `@swc/core` 1.16.0 and Knip 6.32.2; npm audit reported zero vulnerabilities.
- `node --test scripts/dependency-rules.test.mjs`: 4/4 passing. It proves one
  public cross-capability import is allowed and rejects one private import, one
  reverse layer dependency and one cycle.
- `npm run depcruise`: zero violations across 176 modules and 757 dependencies.
- `npm run knip`: zero findings or configuration hints.
- `npm run gitleaks`: approximately 13.42 MB scanned with redacted output and no
  leak finding.

## Canonical evidence

`npm run verify` passed:

- specification checks;
- TypeScript checking;
- dependency-cruiser;
- Knip;
- redacted Gitleaks;
- 355 offline tests;
- `git diff --check`.

No model benchmark, provider integration, Hub PR, publication, deployment or
network-backed product workflow was run.

## Requirement coverage

- AB-FND-010/011: ownership remains in the architecture index and native rules
  enforce public cross-capability entrypoints without a registry.
- AB-FND-012: native conformance fixtures and the real tree prove cycles and
  reverse layer dependencies fail.
- AB-FND-013: custom size/import metrics, tests, baseline and registry are gone.
- AB-FND-015/020/021/022: the composed gate includes exact development tools,
  bounded dead-code analysis and redacted native secret scanning.
