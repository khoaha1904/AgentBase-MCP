# Architecture

## Shape

AgentBase-MCP is a Node.js 24 modular monolith. TypeScript is executed directly
with erasable syntax and statically checked without a generated build tree.

Every runtime file has one capability owner, every capability exposes a small
public `index.ts`, and cross-capability imports use that entrypoint. Core cannot
import providers or application workflows; providers cannot import application
workflows. Tests stay beside their owner. `scripts/module-boundaries.json` is
the executable ownership registry and takes precedence over diagrams.

```text
src/cli.ts                         composition root
src/core/
  code-intelligence/              neutral map/query contracts
  observations/                   normalized evidence and identity
  knowledge/                      OKF policy, schemas and local query
  hub/                            Hub identity, ancestry and transitions
src/providers/
  fake-code-intelligence/         deterministic conformance provider
  codebase-memory/                exact managed graph adapter/lifecycle
  github-hub/                     bounded Git/worktree/GitHub transport
src/app/
  foundation-demo/                offline product demonstration
  codebase-memory-mcp/            filtered stdio MCP composition
  repository-okf/                 evidence, proposal and explicit apply
  hub-okf/                        lazy setup, local lifecycle and publication
```

Do not create generic `common`, `utils` or `helpers` areas for possible reuse.
Split a file only when the results have distinct responsibilities and reasons
to change. Review-size findings are cohesion signals; an intentionally cohesive
hotspot may use one exact owner-approved, non-growing baseline instead of
forwarding wrappers or arbitrary fragments.

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
- The public stdio gateway exposes 11 safe Codebase Memory analysis tools, one
  controlled `index_repository` and five AgentBase schema/validation tools. It omits
  provider mutation tools and binds one connection to one repository.
- YAML parsing stays behind `core/knowledge`, rejects unsafe/oversized input and
  never reserializes protected documents merely for normalization.
- GitHub access is confined to explicit attach, bootstrap, publication and
  synchronization workflows. Local knowledge work requires no network.
- Benchmark model execution is an opt-in external Codex process in an isolated
  result workspace; AgentBase contains no model SDK or credential storage.

## Navigation and change rules

For a change, read `docs/README.md`, `specs/CURRENT.md`, this ownership index,
the single affected domain contract, its public entrypoint and focused tests.
Read a numbered capability only when it is active or directly explains the
behavior being changed.

Keep at most one active capability in `specs/CURRENT.md`. Product or architecture
changes use specification-driven development and update the affected current
contract when accepted. Legacy repositories are read-only evidence and never
runtime/build dependencies.

## Verification

`npm run verify` composes specification checks, TypeScript checking,
architecture boundaries, offline tests and `git diff --check`. Canonical tests
use fakes, captured provider responses, disposable Git repositories and fake
GitHub HTTP. Native-provider qualification, real GitHub actions and model-backed
benchmarks remain explicit opt-in operations.
