# Verification: Lazy Hub Configuration and Bootstrap

**Date:** 2026-08-13

## Result

Capability 009 converged with no remaining implementation task. `AB-HUB-SETUP-001..017` are present in the living Hub contract and traced to focused tests.

## Proven journeys

- Code Graph/MCP remains usable with Hub status `unconfigured`; Hub prepare returns the two setup choices without mutation.
- Existing-Hub attach validates exact credential-free GitHub URL, staged clean `main`, conformant OKF/README, base/head, remote identity and safe config; interruption, permission denial and active-Hub collision preserve prior state.
- New local Hub creates a private no-remote base with explicit base trailers, README and OKF v0.2 index. Two local proposals complete prepare/finalize/accept/query/pending end to end.
- `all-to-main` bootstraps exact active head and creates no PR.
- `base-to-main-knowledge-pr` bootstraps exact base and publishes all knowledge in one PR; the zero-knowledge case creates no PR.
- Populated remote and post-inspection ref race fail before an AgentBase push. Fetch/PR interruption retries exact recorded state without a second main push.
- Token canaries are absent from setup/bootstrap errors and non-secret configuration/receipts.

## Canonical gate

`npm run verify` passed:

- specification checks: passed;
- TypeScript typecheck: passed;
- architecture: 0 errors, 6 warnings;
- tests: passed (offline disposable Git and fake GitHub only);
- whitespace/diff check: passed.

The two changed cohesive hotspots (`hub-okf/index.ts` and `runtime-actions.ts`) use exact owner-reviewed non-growing marks. No file was split merely to reduce architecture metrics.

No real GitHub repository was mutated, and no installed/global Hub configuration or credential was read or changed during qualification.
