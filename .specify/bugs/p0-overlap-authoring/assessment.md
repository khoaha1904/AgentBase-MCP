# Bug Assessment: P0 overlapping evidence is easy to mis-author

- **Slug**: p0-overlap-authoring
- **Created**: 2026-08-31
- **Source**: pasted text and failed Initial Ingest of `serverless-data-pipelines-demo`
- **Verdict**: valid
- **Severity**: medium

## Report

An Initial Ingest with Terraform and Python evidence for the same Lambda
runtimes submitted the source-entrypoint P0 group as `ignored`, with a prose
reason and a materialized infrastructure group as its coverage target. MCP
rejected the Inventory with `cannot ignore P0 without a materialized duplicate`.
The user requires a general fix rather than a repository-specific bypass.

## Symptom

The released contract does not explain that multiple discovery groups may
materialize the same candidate IDs when each group contributes evidence to the
same runtime. This makes an agent likely to misuse `duplicate-covered`, whose
exact machine reason is also hidden behind a generic validation error.

## Reproduction

1. Capture a ready Seed containing separate P0 infrastructure-workload and
   runtime-entrypoint groups for the same deployed functions.
2. Create one candidate per function with both Terraform and implementation
   evidence.
3. Materialize the candidates from the infrastructure group and mark the
   runtime group ignored using prose plus `covered_by_origin_group_id`.
4. Call `get_okf_authoring_schemas`; MCP returns `INVALID_ARGUMENT` with
   `cannot ignore P0 without a materialized duplicate`.

## Suspected Code Paths

- `src/core/knowledge/discovery.ts:303` — Inventory validation permits repeated
  candidate IDs across materialized groups but gives no actionable P0 recovery.
- `src/app/codebase-memory-mcp/okf-schema-tools.ts:143` — the public tool schema
  describes materialized candidate IDs without documenting many-to-one group
  coverage.
- `.agents/skills/agentbase-ingest/SKILL.md:52` — authoring guidance describes
  one outcome per group but not overlapping evidence groups.
- `docs/capabilities/03-concept-discovery/01-candidate-discovery.md` and
  `docs/capabilities/05-knowledge-entry/06-runtime-requirements.md` — durable
  contracts omit the valid many-groups-to-one-candidate rule.
- `src/app/codebase-memory-mcp/discovery-session.test.ts` — no regression test
  models Terraform and implementation groups materializing the same candidate.

## Root Cause Hypothesis

Confidence is high. Runtime behavior already accepts many materialized groups
that reference the same candidate and downstream materialization deduplicates
candidate identities. The defect is an ambiguous public authoring contract and
non-actionable error, not an unsupported repository shape. Treating the source
group as ignored also loses the useful fact that it contributed independent
implementation evidence.

## Proposed Remediation

**Preferred**: Make the existing many-to-one rule explicit across the MCP input
schema, ingest skill and durable contracts: when multiple groups contribute
distinct evidence to the same knowledge boundary, each group materializes the
same candidate IDs. Candidate identity is still emitted once. Reserve
`ignored` plus exact `duplicate-covered` for groups that add no distinct
evidence. Make the P0 validation diagnostic state both recovery paths.

Add a regression case where two P0 groups materialize the same candidate and
the receipt retains both group outcomes without creating a second candidate.
Do not add repository names, AWS-specific branches, fuzzy reason acceptance or
a new outcome/schema.

**Files likely to change**:

- `src/core/knowledge/discovery.ts`
- `src/app/codebase-memory-mcp/okf-schema-tools.ts`
- `src/app/codebase-memory-mcp/discovery-session.test.ts`
- `.agents/skills/agentbase-ingest/SKILL.md`
- `docs/capabilities/03-concept-discovery/01-candidate-discovery.md`
- `docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`

**Tests to add or update**:

- Extend the discovery session authoring test with two P0 origin groups that
  materialize one shared candidate and assert both receipt outputs resolve to
  that single candidate ID.
- Assert the invalid P0 diagnostic explains when to materialize shared
  candidates and when to use exact `duplicate-covered`.

## Risks & Considerations

- The rule must not imply that unrelated P0 groups can be hidden behind an
  arbitrary candidate; semantic evidence attribution remains agent-owned and
  reviewable.
- Seed source samples are bounded context, not an exhaustive allowlist, so a
  new hard source-overlap validator would reject valid evidence and is outside
  this fix.
- Existing Receipts and valid `duplicate-covered` requests remain compatible.

## Open Questions

- None.
