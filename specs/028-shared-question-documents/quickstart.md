# Quickstart: Validate Shared Question Documents

## Prerequisites

- Work from repository root with no real Hub credentials required.
- Use disposable local Hub fixtures only.

## Focused lifecycle

1. Run the existing local-only Hub lifecycle test.
2. Finalize a proposal containing one evidenced Question declaration.
3. Inspect the proposal and establish:
   - `questions/<stable-id>.md` exists;
   - `questions/index.md` contains its target exactly once;
   - no `questions.json` sidecar is required.
4. Accept, delete/omit machine-private Question files, then list/read the same
   Question from Hub as `open`.
5. Answer its exact revision as `human:test`; inspect that one proposal contains
   Guidance plus Question revision + 1 while accepted list/read remains `open`.
6. Accept the answer proposal and read the Question as `resolved` with Guidance.
7. Repeat with a stale revision and orphan Guidance fixture; both must stop before
   accepted mutation and explain recovery.

## Canonical validation

```sh
npm run verify
```

Expected: all 50 tests pass; no new dependency, network request, model call,
credential requirement or background process is introduced.
