# Quickstart: Scoped Graph Session

## Prerequisites

- Node.js in the version range declared by `package.json`.
- Dependencies installed with the reviewed lockfile.
- Supported Linux x64 host for the real managed-provider commands.
- No cloud credential, API key or separately installed Codebase Memory binary.

## 1. Canonical offline gate

```bash
npm run verify
```

Expected: specification, type, architecture and fake/captured session tests pass
without starting or downloading the native provider.

## 2. Default scoped session path

```bash
npm run integration:codebase-memory -- \
  ./fixtures/typescript-modular-monolith inspectWorkspace
```

Expected: the same five critical facts and no more than three source files are
returned through one short-lived `scoped-session`. Cleanup is `clean`; no
standing process or hidden fallback remains.

## 3. Explicit one-shot rollback

```bash
npm run integration:codebase-memory -- \
  ./fixtures/typescript-modular-monolith inspectWorkspace \
  --transport one-shot
```

Expected: one JSON result identifies `one-shot`, preserves the accepted
evidence and stage diagnostics, leaves fixture source unchanged and leaves no
provider process.

## 4. Paired promotion benchmark

```bash
npm run benchmark:codebase-memory
```

Expected: three alternating pairs, six raw timing records, parity details,
medians, speed ratio and a visible `promotionEligible` decision. The report is
specific to this fixture and host. The accepted promotion run measured
`67073.047ms` one-shot median versus `14405.099ms` scoped-session median
(`4.656x`) with full parity and clean cleanup.

## Failure checks

- Missing/corrupt managed package stops before session start.
- Protocol or tool errors return a typed failure and no partial evidence.
- Timeout/output overflow closes the session.
- Source drift or forbidden repository mutation rejects the result.
- One-shot remains explicitly runnable after a failed session.
