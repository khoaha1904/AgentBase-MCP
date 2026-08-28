# Implementation plan: Benchmark storage normalization

**Branch**: `055-benchmark-storage-normalization`
**Spec**: [spec.md](spec.md)

## Sequence

1. Create the sibling `AgentBase-Benchmark` data repository and document its
   ownership, active/history boundary and local checkout registry.
2. Copy benchmark prompts, suite manifests, expectations and results without
   rewriting historical files. Centralize source checkouts by domain; leave
   MCP-owned deterministic fixtures and reference repositories in place.
3. Add one benchmark-root resolver to the existing MCP runner/agent and update
   qualification scripts to consume the sibling root. Keep `npm run demo` and
   ordinary verification unchanged.
4. Add source/manifest preflight and explicit active-suite selection, then
   update active manifest paths to the new registry.
5. Add priority metadata and per-tier/weighted diagnostics to the existing
   scorer, preserving all current validity and owner-review semantics.
6. Make the temporary-state boundary explicit: OS temp/runtime state is
   disposable, Benchmark `results/` is durable, and cleanup is verified on
   success and failure.
7. Run focused migration/scoring checks, `npm run spec:check`, `npm run verify`
   and diff checks. Only remove superseded MCP benchmark data after the copied
   bytes and command paths are verified.

## Trade-offs

- One extra benchmark-root configuration is required for model-backed runs, but
  normal MCP use has no new dependency or latency.
- Local source checkouts are physically centralized but remain independently
  versioned; the registry is the portable authority for their revision.
- Historical missing fixtures remain visible as archived evidence instead of
  being silently fabricated or deleted.
