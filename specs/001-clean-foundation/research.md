# Research: Clean Foundation Toolchain and Agent Controls

- **Date:** 2026-08-11
- **Scope:** foundation runtime, test/build shape and AgentDocks-derived
  repository controls

## Runtime

**Decision:** Propose Node.js 24 LTS with directly executed erasable TypeScript
and TypeScript used only for `--noEmit` static checking.

**Evidence:**

- the development machine already provides Node.js `v24.18.0` and npm
  `11.16.0`;
- Node.js lists version 24 as an LTS line suitable for production use:
  <https://nodejs.org/en/about/previous-releases>;
- Node.js 24.12 and later document built-in TypeScript type stripping as stable,
  while explicitly stating that it does not perform type checking:
  <https://nodejs.org/download/release/v24.14.0/docs/api/typescript.html>;
- the built-in test runner, filesystem, child-process and stream APIs cover the
  fake foundation and the later stdio provider boundary without a production
  framework dependency;
- direct TypeScript execution avoids a generated `dist/` tree during the clean
  foundation while retaining explicit contracts for agent navigation.

**Constraints:**

- use only erasable TypeScript syntax;
- use explicit relative `.ts` imports and no path aliases;
- keep `tsconfig.json` compatible with native execution using `noEmit`,
  `module: nodenext`, `erasableSyntaxOnly` and `verbatimModuleSyntax`;
- declare `>=24.12 <25` until a deliberate runtime ADR upgrades the major line;
- add no production dependency in Capability 001;
- development dependencies are limited to TypeScript and Node type definitions.

**Alternatives considered:**

- **Plain JavaScript ESM:** zero typechecking dependencies, but weakens the first
  provider-neutral contract and makes public surface discovery less precise.
- **Compiled TypeScript:** familiar packaging, but creates generated output and a
  second execution representation before packaging is in scope.
- **Python 3.12:** available locally and capable, but would require a separate
  typing/test/tooling decision while offering no clear advantage for the JSON,
  stdio and local CLI boundary.
- **Go or Rust:** attractive for a single binary, but neither compiler is
  installed locally and both add bootstrap cost before packaging or performance
  evidence requires them.
- **Node.js 26 Current:** newer, but the installed LTS line provides a smaller
  compatibility decision for the foundation.

## Test and verification toolchain

**Decision:** Use `node:test`, one recursive standard-library test runner and one
canonical `npm run verify` gate.

**Rationale:** The built-in runner keeps tests offline, supports colocated
capability suites and avoids a test framework dependency. A small recursive
runner makes nested tests discoverable without shell-specific glob behavior.

The verification order is:

```text
spec:check
  -> typecheck
  -> architecture:check
  -> test
  -> git diff --check
```

**Alternatives considered:** A third-party test framework adds no needed feature
for deterministic contracts; separate local and CI gates invite drift.

## Agent-first repository controls

**Decision:** Reimplement the smallest AgentBase-owned controls demonstrated by
AgentDocks instead of copying its scripts.

The foundation includes:

- a concise root route and a living `docs/specs/project-foundation.md` contract;
- capability-level public entrypoints;
- exhaustive source/test ownership with explicit root composition;
- private-import, dependency-direction, cycle and stale-registry checks;
- separate source/test review budgets and exact bounded exceptions;
- colocated tests and capability-owned test support;
- a canonical offline verification command.

Commit, push, deploy and full slice-declaration gates remain deferred. They need
evidence from real multi-session work and must not inflate the first vertical
slice.

## Review baseline

**Decision:** Start with an empty exception baseline and measured budgets derived
from the new clean files.

Initial hard ceilings are proposed at 300 physical lines for production files
and 350 for tests, plus long-line, byte and local-import signals. These are
review triggers, not instructions to split cohesive behavior. No Capability 001
file is expected to require an exception.

Post-implementation measurement covers 13 authored source/test files. The
largest production file is
`src/providers/fake-code-intelligence/fixture-snapshot.ts` at 132 lines and
4,455 bytes; the largest test is
`src/core/code-intelligence/contract.test.ts` at 133 lines and 5,195 bytes. Both
remain below their separate budgets, and `architecture-baseline.json` therefore
contains no file or dependency exception.

**Alternatives considered:** Copying AgentDocks thresholds without measurement
would turn evidence into convention; accepting wildcard exceptions would hide
new debt.

## Representative fixture

**Decision:** Use a checked-in 12-file TypeScript modular-monolith fixture.

The fixture contains three capabilities with public entrypoints, private
implementation and a cross-capability call chain. One declared coding task has
expected evidence in no more than three files. The fake snapshot is explicit
test data derived for that fixture; Capability 001 does not claim to parse it.

**Alternatives considered:** Using AgentBase's live source would make the
acceptance baseline move with implementation; copying a legacy repository would
import unrelated complexity; starting with Terraform would mix infrastructure
semantics into the provider-neutral navigation contract.
