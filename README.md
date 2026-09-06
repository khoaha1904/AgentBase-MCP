# AgentBase-MCP

AgentBase-MCP gives coding agents two complementary knowledge surfaces:

- a private repository Code Graph for source structure, symbols and call paths;
- an optional local AgentBase-Hub for reviewed Google OKF business, system and
  cross-repository knowledge.

The graph is disposable and never published. Hub knowledge is ordinary linked
Markdown and Git history. Preparation is private resumable work; ordinary Hub
query reads only the synchronized Published commit.

Publication uses one inspected proposal and explicit confirmation, with Direct
or PR policy per Hub:

```text
abs hub policy
abs hub policy --mode direct
abs hub publish --proposal <id> --digest <reviewed-sha256-digest> --mode direct
```

Use the exact ID/digest from proposal inspection. Publish confirms sharing
those bytes; it never performs ingest automatically. Repeating the same command
recovers an uncertain publication without creating a duplicate. Inspect its
`remote` and `local` outcome: direct success is `published` plus `recognized`.
For per-Hub `pr` policy, pass `--mode pr`; `in-review` exits zero and includes
the PR URL, but does not mean Published. MCP exposes the same workflow through
`publish_hub_okf_proposal`; Accept/pending/submit tools are removed. Skills
require explicit Publish confirmation after the prepared result is inspected.
Selecting policy alone does not publish, remove drafts or change remote settings.

## Install and verify

Requires an approved Node.js `>=24.12 <25` and the configured company npm
registry. The repository already carries the reviewed Code Graph bundle for
each released platform; ordinary users do not install Make, a compiler, zlib
development headers or run a separate provider command.

```bash
./install.sh
npm run demo
npm run verify
```

Those commands remain the developer-checkout setup path. The `0.1.0`
`linux-x64` release archive now carries its own application installer and stable
launcher lifecycle. A distributable archive is admitted only when the exact
`v0.1.0` tag passes the required GitHub Actions gate; CI retains only the
qualified archive and adjacent checksum. Its installer explicitly selects
Codex, Claude Code or both; MCP registration then remains on the stable launcher
while the thirteen released skills upgrade and roll back with the application.

Interactive installation can register the current checkout as user-global
`agentbase` stdio MCP in Codex, Claude Code or both and installs the thirteen
AgentBase product skills for every selected client. An exact rerun is a no-op; a conflicting
same-name MCP entry or skill fails before replacement. Hub token input is not
part of installation; the current baseline accepts one shared token later
through the masked `abs hub connect` prompt outside Git. The accepted Group 1
contract treats that shared token as the built-in trusted-enterprise credential
provider so Hub profiles reuse it without entering the token again. Non-interactive installation prepares
dependencies and activates the bundled native Code Graph provider but performs
no skill or client mutation. npm dependencies use only the configured HTTPS registry;
public registry fallback is rejected.

The released catalog has ten explicit-only public entry names—Use, Context compatibility, Scan,
Add repository, Update knowledge, Batch Ingest, Domain Enrichment, focused Diagram, explicit
Domain Site and Hub lifecycle—plus three internal supporting skills. Ask
AgentBase by selecting the skill in the client, invoking `$agentbase-query` in
Codex, or invoking `/agentbase-query` in Claude Code. These
are client syntaxes for the same canonical skill; AgentBase installs no
`abs-*` alias. Ordinary repository work never activates AgentBase merely because
the catalog is installed. Use the same Query entry beside a primary workflow
to contribute evidence without taking over its deliverable. Existing
`agentbase-context` invocations remain a compatibility entry to that shared
guidance; new requests need not choose Query versus Context.

For authoring, use `$agentbase-ingest` to **Add repository** or
`$agentbase-refresh` to **Update knowledge** (use `/` in Claude Code).
The installed command names are unchanged. Add recognizes an existing repository
and routes to Update without creating another identity. Update follows source
changes by default; ask to investigate missing knowledge for a bounded Coverage
pass, even when source has not changed. Neither automatically updates other
repositories, reads cloud providers or publishes. Provider-dependent relation
gaps require a separately approved, supported Domain Enrichment scope.

If a concrete knowledge gap is found, AgentBase may offer a scoped repair.
Your agreement starts preparation through the existing authoring workflow;
it does not publish. Review the resulting proposal and confirm Publish separately.

## Main entrypoints

Start the MCP server:

```bash
node src/cli.ts mcp
```

Collect a bounded observation without creating OKF:

```bash
node src/cli.ts observe /absolute/repository symbolName
```

Run exact owned Codebase Memory integration or explicit refresh:

```bash
npm run integration:codebase-memory -- /absolute/repository symbolName
npm run integration:codebase-memory -- /absolute/repository symbolName --refresh
```

The owner-facing terminal surface is intentionally small:

```bash
abs status
abs hub connect --url https://github.com/OWNER/HUB.git --branch main
abs hub sync
```

Detailed proposal, acceptance, query, publication and recovery lifecycle is
invoked by the installed skills/MCP or by developer-only compatibility routes;
it is not dumped into `abs --help`. AgentBase-MCP never merges a PR or creates
a GitHub repository. A Hub is not required for installation or Code Graph use.

Run an explicit model-backed OKF benchmark and finalize it deterministically:

```bash
AGENTBASE_BENCHMARK_ROOT=../AgentBase-Benchmark \
  npm run benchmark:okf -- run crawler-initial-ingest serverless-data-pipelines-demo
AGENTBASE_BENCHMARK_ROOT=../AgentBase-Benchmark \
  npm run benchmark:okf -- finalize crawler-initial-ingest <UTC-run-id> serverless-data-pipelines-demo
```

Benchmark source repositories, prompts, expectations and durable results live
in the sibling `AgentBase-Benchmark` repository. The runner and scorer remain
here; `npm run demo` and `npm run verify` do not require a benchmark checkout.

Real provider, GitHub and model operations remain opt-in. `npm run verify` is
offline and uses fakes, captured responses, disposable Git and fake GitHub HTTP.
Pinned Graph UI and diagram-design source are retained for later capabilities
but are not installed, started or exposed by this release.

## Documentation

Start at [`docs/README.md`](docs/README.md). It routes agents to the smallest
affected product decision or technical design instead of requiring the full
documentation set. Current authority is separated into `docs/product/`,
`docs/architecture/` and `docs/capabilities/`. Tests and repository checks
verify that implementation remains aligned with those living contracts.

The renderer-neutral Vietnamese presentation source lives under
[`presentation/vi/`](presentation/vi/). It travels with the product repository
without adding a PowerPoint, browser or presentation-library dependency.

## License

AgentBase-MCP is licensed under the [Apache License 2.0](LICENSE). Components
under `vendor/` retain their respective upstream licenses and attribution files.
