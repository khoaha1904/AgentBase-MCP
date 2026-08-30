# Ownership

AgentBase-MCP is a TypeScript Node.js modular monolith. Every runtime file has
one capability owner, every capability exposes a small public `index.ts`, and
tests stay beside their behavior owner.

```text
src/cli.ts                         composition root and `abs` CLI dispatcher
src/core/
  code-intelligence/              neutral map/query contracts
  observations/                   normalized evidence and identity
  knowledge/                      provider-neutral OKF policy
    documents/                    OKF documents and relationships
    governance/                   domain, directive and live-claim policy
    proposals/                    proposal validation and atomic apply
    query/                        accepted-knowledge reads and continuity
    schemas/                      generic catalog, guidance and versioned profiles
  hub/                            Hub identity, ancestry and transitions
src/providers/
  fake-code-intelligence/         deterministic conformance provider
  codebase-memory/                managed graph adapter and lifecycle
  github-hub/                     bounded Git/worktree/GitHub transport
  aws-cli/                        read-only provider observation adapter
src/app/
  local-storage/                  owner-private local storage root
  foundation-demo/                offline product demonstration
  codebase-memory-mcp/            MCP composition and protocol adapters
  repository-okf/                 one-repository evidence workflow
    graph/                        graph rounds and freshness
    evidence/                     source state and normalized evidence
    provider/                     isolated provider workspace
    workflow/                     orchestration and recovery
  hub-okf/                        local Hub lifecycle and publication
    configuration/                settings and credentials
    workspace/                    checkout, setup and bootstrap
    authoring/                    proposals, refresh and Questions
    batch-ingest/                 multi-repository Init coordination
    enrichment/                   provider reconciliation
    review/                       inspection and acceptance
    publication/                  submit, publish and synchronize
    ci/                           offline Hub validation and initialization
    query/                        accepted-Hub reads and projections
    mcp/                          Hub MCP adapters
scripts/
  checks/                         repository verification
  installation/                   setup and migration utilities
  benchmark/                      opt-in measurement and qualification
```

Product skills under `.agents/skills/` and the terminal CLI are presentation
and integration adapters over these owners. Their released behavior belongs to
the [Version Scope Capability Contract](../capabilities/12-version-scope/README.md).

The source layout is the ownership registry. Do not create a duplicate
ownership manifest or speculative `common`, `utils` or `helpers` owner. Split
only responsibilities with independent reasons to change; file size, density,
line length and import count are not architecture boundaries.
