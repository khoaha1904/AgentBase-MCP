# AgentBase Next Session Handoff

- **Prepared:** 2026-08-11
- **Repository:** `agentbase-next`
- **Product name:** AgentBase (temporary repository suffix only)
- **Active capability:** `001-clean-foundation`
- **Current state:** context and architecture bootstrap; no runtime code yet
- **Next checkpoint:** approve the foundation plan, choose the runtime through
  evidence, then implement the smallest vertical slice

## Session checkpoint

The owner chose a clean repository because the previous implementation grew
from several changing product ideas and now carries too much accidental
complexity. Do not restart by porting it.

The accepted direction is:

```text
repository source
  -> local detailed Code Intelligence graph
  -> selected, provenance-bearing observations
  -> AI-assisted investigation and human review
  -> cumulative OKF knowledge
```

The first graph is machine-local, detailed, cheap and disposable. Different
machines do not need identical graphs. OKF is the durable shared layer and is
built from higher-level observations, not by publishing the raw graph.

Repeated OKF ingests are cumulative evidence rounds. If one machine observes
`1, 2, 3` and another observes `2, 3, 4`, repeated support strengthens `2` and
`3`; `1` and `4` remain weaker or reviewable. Absence in a later ingest is not
proof of deletion. Existing knowledge must be detached, marked stale or queued
for review only through explicit scoped rules.

## Start here

Read these files fully:

1. `AGENTS.md`
2. `docs/product/vision.md`
3. `docs/ARCHITECTURE.md`
4. `docs/roadmap.md`
5. `specs/CURRENT.md`
6. `specs/001-clean-foundation/spec.md`
7. `specs/001-clean-foundation/plan.md`
8. `specs/001-clean-foundation/tasks.md`

Read reference documents only when the current decision needs them.

## Decisions already made

- Build in a new, independent Git repository.
- Keep the old repositories unchanged as historical evidence.
- Follow the agent-friendly architectural principles distilled from AgentDocks.
- Treat Code Intelligence as a provider capability behind an AgentBase-owned
  contract.
- Evaluate Codebase Memory MCP as the leading first engine, pinned to an exact
  tested version rather than tracking every upstream release.
- Allow an independently installed user version to coexist; AgentBase must not
  silently use or replace it.
- Keep AgentBase ownership above the engine: observation selection,
  provenance, confidence, review, re-ingest and OKF lifecycle.

## Decisions intentionally still open

- Runtime language and build toolchain.
- Exact Code Intelligence engine version and distribution method.
- The first conformance fixture and measurable acceptance thresholds.
- The observation schema and OKF storage format.
- Which legacy behavior, if any, is worth reimplementing after the first slice.

Do not turn these into hidden implementation assumptions. Resolve them in the
active specification using evidence and owner-visible outcomes.

## Repository boundaries

The sibling repositories `../agentbase-mcp`, `../agentbase-docs` and
`../agentbase-hub` contain the previous implementation and valuable tests, but
also large uncommitted working trees. They are read-only references for this
rebuild unless the owner explicitly changes scope.

The separate `/home/khoa/workspace/AgentDocks` repository inspired the
architecture. Its relevant patterns are recorded locally in
`docs/references/agentdocks-architecture.md`, so normal sessions do not need to
access a project outside this workspace.

## Next action

Continue `001-clean-foundation`. Confirm the product-facing acceptance criteria,
choose a minimal runtime/toolchain, then add automated architecture checks and
one provider-neutral contract with a deterministic fake. Do not integrate or
download Codebase Memory in that first implementation step.
