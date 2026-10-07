# Ownership

> Status: Accepted system ownership baseline. Group 3 evidence ownership is
> owner-approved; G3-C1 freshness and G3-C2 proposal impact are implemented,
> while G3-C3 real-model usefulness qualification is deferred and is not a
> current release gate. Group 4 Domain Capsule/Profile, migration and final
> admission ownership is implemented and verified; Group 4 is closed for the
> current internal enterprise release. G5-C1 compact-layout ownership is
> implemented and verified; G5-C2 semantic-quality
> ownership is deferred and inactive.

AgentBase-MCP is a TypeScript Node.js modular monolith. Every runtime file has
one capability owner, every capability exposes a small public `index.ts`, and
tests stay beside their behavior owner.

## Source-only discovery ownership

`app/agentbase-mcp` owns census signal grouping, safe input admission, Seed/Receipt
lifecycle and MCP composition. `app/repository-source` owns the shared bounded
census file selector, Git source identity, change accounting and deterministic
source-name suggestions. `app/hub-okf` compares suggestions with Published
relationships and retains full private reports for batch/opt-in scan responses.
`core/knowledge/schemas` owns source-format detection and
provider-neutral mappings. The host agent owns exact source investigation.
No graph provider, native artifact, fake provider or benchmark runner owner
remains. Discovery expansion reuses the armed source, never an index.
`scripts/qualification/` owns offline deterministic measurements over local
specs and generated fixtures, using the product search and tool adapters.
It is excluded from runtime/release ownership and cannot sync or mutate an
operator Hub. Model answer evaluation remains external.

SAM and Terraform reuse provider-neutral roles without a generic plugin system,
new cloud execution adapter or new Hub schema. Exact same-source references and
declaration evidence remain distinct from runtime interaction and deployed
state. Existing publication and recovery owners are unchanged.

## Current source layout

```text
src/cli.ts                         composition root and `abs` CLI dispatcher
src/core/
  knowledge/                      provider-neutral OKF policy
    documents/                    OKF documents and relationships
    governance/                   domain, directive and live-claim policy
    proposals/                    proposal validation and atomic apply
    query/                        accepted-knowledge reads and continuity
    schemas/                      generic catalog, guidance and versioned profiles
  hub/                            Hub identity, ancestry and transitions
src/providers/
  github-hub/                     bounded Git/worktree/GitHub transport
  aws-cli/                        read-only provider observation adapter
src/app/
  local-storage/                  owner-private local storage root
  agentbase-mcp/            MCP composition and protocol adapters
  repository-source/              Git identity and change accounting
  hub-okf/                        local Hub lifecycle and publication
    runtime-actions.ts            Hub-wide action composition for CLI/MCP
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
  installation/                   release lifecycle, client/skill setup and migration
  release/                        platform bundle, manifest and SBOM production
```

Product skills under `.agents/skills/` and the terminal CLI are presentation
and integration adapters over these owners. Their released behavior belongs to
the [Version Scope Capability Contract](../capabilities/12-version-scope/README.md).

The source layout is the ownership registry. Do not create a duplicate
ownership manifest or speculative `common`, `utils` or `helpers` owner. Split
only responsibilities with independent reasons to change; file size, density,
line length and import count are not architecture boundaries.

Within Hub authoring, `authoring-session.ts` owns session persistence and the
ordered Prepare/Finalize lifecycle. `authoring-validation.ts` owns source and
structural-reachability checks; `receipt-materialization.ts` owns Receipt-bound
embedded knowledge, materialization checks, inspection context and initial
coverage debt. These internal modules accept narrow data contexts and never
import the session orchestrator. The existing application entrypoints, state
format, validation order and recovery/publication boundaries stay unchanged.
The adjacent lifecycle and Receipt tests exercise the same public session API.

`hub-okf/runtime-actions.ts` composes Hub configuration, authoring, query,
enrichment and publication actions. It belongs at the Hub application root,
not under Query; its public exports remain routed through `hub-okf/index.ts`.
This placement changes no action API, source-snapshot state or admission order.
Capability modules do not import this composition root in production.

Group 2 adds no runtime service. `scripts/installation/` owns the stable
launcher and local release transaction; `scripts/release/` owns maintainer/CI
artifact production; `scripts/checks/` owns derived requirement-evidence and
release verification. Knowledge, Hub and provider owners do not acquire release
or distributed-coordination responsibility.

Group 3 keeps the same modular-monolith owners:

- `core/knowledge/query` owns the provider-neutral freshness value and pure
  aggregation rules; application query supplies exact Published and observed
  inputs, while an already authorized Repository workflow may supply a current
  source receipt;
- `core/knowledge/proposals` owns the pure semantic before/after impact model;
  `app/hub-okf/review` binds it to exact proposal/base bytes and retains it in
  the existing proposal inspection lifecycle;
- query, context, review and visualization adapters render those values without
  acquiring truth, Accept or publication authority; and
- deterministic tests remain with each behavior owner; historical comparison
  data belongs to AgentBase-Benchmark. Production imports no model runner,
  suites or retained results.

No runtime owner acquires a general event ledger, model execution service,
cross-repository graph or generated-site authority.

Group 4 keeps those owners and adds no registry or service:

- `core/knowledge/documents` owns pure Profile 1.0 declaration parsing, Hub
  layout classification, Domain-selector-to-concept mapping and path/home
  validation. OKF concept identity remains its bundle-relative path;
- `core/knowledge/schemas` continues to own type semantics and type-relative
  path hints. It does not choose a physical home;
- `app/hub-okf/authoring` composes one user-confirmed Repository default and
  bounded concept-home exceptions with schema hints. Batch, Questions, Guidance
  and Enrichment remain with their existing application owners;
- `core/knowledge/query` derives home, Domain participation and boundary roles
  from admitted paths and relations. Query, review and visualization adapters
  consume that one projection instead of inventing layout rules; and
- installation/release code declares compatibility only. Hub profile migration
  remains a reviewable knowledge workflow owned by `app/hub-okf`, never an
  application-upgrade side effect.

The well-known `shared/agentbase-profile.md` is Hub knowledge/control state, not
a local sidecar. Generated indexes are navigation, not another identity or home
registry. Capacity runners remain deferred and no Group 4 runtime owner may
claim a qualified scale envelope.

Group 5 reuses the same owners and supersedes only their Profile 1.0 behavior:

- `core/knowledge/documents` owns the compact layout grammar, the Domain
  `index.md` concept identity, type-neutral `knowledge/` admission and the
  rejection of AgentBase activity logs from Profile Hubs;
- `core/knowledge/schemas` owns semantic type and promotion rules but no longer
  supplies type-relative storage paths;
- `app/hub-okf/authoring` owns Repository-dossier skeletons and reuses the
  implemented deterministic coverage and proposal validation before Finalize;
- optional external AI review remains operator practice and acquires no runtime
  owner, product state or admission authority; and
- query, semantic impact, CI and visualization consume the compact Profile
  classifier through the same public core entrypoint.

The deferred semantic-quality design introduces no reviewer packet/report,
draft-probe, repair/override state, model gateway, reviewer database, activity
ledger or new service owner.

Group 6 release hardening retains these owners. `app/hub-okf/authoring` binds
Refresh scope and writes or clears compact coverage debt during deterministic
Finalize, including its bounded convergence count;
`core/knowledge/governance` parses that Repository metadata; and
`app/hub-okf/query` projects it into existing continuity gaps. The packaged
`agentbase-refresh` skill orchestrates broad bounded Coverage with the existing
source/schema/Hub tools. No new runtime package, service, skill or MCP tool owner
is introduced. Surface governance remains with Product and installation release
evidence; it freezes the owned catalog without creating a runtime registry.
