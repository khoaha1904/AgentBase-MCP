# Verification: Scoped Graph Session

- **Date:** 2026-08-12
- **Host scope:** accepted Linux x64 development host
- **Provider:** exact managed `codebase-memory-mcp@0.10.1`
- **Client:** exact `@modelcontextprotocol/client@2.0.0`
- **Fixture:** disposable copy of `fixtures/typescript-modular-monolith`

## Real paired promotion evidence

The benchmark alternated order and isolated every arm's private cache namespace.
All values below are monotonic milliseconds captured by the graph-round
diagnostics.

| Pair | Order | Transport | Admission | Index | Query | Cleanup | Total |
|---:|---:|---|---:|---:|---:|---:|---:|
| 1 | 1 | one-shot | 1529.435 | 12607.053 | 53212.155 | 0.122 | 67586.044 |
| 1 | 2 | scoped-session | 10555.718 | 3567.900 | 87.069 | 18.450 | 14444.403 |
| 2 | 1 | scoped-session | 10441.528 | 3545.755 | 81.929 | 21.022 | 14306.794 |
| 2 | 2 | one-shot | 1500.253 | 12485.410 | 52874.991 | 0.012 | 67073.047 |
| 3 | 1 | one-shot | 1543.752 | 12432.178 | 52736.433 | 0.014 | 66969.447 |
| 3 | 2 | scoped-session | 10622.214 | 3462.220 | 85.867 | 18.595 | 14405.099 |

- one-shot median total: `67073.047ms`;
- scoped-session median total: `14405.099ms`;
- speed ratio: `4.656201738x`;
- normalized parity: `true`;
- promotion eligible: `true`.

Every arm used repository identity
`repository-typescript-modular-monolith-6b7a9ffc3b0c` and dirty digest
`sha256:d1884e483a45115935bce1a7bcf7ad66cc521ffe178e7d3e74ab8154cb146751`.
Capture timestamps and transport invocation mode were intentionally excluded
from parity.

The five required facts were present in every arm: two architecture boundaries,
the `inspectWorkspace` search fact and outbound trace facts for `listModules`
and `resolveWorkspace`. Three exact snippet facts were also retained. All facts
referenced only:

- `src/app/inspect.ts`;
- `src/catalog/repository.ts`;
- `src/workspace/paths.ts`.

Every arm reported unchanged source, complete outcome and clean process cleanup.
The fixture copy was outside the AgentBase Git checkout and was removed after
the benchmark. No provider process remained after completion.

## Promotion decision

Scoped-session passed the required `<=50%` median threshold at approximately
`21.5%` of one-shot time while preserving the accepted evidence and safety
contract. It is the default real-evidence transport. One-shot remains an
explicit diagnostic/rollback transport; session failure never auto-falls back.

## Limitations

- The 12-file fixture mainly exposes repeated process startup cost.
- These measurements do not claim large-repository indexing, memory or context
  performance.
- Automatic source-change detection, incremental refresh, watcher ownership and
  cross-session reuse remain outside Capability 003.

## Verification gates

Final architecture measurement covered 55 TypeScript files and 6,661 physical lines
with zero errors and zero warnings. Production maxima were 240 lines, 11,223
bytes, 160-character line length, density 73 and 11 local imports. Test maxima
were 243 lines, 9,761 bytes, 173-character line length, density 60 and four
local imports. All remain within existing budgets, so
`scripts/architecture-baseline.json` stays empty; no ceiling or exception was
added.

`npm run verify` passed specification checks, typecheck, architecture checks,
whitespace checks and all `118/118` offline tests without native-provider,
credential, network or model execution. Production dependency audit found zero
vulnerabilities. The repository-local `agentbase-okf` skill passed the
Skill Creator structural validator under `python3`.

The promoted no-flag real integration independently returned
`transport=scoped-session`, `invocationMode=scoped-session`, all five required
facts plus three exact snippets across the same three files, unchanged source,
complete outcome and clean cleanup in `14576.688ms`. A process-table check
immediately afterward found zero `codebase-memory` process. After convergence
corrections, a final no-flag real integration repeated the same acceptance in
`14361.597ms`; another immediate process-table check again found zero provider
process.

Post-implementation convergence found and closed four specification gaps:
post-query and post-cleanup source/control drift, equal-but-incomplete benchmark
parity, accepted source-file bounds and typed failed-arm reporting. Focused
offline scenarios prove each correction without invoking the native provider.

The reusable unit-of-work-scoped session and evidence-gated promotion delta was
added to AgentStack's candidate managed-native-provider pattern. AgentStack
typecheck, two tests and whitespace verification passed.
