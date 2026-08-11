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

## Intended capability map

The exact folders are created only when the active plan selects a runtime. The
target ownership map is:

```text
src/
  core/
    code-intelligence/   # provider-neutral indexing/query contracts
    observations/       # normalized evidence leaving the local graph
    knowledge/          # OKF proposal, review and lifecycle rules
  providers/
    codebase-memory/     # pinned engine adapter; no knowledge policy
  app/                   # composition and user-facing workflows
```

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
| Observation batch | Source revision/evidence round | Yes, when selected | Yes from evidence where possible |
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

An advanced reuse mode may be considered later only when the external engine
reports an exact supported version and passes the same conformance checks.

## Optional enriched investigation

Commands requiring credentials or external provider initialization do not
belong to the mandatory Part 1 path. Terraform or Terragrunt plan data may add
valuable observations, but permission requests, unavailable credentials and
safe execution belong to an explicit enrichment workflow. Failure must degrade
confidence or coverage, not prevent the base local graph from serving coding.
