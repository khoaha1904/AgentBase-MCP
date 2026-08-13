# Quickstart: Explicit Observation Command

```bash
node src/cli.ts observe /absolute/path/to/repository symbolName
```

Expected: one provenance-bearing repository evidence JSON bundle. Redirect it
to a local ignored file only when retention is desired.

Confirm separation:

```bash
node src/cli.ts okf
```

The second command has its own usage/workflow. The first command never creates
or applies OKF.

Verification:

```bash
node --test src/app/repository-okf/real-evidence.test.ts
npm run verify
```
