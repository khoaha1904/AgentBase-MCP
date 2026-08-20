# Verification Contract

## Native commands

- `npm run depcruise`: analyze `src/` using `.dependency-cruiser.cjs` and fail
  on a configured error.
- `npm run knip`: analyze explicit project/entrypoint scope using `knip.json`.
- `npm run gitleaks`: run the installed native gitleaks scanner against the
  working tree with default rules, project config and redacted output.

## Composed command

`npm run verify` includes, in fail-fast order:

1. specification consistency;
2. TypeScript checking;
3. dependency architecture;
4. dead-code/dependency health;
5. redacted secret scan;
6. offline tests;
7. Git diff whitespace validation.

Each command is read-only. Missing tooling, parse failure or a finding returns a
non-zero result. The contract does not install, retry, rewrite, baseline or
ignore the failure automatically.

## Preserved architecture facts

- local dependency cycles are forbidden;
- core cannot depend on providers or application workflows;
- providers cannot depend on application workflows;
- a capability may import its own private modules;
- another capability and the composition root may import only that capability's
  public `index.ts` entrypoint.

File size, byte size, density, maximum line length and local import counts are
not contract facts.
