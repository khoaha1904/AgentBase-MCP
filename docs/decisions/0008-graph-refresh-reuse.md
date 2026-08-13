# ADR 0008: Reuse an Exactly Accepted Private Graph

- **Status:** Accepted for implementation by Capability 004
- **Date:** 2026-08-12
- **Provider:** exact managed `codebase-memory-mcp@0.10.1`

## Context

The accepted short-lived provider session removes repeated query startup, but
every explicit evidence round still invokes indexing. Exact-provider probes
showed a no-change re-index taking `3470.958ms` after an initial `3494.789ms`
index, while a later session queried the existing private cache in `12.830ms`
without indexing. Changed-source re-index returned the added symbol, although
it did not demonstrate a cheaper incremental latency.

## Decision

AgentBase owns one private atomic freshness receipt per repository/provider
graph namespace. An exact source, engine and namespace match skips only
`index_repository`; all evidence queries, source-integrity checks and process
cleanup still run. Missing, malformed, changed or explicitly forced freshness
delegates exactly one index operation to Codebase Memory.

The receipt advances only after complete normalized evidence, unchanged source
through provider cleanup and confirmed clean shutdown. If reuse-selected cache
queries fail, the command fails visibly and recommends explicit `--refresh`.
It does not retry automatically.

## Ownership boundary

Codebase Memory owns parsing, graph storage and internal full/incremental index
mechanics. AgentBase owns only the decision that a previously accepted private
graph still matches its source/provider namespace. Receipt metadata stays
outside both the source checkout and provider-owned cache files.

## Consequences

- Known unchanged rounds avoid the measured redundant index stage.
- A small versioned local receipt becomes disposable AgentBase state.
- Source or provider identity changes always refresh before queries.
- Provider cache loss/corruption requires one explicit `--refresh` retry.
- No watcher, daemon, polling, graph-delta parser, lock service, cache
  generation, repair/status command or provider configuration is introduced.

If exact qualification cannot preserve correctness and clean lifecycle within
this boundary, Capability 004 stops rather than adding recovery machinery.
