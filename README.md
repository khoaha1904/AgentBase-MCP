# AgentBase-MCP

AgentBase helps coding agents prepare, review, publish and query shared Google
OKF knowledge in an ordinary Git/Markdown Hub. Published knowledge retains exact
source provenance, known gaps and reviewable history.

Repository discovery is a bounded source census. The host agent investigates
source with its existing read/search tools. AgentBase ships no Codebase Memory,
native graph binary, parser profile or graph proxy. Anyone who wants upstream
graph tools may register them independently in their coding client.

## Install and verify

Prerequisites:

- Node.js `>=24.12 <25`; `.nvmrc` recommends `24.20.0`. Select it with your
  version manager before running the installer, for example `nvm install && nvm use`.
- A configured company HTTPS npm registry. Public npm registry fallback is rejected.
- Gitleaks `8.30.1` on `PATH` to run `npm run verify`; verification does not
  install or silently skip the secret scanner.

No compiler, native graph artifact or separate provider setup is required.

```bash
./install.sh
npm run verify
```

The checkout installer can also be invoked directly with Node, without Bash:

```bash
node scripts/installation/install.mjs
```

This uses the same Node-version, internal-registry and dependency checks.
Direct invocation does not qualify Windows or additional release targets; see
[Platform limits](docs/capabilities/12-version-scope/05-accepted-limitations.md#platform-and-node-compatibility).

Interactive checkout installation selects Codex, Claude Code or both, registers
user-global `agentbase` stdio MCP and installs twelve product skills: ten public
entries and two internal helpers. Ordinary repository work does not activate
AgentBase automatically. Non-interactive setup installs dependencies only.

Released archives use a stable launcher and transactional install, upgrade,
rollback and uninstall. Their production dependency closure, skills, manifest,
SBOM and checksums are verified offline. Linux x64 remains the qualified CI
boundary; source-only removal does not claim Windows or macOS qualification.
Upgrade retires the owned legacy graph skill; rollback preserves the prior
release catalog. Independent external graph MCP registrations are untouched.

## Use knowledge

Select `$agentbase-query` in Codex or `/agentbase-query` in Claude Code. Both are
client syntax for the same skill. `agentbase-context` remains a compatibility
entry to the shared read guidance. Reads use synchronized Published knowledge;
local proposals are private review state.

The small owner-facing CLI is:

```bash
abs status
abs hub connect --url https://github.com/OWNER/HUB.git --branch main
abs hub sync
```

Hub connect obtains one shared enterprise token through a masked prompt outside
Git. Installation never collects it. Profiles are peers; switching does not copy
or merge knowledge. An unconfigured installation can use schema guidance and
workspace Scan; Hub knowledge requires a connected Hub.

## Add and update

Use `$agentbase-ingest` to Add repository and `$agentbase-refresh` to Update
knowledge, or their `/` syntax in Claude Code. Add recognizes an existing
Repository and routes to Update without creating a duplicate.

Initial Ingest Preflight selects an exact source snapshot. `discover_repository`
returns a five-lane Seed from at most 256 safe source files, with explicit bounds
and unsupported-pattern limitations. One confirmed expanded pass can inspect at
most 1,024 files before the Inventory Receipt is frozen. This is heuristic source
discovery, not complete route, symbol or call-path analysis.

Update uses Git changes by default. Explicit Coverage investigates missing
knowledge on the same source, including unchanged repositories. Omission never
implicitly deletes Published knowledge. Provider-dependent gaps require a
separately approved supported Domain Enrichment scope.

Preparation produces one private proposal. Inspect its complete material preview
and confirm Publish separately; repair approval never authorizes publication.

```bash
abs hub policy
abs hub policy --mode direct
abs hub publish --proposal <id> --digest <reviewed-sha256-digest> --mode direct
```

Use the exact ID/digest from inspection. Direct success reports `published` and
`recognized`; PR policy uses `--mode pr`, where `in-review` includes a PR URL but
is not Published. Exact retries recover uncertain publication without duplicates.
AgentBase never merges a PR or creates a GitHub repository.

## Runtime and verification

Start the registered MCP server with:

```bash
node src/cli.ts mcp
```

`npm run verify` checks living contracts, requirement-linked release evidence,
types, dependency boundaries, unused code/dependencies, redacted secret scanning,
focused product tests and diff hygiene. It uses disposable fixtures and performs
no real model, provider or GitHub operation.

Application-owned model benchmark runners, fake graph demo and native-provider
qualification are removed. Historical benchmark data remains in the independent
AgentBase-Benchmark repository and Git history. It is not required to install,
run or verify this app. The internal diagram skill ships its adapted offline
HTML/SVG template and upstream MIT notice; it introduces no browser or model service.

## Documentation

Start at [docs/README.md](docs/README.md) for the smallest affected Product,
Architecture and Capability contract. The renderer-neutral Vietnamese
presentation under [presentation/vi/](presentation/vi/) is communication material,
not product-contract authority.

## License

AgentBase-MCP uses [Apache License 2.0](LICENSE). Retained third-party source under
`vendor/` keeps its upstream license and attribution.
