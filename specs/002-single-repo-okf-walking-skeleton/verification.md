# Verification: Single-Repository OKF Walking Skeleton

- **Status:** Completed
- **Date:** 2026-08-12

## User Story 1 checkpoint: real bounded repository evidence

The opt-in managed integration command ran against a disposable copy of the
12-file TypeScript fixture with `codebase-memory-mcp@0.10.1` and the accepted
package-private Linux x64 executable.

Observed result:

- exact npm integrity and executable SHA-256 matched the admitted identity;
- indexing used `mode=fast`, `persistence=false`, an exact allowed root and a
  private AgentBase cache outside the repository;
- architecture with `aspects: ["all"]` returned both expected boundaries;
- structural search returned `inspectWorkspace`;
- outbound depth-one trace returned `listModules` and `resolveWorkspace`;
- source snippets referenced exactly three of 12 authored files;
- all five manifest critical facts were present;
- the evidence bundle contained repository-relative source paths and no checkout
  root;
- source/control mutation checks passed;
- no provider process remained after command completion.

The disposable non-Git source state was recorded honestly as `commit: null`,
`dirty: true`, with safe authored-file digest
`sha256:d1884e483a45115935bce1a7bcf7ad66cc521ffe178e7d3e74ab8154cb146751`.
The resulting real evidence bundle digest was
`sha256:ca18bb4a19c85c3956e3c14d507f106291183dbd63764eb17db9de198dac0737`.

Two real-integration corrections were retained in code and ADR 0005:

1. v0.10.1 rejects a cache nested under `CBM_ALLOWED_ROOT`, so managed graph
   state is outside the checkout.
2. default architecture summary omits boundaries, so the adapter explicitly
   requests `aspects: ["all"]`.

The cold one-shot flow remained slow because it starts temporary coordination
for each operation. This is accepted walking-skeleton evidence, not proof of the
future interactive Part 1 latency target.

## Host-agent OKF proposal and rebuild rehearsal

The current coding agent used the repository-local `agentbase-okf` workflow on
a disposable repository under `/tmp`; the directory was removed after evidence
capture.

Revision A:

- base tree: empty-tree SHA-256
  `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
- proposal contained root index, repository, component, flow and open-question
  concepts;
- producer validation passed with zero failures and zero warnings;
- generated tree:
  `7487c7f3bdf67aae30a7736caff4faa0a2ff0302ab0df37226fe8a21dd4ff3d5`;
- diff showed five created files and explicit apply finalized.

The semantic rehearsal used explicit fixed evidence bindings (`sha256:` plus 64
`1` digits for revision A and 64 `2` digits for revision B) so proposal
base/evidence locking could be inspected independently. Its concept claims were
authored from the accepted real-provider facts above; the fixed bindings are
test identities, not additional provider evidence.

The maintainer then added one stable human guidance concept with persistent
defer directive `AB-DIRECTIVE-policy-owner`. Revision B:

- base tree:
  `56cf5266ad352ba8820893d9938b9d4e94c45911dce45b1e8d06e143a9ba35a7`;
- generated tree:
  `1067c0d3b593c664bfd1f6f3442e90aa40840ab957e95ec3204ebb4e8c2b54ac`;
- diff preserved repository, component and guidance; modified index and flow;
  and visibly deleted one obsolete AgentBase draft question;
- guidance SHA-256 remained byte-identical before and after rebuild:
  `0c647dfe3ac649314eeca2c93bff855c9e6b97c01e42ea38e4324d7484e49d68`;
- defer remained active after deletion. Its link to the deliberately absent
  question produced one expected permissive OKF broken-link warning;
- producer failures: zero; maintainer guidance corrections: one; owned draft
  deletions reviewed: one.

Automated rehearsal additionally injected every declared switch checkpoint,
verified restore/finish behavior, rejected stale base and competing writer, and
kept exact manifest path admission.

## Reviewability checkpoint

Architecture measurement at closure covered 48 authored TypeScript files: 33
production and 15 test files, with no boundary errors, warnings or exceptions.
Largest production file was `src/core/knowledge/okf-document.ts` at 240 lines
and 11,223 bytes; largest test file was
`src/core/code-intelligence/contract.test.ts` at 243 lines and 9,761 bytes.
Both remain inside the accepted review budgets; `architecture-baseline.json`
therefore stays empty rather than adding a stale exception.

The optional graph-assisted versus direct-source benchmark was not run. It does
not block this walking-skeleton release, and no speed claim is made.

## Final gate

`npm run verify` passed with 94 tests, zero failures, zero skipped/TODO tests,
clean specification/type/architecture checks and clean diff whitespace. The
repository-local `agentbase-okf` skill passed its structural validator and
`npm audit --omit=dev` reported zero known vulnerabilities at closure time.
