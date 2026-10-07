# Evaluation boundary

> Release evidence: Required

The owner retired the application-owned model benchmark runners and all native
provider qualification campaigns during source-only simplification. AgentBase
ships no model benchmark CLI, runner, scoring framework or fixture graph engine.
Historical source registries, prompts and results remain in AgentBase-Benchmark
and Git history. They do not establish an active implementation requirement.

Focused offline tests verify discovery, schema/provenance, Ingest/Refresh,
Published query, proposals/publication/recovery and installer/release lifecycle.
Release integrity and requirement-linked product tests remain mandatory through
`npm run verify`. Deterministic fixtures are supplied by tests, without a default
Benchmark checkout or site export destination. Removing a runner does not establish semantic quality, scale
or measured cost savings. Any future model evaluation requires a concrete owner
question and a separately approved bounded campaign, without a runtime service.

## Offline deterministic measurement

The owner approves `node scripts/qualification/measure.mjs <spec.json>
[--output <result.json>] [--baseline]`. This source-only script belongs beside existing
qualification utilities, never under the retired `scripts/benchmark` path.
It needs no model, network or credential and is excluded from release bundles.

The external JSON spec contains `repos` (2..32 `{id, path}` local Git roots),
`links` (`{name, defining_repo, using_repo, kind}`), `questions` (`{id, text,
expected: [{concept_id} | {source: "repo:path"}]}`) and exactly one Hub mode:
`hub: {concept_directory}` or `hub: {agentbase_home}`. Paths resolve relative
to the spec. An optional `hub.domain` scopes the product search; otherwise
the script explicitly searches globally. Output paths are caller-controlled.
Keep private specs/results outside this public repository.

- **AB-MEASURE-001** — Validate bounded inputs and return link recall/precision,
  missing and extra identities using the source-name matcher. `--baseline`
  retains an explicit empty-candidate baseline. Do not derive candidates from the answers.
- **AB-MEASURE-002** — Invoke the same search implementation as `search_hub_okf`,
  with no alternate ranking. Record each expected concept/source rank, top-five
  concept IDs, target hit@1/hit@5 and question hits (all expectations must hit).
  Source matches compare the spec repository's resolved Hub identity and exact
  relative path, ignoring only the evidence line span.
- **AB-MEASURE-003** — Measure UTF-8 JSON bytes and `bytes / 4` estimated tokens
  for actual MCP listTools, each repository Discovery Seed and a generated
  local Preflight/Discover/Schemas/Prepare/Validate/Finalize/Inspect flow.
  The cost fixture authors only a Repository; it does not claim a full semantic
  ingest, corpus tokenization or model answer quality. Never use spec answers
  to generate authoring observations.
- **AB-MEASURE-004** — Read fixture concepts or the already-synced Published Git
  ref only; never sync, fetch, load credentials or author into an operator Hub.
  Authoring measurements use a separate disposable home and Git fixture.
  Output only IDs, relative paths, line/count/size metrics; omit question text,
  source contents, absolute paths and raw exceptions. Generated F1/F2 tests
  check execution and arithmetic, without quality admission thresholds.

F1 exercises standard Terraform/Terragrunt naming, producer/consumer wiring,
Spring properties, Maven coordinates and scoped npm dependencies, with
duplicate, unresolved, external and version-drift cases retained for matcher
qualification. F2 retains the conditional empty-input cause and its two queue
and table branches in concise source-backed concepts. Real-model answer
assessment and optional public corpus downloads are separate operator work,
never part of `npm run verify`.

`node scripts/qualification/fetch-public-corpus.mjs <new-temp-directory>` downloads
the owner-selected public repositories at fixed commits, with sparse Serverless
Patterns checkout and separate disposable Git roots. This network-only utility
is not used by measurement, runtime, release bundles or verify. Its private
`corpus.json` records pins and roots; the operator reads those sources and authors
an independent spec, recording any deliberate temporary name adaptations.
