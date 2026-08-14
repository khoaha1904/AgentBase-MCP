# Architecture

## Style

Start as a modular monolith. The goal is strong ownership and cheap navigation,
not early distribution.

The design follows five agent-friendly rules:

1. every file belongs to one capability;
2. every capability exposes a small public entrypoint;
3. cross-capability imports use public entrypoints only;
4. tests and deterministic test support stay with their owner;
5. automated checks enforce boundaries, cycles and review-size budgets.

Agent navigation follows one progressive route:

```text
AGENTS.md
  -> this ownership index
  -> affected living requirement under docs/specs/
  -> active or relevant numbered change artifact under specs/
  -> capability public entrypoint
  -> focused requirement-linked tests
  -> smallest responsible private implementation
```

Living requirements remain current after a change closes. Numbered capability
artifacts record one change and become historical; they do not silently override
the living contract.

## Intended capability map

The exact folders are created only when the active plan selects a runtime. The
target ownership map is:

```text
src/
  core/
    code-intelligence/   # provider-neutral indexing/query contracts
    observations/       # normalized evidence leaving the local graph
    knowledge/          # OKF bundles, concrete schemas and local query rules
    hub/                # local proposal ancestry and sync transitions
  providers/
    fake-code-intelligence/  # deterministic conformance provider
    codebase-memory/     # pinned engine adapter; no knowledge policy
    github-hub/          # bounded Git/worktree/GitHub transport
  app/                   # capability-owned user workflows
  cli.*                  # explicit root composition entrypoint
```

Only folders required by the active capability are created. Documented future
boundaries are not empty scaffolding.

Dependency direction:

```text
app -> core public contracts
app -> provider public adapters
providers -> core contracts
knowledge -> observations
observations -> code-intelligence contracts
core -X-> providers
```

Core policy must never import a concrete engine. Engine-specific identifiers or
graph records must not leak into the OKF model.

## Public entrypoints

Each capability exposes one intentionally small `index` module. Internal files
may import within their capability. External callers may import only that public
module. A machine-readable ownership registry and architecture test must make
this enforceable before implementation grows.

Root composition files are explicit registry entries. Every other authored
runtime source and colocated test file must match exactly one non-overlapping
capability owner. New generic `common`, `utils` or `helpers` areas require a
present responsibility and consumer; possible future reuse is insufficient.

## Tests

Tests live beside the behavior they protect and mirror product seams:

- contract tests define engine-independent Code Intelligence behavior;
- adapter conformance tests run the same fixtures against each engine;
- observation tests prove stable normalization and provenance;
- knowledge lifecycle tests prove cumulative ingest and explicit state changes;
- product-flow tests cover only a few complete journeys.

Changing one capability should normally require its focused tests plus boundary
checks. Broader verification is reserved for public-contract or composition
changes.

## Review-size budgets

Source and test files need measured review budgets. The first implementation
must establish thresholds from a small clean baseline. Exceeding a threshold is
an investigation signal, not an automatic demand for arbitrary splitting.

The reviewer must assess responsibility and cohesion before changing structure.
A split is valid only when each result has a distinct, nameable responsibility
and a meaningful reason to change independently. Forwarding wrappers, artificial
barrels and small miscellaneous fragments created only to lower a metric are a
failed architecture review, even if the numeric check becomes green. Cohesive
public entrypoints and composition roots may instead carry one exact reviewed
baseline mark; the mark lowers the finding to a visible warning and caps future
growth.

The clean foundation starts with no exception. A future exception must name one
exact file or dependency edge, record owner approval and a removal/review reason,
remain non-growing and fail when stale. Broad wildcard allowances are not a
review baseline.

The boundary checker should reject:

- private cross-capability imports;
- reverse dependencies and dependency cycles;
- unknown or overlapping file ownership;
- stale exceptions;
- unexplained growth beyond the accepted review baseline.

## State boundaries

Keep three state classes separate:

| State | Scope | Durable/shared | Rebuildable |
|---|---|---:|---:|
| Engine cache and detailed graph | Machine/repository | No | Yes |
| Graph freshness receipt | Machine/repository/provider namespace | No | Yes |
| Repository evidence bundle | Machine/source revision | No in this MVP | Yes from source/provider |
| Accepted OKF knowledge | Team/product | Yes | Governed, not overwritten |

All engine caches must be namespaced by repository identity, engine version and
adapter schema. An upgrade creates a new cache and passes conformance before an
active pointer changes. Keep the previous working version available for
rollback.

## Provider coexistence

AgentBase should manage its supported engine binary and cache explicitly. It
must not discover an arbitrary executable from `PATH`, mutate a user's global
installation or assume that a separately configured MCP uses a compatible
version.

Capabilities `002-single-repo-okf-walking-skeleton` and
`003-scoped-graph-session` follow this ownership model through exact runtime
dependency `codebase-memory-mcp@0.10.1`. Its official npm wrapper owns
checksum-verified platform bootstrap into package-private storage; AgentBase
owns dependency/lockfile version, identity admission and the local graph
workspace. One short-lived stdio session now serves each explicit evidence
round and closes afterward. The one-shot lifecycle remains explicit rollback.
AgentBase does not duplicate the downloader, invoke native install/update/config
behavior, register another MCP, start a daemon/watcher or discover a global
binary.

Capability `004-graph-refresh-reuse` adds one AgentBase-owned receipt outside
provider cache data. An exact source/engine/namespace match skips only indexing;
changed, missing or forced freshness delegates one index to Codebase Memory.
The receipt commits after evidence and clean shutdown. AgentBase does not own
parsing or incremental graph mechanics, and cache failure requires explicit
`--refresh` rather than hidden retry.

Capability `005-codebase-memory-mcp-surface` adds
`src/app/codebase-memory-mcp` as the agent-facing composition owner. It uses the
official exact server SDK to expose a pinned 12-tool gateway, while the existing
provider module retains executable admission, transport bounds and child
cleanup. One connection lazily binds to one explicit repository and private
cache namespace. Raw MCP results stop at the coding-agent boundary and do not
enter core evidence or OKF.

Capability `006-explicit-observation-command` adds four AgentBase-owned schema
tools beside the 12 exact provider tools. Schema policy remains in
`src/core/knowledge`; the MCP app only presents list/read/select/validate
operations. The catalog is advisory and open-world: it does not alter Codebase
Memory graph semantics or reject unknown Google OKF types.

Capability `007-agentbase-hub-pr-lifecycle` adds provider-neutral Hub identity
and proposal phases under `src/core/hub`, bounded Git/GitHub mechanics under
`src/providers/github-hub`, and explicit new/refresh/inspect/submit/recover
workflows under `src/app/hub-okf`. Hub Markdown authoring consumes normalized
observations through a coding-agent orchestration: MCP prepares an owned
workspace, the agent authors files, and MCP finalizes them. GitHub mechanics
never consume the provider-private code graph and MCP contains no model SDK.
Preparation/finalization perform no remote write. Publication is restricted to
one deterministic non-target branch and one PR, with exact pushed-state
recovery and no merge capability.

Capability `008-local-hub-product-correction` supersedes Capability 007's
temporary-checkout publication lifecycle. AgentBase-MCP owns a persistent
AgentBase-Hub clone whose local `main` is active queryable OKF. Reviewed
proposals become identifiable local commits without network access. Ordered
pending commits may later be published as one safe prefix and one PR; after
collaboration, synchronization rebases remaining proposals in a candidate
worktree before advancing the active ref. Code questions primarily use the
Code Graph, while business/system questions primarily use the local Hub.

The same correction replaces generic producer categories with a concrete OKF
concept catalog. Common provenance and draft rules remain internal; public
schemas represent useful types such as Server, AWS Lambda and AWS SQS Queue.
Catalog schemas are neither MCP argument schemas nor provider graph schemas.

Capability `009-lazy-hub-bootstrap` makes absence of a Hub a valid application
state. `src/app/hub-okf` owns one private global non-secret configuration,
staged existing-Hub attachment, local-only base initialization and checkpointed
first bootstrap. Core Hub state distinguishes stable local base/knowledge
identity from optional remote authority; the GitHub provider adds only bounded
empty-ref discovery. Code Graph composition does not depend on any Hub state.
The user creates the remote repository and explicitly selects either exact
all-history `main` bootstrap or base `main` plus one knowledge PR. These remain
one cohesive Hub lifecycle responsibility rather than separate metric-driven
modules.

Capability `010-client-mcp-registration` completes the root installer with an
explicit user-global `agentbase` stdio registration for Codex, Claude Code or
both. `scripts/install.mjs` retains terminal, dependency and credential flow;
one cohesive `scripts/client-registration.mjs` owner holds the two concrete
client descriptions and their shared preflight/add/verify/rollback lifecycle.
It uses supported client management commands, binds an absolute checkout, does
not place the Hub token in client configuration, rejects same-name conflicts and
recovers selected clients as one transaction. Canonical tests use isolated homes
and fake CLIs; real installed-client mutation remains a separate owner action.

Capability `011-installer-terminal-ui` keeps terminal presentation in the
existing cohesive installer owner. It adds capability-aware inline rendering,
logical arrow/Space key input, bounded picker redraw and a three-action result
hierarchy without a TUI dependency or alternate screen. Cyan is supplemental;
pointer, checkbox and text outcomes preserve meaning in no-color/narrow/plain
fallbacks. Dependency, credential and client transaction authority is unchanged.

Capability `012-agent-okf-benchmark` keeps model execution outside mandatory
runtime and canonical verification. `scripts/benchmark-agent.mjs` owns one
bounded Codex process and source-immutability check; `scripts/benchmark-okf.mjs`
owns deterministic semantic scoring. Both reuse public repository source state
and core OKF/schema entrypoints. The agent receives the normal AgentBase stdio
MCP surface; no model SDK, provider abstraction, raw graph export or shared-Hub
mutation is introduced.

The accepted fixture promotion measured a `4.656x` median improvement with
normalized parity and clean cleanup. That result justifies this lifecycle on
the exercised host; it is not a large-repository throughput or resource claim.

The accepted exact-provider qualification covered initial/reuse/add/modify/
delete/forced rounds with clean cleanup. Reuse eliminated the index stage; the
changed index stages remained close to full fixture cost, so no incremental
latency or repository-scale claim is accepted.

Fresh-process MCP qualification listed 12 safe tools, rejected pre-index reads
and source persistence, indexed and queried a disposable fixture from an
unrelated cwd, preserved source bytes and closed cleanly. Its approximately
`14.68s` total is fixture evidence, not an interactive-latency target.

## Optional enriched investigation

Commands requiring credentials or external provider initialization do not
belong to the mandatory Part 1 path. Terraform or Terragrunt plan data may add
valuable observations, but permission requests, unavailable credentials and
safe execution belong to an explicit enrichment workflow. Failure must degrade
confidence or coverage, not prevent the base local graph from serving coding.
