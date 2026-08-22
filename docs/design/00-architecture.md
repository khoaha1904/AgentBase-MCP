# Architecture

## Shape

AgentBase-MCP is a Node.js 24 modular monolith. TypeScript is executed directly
with erasable syntax and statically checked without a generated build tree.

Every runtime file has one capability owner, every capability exposes a small
public `index.ts`, and cross-capability imports use that entrypoint. Core cannot
import providers or application workflows; providers cannot import application
workflows. Tests stay beside their owner. This document and the source directory
layout are the ownership map; dependency-cruiser enforces cycles, direction and
cross-capability public-entrypoint use without a second ownership registry.

```text
src/cli.ts                         composition root
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
  codebase-memory/                exact managed graph adapter/lifecycle
  github-hub/                     bounded Git/worktree/GitHub transport
src/app/
  foundation-demo/                offline product demonstration
  codebase-memory-mcp/            filtered stdio MCP composition
  repository-okf/                 one-repository evidence workflow
    graph/                        graph rounds and freshness
    evidence/                     source state and normalized evidence
    provider/                     isolated provider workspace
    workflow/                     orchestration and recovery
  hub-okf/                        local Hub lifecycle and publication
    configuration/                settings and credentials
    workspace/                    checkout, setup and bootstrap
    authoring/                    proposals, refresh and Questions
    review/                       inspection and acceptance
    publication/                  submit, publish and synchronize
    query/                        accepted-Hub reads and runtime actions
    mcp/                          MCP adapters
scripts/
  checks/                         repository verification
  installation/                   setup and migration utilities
  benchmark/                      opt-in measurement and qualification
```

Repository-local product skills live under `.agents/skills/<goal>/`; its
`README.md` separates product workflows from development-only Spec Kit skills.
Do not create empty skill scaffolds before the workflow exists.

Do not create generic `common`, `utils` or `helpers` areas for possible reuse.
Split a file only when the results have distinct responsibilities and reasons
to change. Review a cohesive file from behavior and diff evidence; file lines,
bytes, density, line length and import count are not architecture gates.

## Dependency and state boundaries

```text
app -> core public entrypoints
app -> provider public entrypoints
provider -> core public entrypoints
core -X-> provider/app
provider -X-> app
```

| State | Scope | Shared | Rebuildable |
|---|---|---:|---:|
| Detailed graph and provider cache | machine/repository | no | yes |
| Freshness receipt | machine/repository/provider | no | yes |
| Observation/evidence bundle | source revision | no in current product | yes |
| Unaccepted proposal workspace | local transaction | no | yes from reviewed input |
| Governed-question ledger | local Hub authority | no | yes from accepted proposal attachments |
| Accepted Hub `main` and pending commits | user/team knowledge | yes through Git | governed |

Private state lives outside source checkouts where required, uses bounded exact
paths and never enters normalized evidence. Mutations use atomic files, exact
digests and serialized ownership. Failure preserves the previous admitted state
and returns visible recovery rather than hidden retry.

## Runtime boundaries

- Exact production dependencies are `codebase-memory-mcp@0.10.1`,
  `@modelcontextprotocol/client@2.0.0`,
  `@modelcontextprotocol/server@2.0.0` and `yaml@2.9.0`.
- AgentBase resolves only its package-private graph executable and verifies its
  admitted identity. It never searches `PATH`, accepts a user binary or runs the
  provider's installer/updater/configurator.
- One short-lived stdio provider session owns one explicit repository evidence
  round and closes on every path. One-shot invocation is explicit rollback; no
  watcher, UI, daemon or automatic transport retry exists.
- Exact freshness reuse skips only indexing. Queries, source-integrity checks
  and cleanup always run; cache failure asks for explicit `--refresh`.
- The public stdio gateway exposes safe Codebase Memory analysis, one controlled
  `index_repository`, AgentBase schema/validation and local Hub lifecycle/query
  tools. It omits provider mutation tools and binds one connection to one
  repository. Live references compose accepted Hub metadata with existing graph
  search/snippets; they add no parser, cache or graph owner.
- YAML parsing stays behind `core/knowledge`, rejects unsafe/oversized input and
  never reserializes protected documents merely for normalization.
- `core/knowledge` owns the portable `agentbase.live_claims` contract.
  `app/hub-okf` owns proposal-coupled question recovery, the private atomic
  ledger and answer-to-guidance proposals; the MCP gateway supplies only the
  authorized current-repository binding.
- `agentbase-ingest` owns the five-stage host-agent workflow: Preflight,
  Discover, Investigate, Author and Validate. MCP remains deterministic and
  bounded: it resolves Repository/Domain context, classifies exact technology
  evidence, validates standalone-versus-embedded promotion and exposes catalog/
  profile versions. It renders promoted skeletons plus embedded source-backed
  knowledge in one isolated workspace and validates one proposal. Concept
  Schema owns meaning; the shared
  document renderer owns OKF encoding. MCP contains no reasoning engine,
  template language or persistent candidate database.
- Catalog roles are provider-neutral. Terraform-family Detector v1 validates
  source-native Terraform/Terragrunt observations and AWS Profile v2 maps
  supported products to generic roles;
  provider/product/source-tool remain metadata and evidence.
- GitHub access is owned by explicit MCP workflows and MCP-managed credentials;
  a calling agent never substitutes `gh`, personal tokens or ambient Git
  credentials. The current implementation confines access to attach, bootstrap,
  publication and synchronization. A future bounded remote-reference reader
  must use the same authority boundary rather than giving the agent direct
  repository access. Local knowledge work requires no network.
- Benchmark model execution is an opt-in external Codex process in an isolated
  result workspace; AgentBase contains no model SDK or credential storage.

## Navigation and change rules

For a change, read `docs/README.md`, `specs/CURRENT.md`, this ownership index,
the single affected design/requirements route, its public entrypoint and focused tests.
Read a numbered capability only when it is active or directly explains the
behavior being changed.

Keep at most one active capability in `specs/CURRENT.md`. Product or architecture
changes use specification-driven development and update the affected current
contract when accepted. Legacy repositories are read-only evidence and never
runtime/build dependencies.

## Verification

`npm run verify` composes specification checks, TypeScript checking, native
dependency architecture, dead-code/dependency health, redacted secret scanning,
offline tests and `git diff --check`. Canonical tests use fakes, captured
provider responses, disposable Git repositories and fake GitHub HTTP.
Native-provider qualification, real GitHub actions and model-backed benchmarks
remain explicit opt-in operations.
