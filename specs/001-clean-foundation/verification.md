# Verification: Clean Foundation

- **Date:** 2026-08-11
- **Runtime:** Node.js `v24.18.0`
- **External engine:** not installed, downloaded or started
- **Architecture exceptions:** none

## Visible outcome

`npm run demo` completed successfully and reported:

- 12 authored fixture files in the repository map;
- all 6 expected neighborhood nodes;
- all 5 expected neighborhood edges;
- exactly 3 distinct referenced files, meeting the maximum of 3;
- 5 deterministic normalized runs;
- no missing node or edge ID;
- an explicit limitation that the snapshot is fake and no parsing occurred.

## Focused evidence

| Command | Result |
|---|---|
| `npm run test:code-intelligence` | Pass: provider-neutral normalization, validation and typed query behavior |
| `npm run test:fake-provider` | Pass: map, conformance, quality boundary and typed failures |
| `npm run test:foundation-demo` | Pass: combined flow, five-run byte equivalence and CLI JSON contract |
| `npm run architecture:check` | Pass: exhaustive ownership, public imports, direction, cycles and clean baseline |

## Complete gate

`npm run verify` passed with:

- specification checks passed;
- TypeScript `--noEmit` check passed;
- architecture checks passed with zero exception;
- 6 test files passed, 0 failed;
- `git diff --check` passed.

Convergence added explicit negative evidence for partial conformance, duplicate
edge IDs, empty and missing repositories, depth/filter query semantics and
reverse imports into root composition. The complete gate remained green with
the exact exception baseline still empty.

The gate used no network, credential, AI inference, daemon or external Code
Intelligence binary. npm dependency installation occurred once as the separately
approved setup action; normal demo and verification are local.
