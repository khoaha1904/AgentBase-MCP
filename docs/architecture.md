# Architecture Contract

This document owns SYSTEM HOW: system shape, capability ownership, dependency
direction, state flow and runtime boundaries. Product outcomes live under
[`docs/product/`](product/README.md), behavior and stable requirements live under
[`docs/capabilities/`](capabilities/README.md), and concrete CODE HOW for an
active change lives in its `specs/<feature>/plan.md` Implementation Contract.

Implementation paths below identify the current ownership baseline. They are
architectural evidence, not a substitute for capability behavior or feature
planning.

## System shape

AgentBase-MCP is a TypeScript Node.js modular monolith. Every runtime file has
one capability owner, every capability exposes a small public `index.ts`, and
cross-capability imports use that entrypoint. Tests stay beside their behavior
owner.

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
and integration adapters over these owners. Their released surface belongs to
the [Version Scope Capability Contract](capabilities/12-version-scope/README.md),
not to this ownership map.

Do not create generic `common`, `utils` or `helpers` areas for possible reuse.
Split only distinct responsibilities with independent reasons to change; file
size, density, line length and import count are not architecture boundaries.

## Ownership and dependency direction

```text
app -> core public entrypoints
app -> provider public entrypoints
provider -> core public entrypoints
core -X-> provider/app
provider -X-> app
```

Core owns provider-neutral policy and values. Providers translate external or
engine-private behavior into those contracts. Application capabilities compose
core and provider entrypoints into user workflows; they do not redefine either
boundary. `src/cli.ts` is the composition root and may dispatch application
entrypoints without becoming their behavior owner.

The source layout is the ownership registry. Dependency Cruiser enforces cycles,
dependency direction and public-entrypoint use; do not create a duplicate
ownership manifest. The stable architecture controls are defined by
[`AB-FND-010..014`](capabilities/12-version-scope/01-foundation-requirements.md#architecture-and-verification).

## State and authority flow

```text
read-only source repository
        ↓
private provider/cache state
        ↓
normalized provenance-bearing evidence
        ↓
local proposal/recovery workspace
        ↓ explicit review and acceptance
shared Git-backed Hub knowledge
```

| State | Scope | Shared | Rebuildable |
|---|---|---:|---:|
| Detailed graph and provider cache | machine/repository | no | yes |
| Freshness receipt | machine/repository/provider | no | yes |
| Observation/evidence bundle | source revision | no in current product | yes |
| Unaccepted proposal workspace | local transaction | no | yes from reviewed input |
| Derived Question/query projection | exact local Hub commit | no | yes from shared documents |
| Accepted Hub state and pending commits | user/team knowledge | yes through Git | governed |

Private state lives outside source checkouts where required, uses bounded exact
paths and never enters normalized evidence. Mutations use atomic state and exact
ownership. Failure preserves the previous admitted state and returns visible
recovery rather than silently changing authority.

Application-local state is partitioned below one owner-private
`AGENTBASE_HOME`/`~/.agentbase` root: `config/` owns configuration and
credentials, `hubs/` owns durable Hub checkouts, `state/` owns recoverable
workflow state, `cache/` owns rebuildable data, and `tmp/` owns disposable
workspaces. Storage behavior and compatibility belong to the
[Knowledge Entry Capability Contract](capabilities/05-knowledge-entry/03-local-draft-storage.md).

## Runtime boundaries

| Boundary | Architecture ownership | Capability Contract |
|---|---|---|
| MCP composition and wire protocol | `app/codebase-memory-mcp` registers business tools; its protocol adapters own version and transport negotiation | [MCP protocol](capabilities/12-version-scope/09-mcp-protocol-requirements.md) and [Code Graph runtime](capabilities/01-repository-reading/05-runtime-requirements.md) |
| Code Intelligence | `core/code-intelligence` owns neutral values; provider adapters own engine lifecycle and translation | [Repository reading](capabilities/01-repository-reading/README.md) |
| Knowledge authoring | `core/knowledge` owns portable documents and policy; `app/repository-okf` composes repository evidence | [Knowledge entry](capabilities/05-knowledge-entry/README.md) and [Ingest/Refresh](capabilities/09-ingest-and-refresh/README.md) |
| Hub governance and publication | `core/hub` owns identity/transitions; `app/hub-okf` owns local workflows; `providers/github-hub` owns transport | [Review and Publish](capabilities/11-review-and-publish/README.md) |
| Provider enrichment | provider adapters own bounded observations; `app/hub-okf/enrichment` owns reconciliation | [Cross-repository relations](capabilities/06-cross-repository-relations/README.md) |
| Query and visualization | `core/knowledge/query` owns accepted reads; application projections remain derived and commit-bound | [Query routing](capabilities/10-query-routing/README.md) and [Visualization](capabilities/13-visualization/README.md) |
| CLI, installation and local storage | `src/cli.ts` dispatches; application owners and installation scripts own their transactions | [Version scope](capabilities/12-version-scope/README.md) |
| Benchmark and AI-SDLC qualification | scripts own isolated measurement; production runtime contains no model execution authority | [Benchmark](capabilities/12-version-scope/03-benchmark-requirements.md) and [AI SDLC context](capabilities/14-ai-sdlc-context/README.md) |

The high-level MCP server factory owns tool registration. Low-level protocol
adapters own wire versions and transport negotiation. Business capabilities do
not import transport internals, and transport adapters do not acquire product
authority. External authorization, provider credentials and network access stay
behind their explicit adapter/workflow boundary; local knowledge work does not
gain ambient network or credential authority.

## Architecture evolution

For a change, start at [`docs/README.md`](README.md), select the active artifact
through [`specs/CURRENT.md`](../specs/CURRENT.md), and inspect only the affected
boundary and Capability Contract. Changes to ownership, dependency direction,
state flow or runtime shape update this Architecture Contract before CODE HOW is
accepted in the active `plan.md`. The mandatory consistency and verification
gates remain in [`AGENTS.md`](../AGENTS.md).
