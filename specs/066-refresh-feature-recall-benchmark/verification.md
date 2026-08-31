# Verification: Refresh feature-recall benchmark

## Deterministic gates

- Focused benchmark tests: 8/8 passed.
- Canonical `npm run verify`: 154/154 passed with specification, upstream,
  bundle, Hub validator, type, dependency, Knip, Gitleaks and diff checks.
- C0 parses as 24 concepts; the C1 manifest applies exactly four changed paths.
- Source fixture and operator `hub-3` stayed clean; `hub-3` remained at Published
  commit `521f5bfffccb7918076f5b287bbfd78d052ed0fc`.

## Retained runs

- `2026-08-30T175729Z`: 33,260 ms; benchmark setup failed because the obsolete
  runner created a retired local-only Hub profile.
- `2026-08-30T180100Z`: 33,397 ms; remote-profile setup reached product
  preflight but lacked benchmark source-snapshot authority.
- `2026-08-30T180558Z`: 176,520 ms; complete proposal and inspection retained.
  All four paths were accounted and all three critical feature atoms were
  source-evidenced. Lifecycle failed because Finalize ran twice. Both new
  Resources lacked structured Domain integration and were absent from the
  deterministic Crawler visualization projection.

## Classification

- Hub data sufficiency for feature detail: pass for this fixture.
- Change-accounting handoff: pass, 4/4.
- AIT diagram usefulness: needs revision, 0/2 new Resource topology links.
- Lifecycle: invalid due validation/Finalize parity and a second Finalize call.
- C2: not authorized.

Owner review artifact:
`AgentBase-Benchmark/results/refresh-retry-dlq/crawler-worker/2026-08-30T180558Z/owner-audit.md`.
