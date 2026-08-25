# Verification: Bundled provider installation

**Date**: 2026-08-25

## Result

Linux x64 is implemented and qualified. Ordinary installation selects,
verifies and atomically activates the repository bundle; it does not invoke the
native build or download a provider. The exact real bundle rerun returned
`already-active`.

The platform bundle contains only:

- `codebase-memory-mcp` `0.10.8`, 48,818,560 bytes, executable mode `755`,
  SHA-256 `f2405c60305951ea94670156923e412d743c35e4997d2f20362625ddd368356c`;
- `artifact-manifest.json`, carrying the pinned source, parser-profile,
  accepted-tool-surface, platform and executable identities.

The Linux executable has no dynamic `libz` dependency. Temporary Ubuntu zlib
headers were used only for the maintainer build, were not installed on the
system and were moved to trash after packaging.

## Evidence

- Focused provider/installer/package suites: 14/14 passed.
- `npm run check:codebase-memory-bundle`: passed for `linux-x64`.
- `npm run typecheck`: passed.
- `npm run spec:check`: passed.
- Capability cross-artifact analysis: no unresolved contradiction, ambiguity
  or missing implementation task.
- `npm run verify`: passed; 72/72 tests, upstream inventories, dependency
  boundaries, unused-code check, secret scan and diff whitespace gate passed.

## Remaining platform release gate

`darwin-arm64` is deliberately not claimed as qualified. On one trusted company
Apple Silicon Mac, a maintainer must check out these exact reviewed bytes, use
the approved Node 24 and native toolchain, run:

```bash
npm run package:codebase-memory
npm run verify
```

The resulting `vendor/codebase-memory/artifacts/darwin-arm64/` executable and
manifest must be reviewed and committed before macOS users receive the release.
They then install with only `./install.sh`, exactly like Linux users.
