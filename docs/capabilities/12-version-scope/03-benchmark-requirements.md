# Evaluation boundary

The owner retired the application-owned model benchmark runners and all native
provider qualification campaigns during source-only simplification. AgentBase
ships no benchmark CLI, runner, scoring framework or fixture graph engine.
Historical source registries, prompts and results remain in AgentBase-Benchmark
and Git history. They do not establish an active implementation requirement.

Focused offline tests verify discovery, schema/provenance, Ingest/Refresh,
Published query, proposals/publication/recovery and installer/release lifecycle.
Release integrity and requirement-linked product tests remain mandatory through
`npm run verify`. Deterministic fixtures are supplied by tests, without a default
Benchmark checkout or site export destination. Removing a runner does not establish semantic quality, scale
or measured cost savings. Any future model evaluation requires a concrete owner
question and a separately approved bounded campaign, without a runtime service.
