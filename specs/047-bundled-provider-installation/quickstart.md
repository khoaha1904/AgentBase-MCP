# Quickstart: Bundled provider installation

## Linux release preparation

```bash
npm run package:codebase-memory
npm run verify
```

Expected: `vendor/codebase-memory/artifacts/linux-x64/` contains one executable
and one manifest; runtime admission reports Codebase Memory `0.10.8`.

## Ordinary installation

With the approved internal npm registry configured:

```bash
./install.sh
```

Expected: no native compilation starts. The matching bundled provider is
activated before the client picker; an exact rerun preserves the same artifact.

## macOS company release gate

On an approved Apple Silicon company Mac with the native build prerequisites:

```bash
npm run package:codebase-memory
npm run verify
./install.sh
```

Commit/review the resulting `darwin-arm64` bundle inside the company repository.
Ordinary company users then run only `./install.sh`.
