# Quickstart: Single-Repository OKF Bundle Walking Skeleton

This is the intended validation and user flow after Capability 002 is
implemented. AgentBase owns the exact Codebase Memory dependency; users never
provide a binary path.

## Prerequisites

- Node.js `>=24.12 <25` and dependencies from the accepted lockfile.
- Network access during package installation so the exact
  `codebase-memory-mcp@0.10.1` wrapper can obtain and checksum-verify its
  platform binary. A previously populated package-private binary works offline.
- A local TypeScript repository. The 12-file fixture is the acceptance baseline.

## Canonical offline gate

```bash
npm run verify
```

Expected: specification, type, architecture, captured-provider contract, OKF
`v0.2` conformance, bundle proposal/recovery and diff checks pass without a real
provider, model call, daemon, watcher, network or credentials.

## Opt-in real provider

Before indexing a user repo:

```bash
npm run integration:codebase-memory -- \
  /absolute/path/to/typescript-repository inspectWorkspace
```

Expected on the currently exercised Linux x64 path: AgentBase resolves only its managed dependency, records package and
engine identity, one-shot commands leave no standing process, accepted evidence
fits within three fixture files, and the selected repository is not silently
modified. It never searches `PATH` or invokes native install/config commands.
Its owner-private cache is outside the selected checkout because v0.10.1 rejects
a cache nested inside `CBM_ALLOWED_ROOT`.

## Prepare a bundle proposal

```bash
node src/cli.ts okf prepare \
  --repo /absolute/path/to/repository
```

Preparation reports source/engine identity, evidence digest, current bundle tree
digest, limitations and a proposal ID in `prepared` state. It byte-copies the
current bundle under:

```text
.agentbase/proposals/<proposal-id>/bundle/
```

The host agent follows `.agents/skills/agentbase-okf/SKILL.md` and authors linked
OKF concepts only inside that proposal's `bundle/`. It does not write one
aggregate `OKF.md`. Successful validation records the exact generated tree
digest and the agent presents its diff before requesting apply approval.

## Expected proposal shape

```text
bundle/
  index.md
  repositories/<repo>.md
  components/<component>.md
  flows/<flow>.md
  questions/<question>.md
```

Every concept has YAML frontmatter with `type`. Generated concepts explicitly
use `status: draft`, record `generated`, omit `verified`, and attach supported
sources. Root `index.md` declares `okf_version: "0.2"` and links concepts.

An existing `log.md` is consumed and validated, but the MVP does not require the
producer to generate one.

## Diagnostic validation and diff

```bash
node src/cli.ts okf validate --repo /absolute/path/to/repository --proposal <id>
node src/cli.ts okf diff --repo /absolute/path/to/repository --proposal <id>
```

These commands support diagnosis; the host-agent happy path runs them and shows
the result automatically. Validation reports base OKF conformance separately
from AgentBase producer rules, plus warnings, protected concepts and
created/modified/preserved/deleted-AgentBase-draft/prohibited-deletion files.
Current `okf/` remains unchanged.

## Explicit apply and recovery

Only after reviewing that exact diff:

```bash
node src/cli.ts okf apply --repo /absolute/path/to/repository --proposal <id>
```

Expected: the validated complete proposal becomes current `okf/`. A stale tree,
invalid bundle or protected mutation/deletion is rejected. A deletion is allowed
only for an explicitly AgentBase-generated draft shown in the reviewed diff.

If an apply was interrupted:

```bash
node src/cli.ts okf recover --repo /absolute/path/to/repository
```

Normally AgentBase suggests this exact command only after detecting incomplete
apply state. Recovery follows the exact manifest and restores the previous valid
bundle or finishes the intended switch before new proposal work. Competing
state-changing commands fail on the repository-local exclusive lock.

## Human correction and defer rehearsal

1. Add `okf/guidance/<id>.md` with `type: Maintainer Guidance`,
   `generated.by: human:<id>` and a link to its subject.
2. Optionally add the documented `agentbase.directive` defer extension with a
   stable directive ID and subject.
3. Prepare again and confirm guidance bytes are preserved and the matching
   question remains suppressed.
4. Remove or explicitly reopen the directive when the question should return.
5. Remove one stale AgentBase-generated draft in the proposal, confirm deletion
   is visible in diff, and apply explicitly while protected files remain exact.

## Optional benchmark evidence

Record graph-assisted and direct-source arms separately in `benchmark.md` with:

- elapsed wall time;
- files and bytes shown to the agent;
- required facts found;
- maintainer corrections to the first proposed bundle.

The first result establishes a baseline rather than passing an invented speed
threshold. Its absence does not block the walking-skeleton release.
