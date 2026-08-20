# Quickstart: AgentStack Foundation

## Prerequisites

- Node.js and npm versions accepted by `package.json`.
- Dependencies installed from the committed lockfile.
- Reviewed native `gitleaks` available on `PATH` (`8.30.1` on this VPS).

## Focused validation

```sh
npm run depcruise
npm run knip
npm run gitleaks
node --test scripts/dependency-rules.test.mjs
```

Expected: the real repository and the allowed public-entrypoint fixture pass;
cycle, reverse-layer and cross-capability-private fixtures are rejected by the
focused test.

## Canonical gate

```sh
npm run verify
```

Expected: specification, type, architecture, dead-code, redacted-secret,
offline test and diff checks all pass without network or source mutation.

## Recovery

If a tool/config change fails, do not weaken or baseline the finding
automatically. Fix the actual dependency/dead-code/secret issue or revert to
checkpoint `117f640`. A missing gitleaks binary is an environment prerequisite
failure, not authorization to download it.
