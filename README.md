# AgentBase-MCP

AgentBase-MCP is the local application coding agents use for two complementary
knowledge surfaces:

1. a repository-local Code Graph for source structure, symbols and call paths;
2. an optional local AgentBase-Hub working tree for reviewed Google OKF business, system and
   cross-repository knowledge.

AgentBase-MCP owns graph access, evidence investigation, concrete OKF authoring
schemas, local Hub lifecycle, query, publication and synchronization.
AgentBase-Hub stores only OKF Markdown and ordinary Git history. This canonical
`AgentBase-MCP` checkout is the application source; its directory name never
becomes a generated OKF subject.

## Start a session

From this checkout, let the agent follow `AGENTS.md`:

```bash
npm install
npm run verify
```

The recovery entrypoint is `docs/handoff.md`.

Current accepted behavior lives under `docs/specs/`. Numbered directories under
`specs/` record one change and become historical after that capability closes;
`specs/CURRENT.md` identifies the active work.

## Install and verify

Prerequisite: Node.js `>=24.12 <25`.

```bash
./install.sh
npm run demo
npm run verify
```

The installer prepares exact dependencies, then in an interactive terminal lets
you select Codex, Claude Code or both. It registers one user-global `agentbase`
stdio MCP in exactly the selected clients, bound to this checkout by absolute
Node and `src/cli.ts mcp` paths. An exact rerun is a no-op. A same-name entry
with different transport, command or arguments stops before mutation; remove or
rename that entry deliberately, then retry.

Selecting both clients is transactional. If either add or verification fails,
entries newly added by that run are removed from every selected client. An
interrupted run recovers before a later registration; unresolved concurrent
changes are preserved and reported through private recovery state. Moving this
checkout requires deliberate removal and registration from the new path.

Optional Hub-token input shows one `*` per accepted character so pasted input
is visible without printing the token. Empty Enter keeps tokenless local operation.
When supplied, the token is stored outside Git at
`$XDG_CONFIG_HOME/agentbase-mcp/env`, falling back to
`~/.config/agentbase-mcp/env`, with private permissions. A prior credential is
preserved; replace it only through:

```bash
./install.sh --replace-token
```

A non-interactive run prepares dependencies without prompting, selecting a
client or persisting an ambient token. AgentBase-MCP prefers an explicit process
token and otherwise reads the admitted global file. Never put the token in this
repository, chat, command arguments or client configuration.

The demo prints a normalized map for the checked-in 12-file TypeScript fixture,
then the accepted relevant neighborhood and its quality evidence. It uses only
explicit fake data: it does not parse the fixture, access credentials or start
Codebase Memory.

`npm run verify` is the canonical offline gate. Installer coverage uses isolated
homes and deterministic Codex/Claude doubles, so it never changes installed
client configuration. The broader gate replays sanitized provider fixtures and
does not execute the native graph binary, use a model, read credentials or
access the network.

## Observe code explicitly

Code graph construction and query semantics follow the exact managed Codebase
Memory provider. To collect bounded provenance-bearing observations for later
inspection, run a separate explicit action:

```bash
node src/cli.ts observe /absolute/path/to/repository symbolName
```

This prints a normalized evidence bundle. It does not create an AgentBase graph
schema and does not prepare, modify or apply OKF. Every OKF action remains under
the separate `node src/cli.ts okf ...` command family.

## Real bounded evidence

AgentBase owns exact dependency `codebase-memory-mcp@0.10.1`; users do not
install or provide a binary path. On the currently exercised Linux x64 walking
skeleton, run the opt-in integration explicitly:

```bash
npm run integration:codebase-memory -- \
  /absolute/path/to/typescript-repository inspectWorkspace
```

The command uses the package-private binary with a private cache outside the
checkout, returns a local evidence bundle, then exits without a standing
provider process. The first or source-changed round asks Codebase Memory to
index. An unchanged accepted source/provider namespace reuses its private graph
and skips indexing while still running all queries and safety checks. The
default remains one short-lived MCP session for the complete evidence round; it
is not a daemon, watcher or registered MCP.

Force exactly one provider refresh when qualifying freshness or recovering
from a visible reusable-cache failure:

```bash
npm run integration:codebase-memory -- \
  /absolute/path/to/typescript-repository inspectWorkspace --refresh
```

Diagnostics report `reused / exact-match` or `refreshed` with its bounded
reason. Freshness metadata is private disposable state and does not enter the
normalized evidence digest.

The accepted three-pair fixture benchmark measured a `67073.047ms` one-shot
median and `14405.099ms` scoped-session median (`4.656x`) with fact/source
parity and clean cleanup. This is host/fixture evidence, not a universal
latency promise. Run the same opt-in benchmark with:

```bash
npm run benchmark:codebase-memory
```

Select the retained diagnostic rollback explicitly when needed:

```bash
npm run integration:codebase-memory -- \
  /absolute/path/to/typescript-repository inspectWorkspace \
  --transport one-shot
```

## Use the graph through MCP

Configure a local MCP client to launch AgentBase itself; the client's current
directory does not select the repository:

```json
{
  "command": "node",
  "args": ["/absolute/path/to/AgentBase-MCP/src/cli.ts", "mcp"]
}
```

On each new connection, call `index_repository` with one absolute repository
root and optionally a clear project `name`. The connection is then bound to
that repository; reconnect before selecting another. AgentBase exposes 12
upstream-compatible tools, forces `persistence:false` and omits provider
mutation tools.

The same MCP also exposes four AgentBase-owned OKF schema tools:
`list_okf_schemas`, `get_okf_schema`, `select_okf_schemas` and
`validate_okf_concept`. They provide a versioned producer vocabulary layered on
Google OKF v0.2. Selection is advisory and evidence-directed; unknown OKF types
remain valid, and unused schema directories are never scaffolded automatically.

Use the repository-local `use-codebase-memory` skill for architecture/search,
call tracing, exact snippets, coverage and explicit refresh. AgentBase neither
runs Codebase Memory's global installer nor starts a watcher/daemon. Raw graph
results remain private working context and are not OKF.

## AgentBase-Hub actions

Creating or refreshing OKF is a user-triggered action. The corrected lifecycle
is `configure when first needed` -> `prepare` -> author/review -> `accept` into
local Hub `main` -> query locally. Installation does not choose, clone or create
a Hub, and Code Graph remains fully usable while Hub status is `unconfigured`.

On the first Hub-dependent OKF action, explicitly attach an existing GitHub Hub
or create a new local-only Hub. The latter creates only a private local Git base
with explanatory `README.md` and root `index.md`; it has no remote. Accepted
proposal commits may accumulate and remain queryable across repositories.

When publishing a new local Hub for the first time, create an empty GitHub
repository yourself and supply its exact HTTPS URL. Preview and then choose:

- `all-to-main`: put base and all current knowledge on initial remote `main`;
- `base-to-main-knowledge-pr` (recommended): put only base on initial `main`
  and all accumulated knowledge on one branch/PR.

The choice is never automatic. AgentBase-MCP never creates the GitHub repository.
After bootstrap, later submit/synchronization follows the normal PR lifecycle.

Use a fine-grained token restricted to the exact Hub with Metadata read,
Contents read/write and Pull requests read/write. Do not put the token in chat,
CLI arguments, Git URLs or repository files. The Hub tools do not expose merge,
force, target override, settings or branch deletion controls.

The MCP uses one owner-private global configuration at
`$XDG_CONFIG_HOME/agentbase-mcp/hub.json` (or `~/.config/...`) and the single
global token installed separately. Preparing, accepting and querying local
knowledge do not need GitHub access. Attach/bootstrap failures preserve local
work and explain which token access must be updated. AgentBase-MCP does not add
a second model or copy raw graph records into OKF.

The equivalent explicit CLI family is:

```bash
node src/cli.ts okf hub status
node src/cli.ts okf hub configure --mode new
node src/cli.ts okf hub configure --mode existing \
  --url https://github.com/<owner>/<hub>
node src/cli.ts okf hub prepare --mode new --repo /absolute/source \
  --subject repositories/<slug> --signals repository,service \
  --evidence sha256:<digest>
node src/cli.ts okf hub finalize --session <id>
node src/cli.ts okf hub inspect --proposal <id>
node src/cli.ts okf hub accept --proposal <id> --digest sha256:<reviewed-diff-digest>
node src/cli.ts okf hub pending
node src/cli.ts okf hub bootstrap-preview \
  --url https://github.com/<owner>/<empty-hub> \
  --mode base-to-main-knowledge-pr
node src/cli.ts okf hub bootstrap \
  --url https://github.com/<owner>/<empty-hub> \
  --mode base-to-main-knowledge-pr
node src/cli.ts okf hub submit --proposals <id-1>,<id-2>
node src/cli.ts okf hub synchronize
node src/cli.ts okf hub recover --transaction <id>
```

These corrected actions are implemented and covered by offline real-Git/fake-
GitHub journeys under Capabilities 008 and 009. The living contract under
`docs/specs/agentbase-hub.md` is authoritative. No command merges a PR or writes
remote `main` except the explicit first bootstrap into an empty repository. Real GitHub
qualification remains separately authorized; canonical verification uses fake
HTTP and disposable local Git state.

## Canonical repository migration

Preflight is read-only and reports both existing sources plus the canonical
destinations:

```bash
node scripts/migrate-product-repositories.mjs report
```

After this source is committed, clean and separately approved, create an
independent canonical application clone with the exact reviewed commit:

```bash
node scripts/migrate-product-repositories.mjs create-mcp \
  --expected-head <40-hex-reviewed-commit>
```

After the official Hub remote is separately admitted, create its canonical
fresh clone:

```bash
node scripts/migrate-product-repositories.mjs create-hub \
  --hub-repository <owner>/AgentBase-Hub
```

These commands do not rename GitHub repositories, rewrite remotes, repoint an
installed MCP or delete old directories. Rollback before launcher cutover is
simply the original source path; after cutover, record and restore the exact
previous launcher command and arguments.

## Propose and apply OKF

Prepare from an evidence bundle or digest:

```bash
node src/cli.ts okf prepare --repo /absolute/path/to/repository \
  --evidence /absolute/path/to/evidence.json
```

The command returns an ignored proposal `bundle/`. Use the repository-local
`agentbase-okf` skill to author linked concepts only in that directory, then:

```bash
node src/cli.ts okf validate --repo /absolute/path/to/repository --proposal <id>
node src/cli.ts okf diff --repo /absolute/path/to/repository --proposal <id>
node src/cli.ts okf apply --repo /absolute/path/to/repository --proposal <id>
```

Apply is always separate and explicit. If an interrupted switch leaves a
manifest, recover it before new state-changing work:

```bash
node src/cli.ts okf recover --repo /absolute/path/to/repository
```

See `specs/002-single-repo-okf-walking-skeleton/quickstart.md` for the complete
workflow and limitations.
