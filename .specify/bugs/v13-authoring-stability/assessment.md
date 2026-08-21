# Bug Assessment: V13 authoring stability and benchmark identity

- **Slug**: v13-authoring-stability
- **Created**: 2026-08-21
- **Source**: retained V13 runs `2026-08-21T083416Z`, `2026-08-21T083731Z` and `2026-08-21T084052Z`
- **Verdict**: valid
- **Severity**: high

## Report

The post-contract-fix qualification completed Inspect exactly once in all three
runs, but only one run satisfied the lifecycle gate. Health Aware first sent
paths instead of complete Markdown documents and consumed two repairs before a
third validation passed. Shopping Cart assigned observation evidence to a
different candidate, causing schema guidance and the first prepare call to fail.

The lifecycle-passing output was separately scored invalid because the
benchmark used the checkout observation identity instead of the durable Hub
Repository identity present in the proposal.

## Symptom

### OKF/MCP issue

The public tool schemas do not make two already-enforced boundaries explicit
enough for an authoring model: every candidate may cite only evidence whose
`candidate_id` matches that candidate, and every validation `content` value is
the complete Markdown document rather than its path. The server fails closed,
but the model wastes the bounded repair budget and Initial Ingest becomes
unstable.

### Benchmark-only issue

V13 scoring validates `repository://` provenance against
`run.sourceRepositoryId`, which identifies the checkout observation. Initial
Ingest correctly assigns a separate durable Hub Repository ID, so valid
provenance is reported as belonging to another repository. This affects only
benchmark measurement, not product authoring or Hub correctness.

## Reproduction

1. Run V13 Health Aware and pass concept paths as `changes[].content`; observe
   changed-set validation reject missing frontmatter and consume a repair.
2. Run V13 Shopping Cart with a candidate citing an observation owned by a
   different `candidate_id`; observe guidance/prepare reject cross-candidate
   evidence ownership.
3. Finalize the lifecycle-passing Health Aware output and score its durable
   `repository-aws-health-aware-ef3e83846625` sources against checkout identity
   `repository-aws-health-aware-779eb7e1bc7a`; observe false provenance failure.
4. Re-score read-only with the durable identity; validation passes and the
   authoring assessment becomes `reviewable`.

## Suspected Code Paths

- `src/app/codebase-memory-mcp/okf-schema-tools.ts` — candidate ownership and
  full-Markdown requirements are enforced but under-described in tool schemas.
- `src/app/hub-okf/mcp/mcp-tools.ts` — prepare's guidance request description
  omits the same candidate ownership rule.
- `.agents/skills/agentbase-ingest/SKILL.md` and
  `.agents/skills/agentbase-okf/SKILL.md` — shared workflows can state both
  boundaries without changing immutable benchmark prompts.
- `scripts/benchmark/benchmark-agent.mjs` — run artifacts record only checkout
  `sourceRepositoryId` for later scoring.
- `scripts/benchmark/benchmark-okf.mjs` — final scoring always consumes that
  checkout identity.

## Root Cause Hypothesis

**Confidence: high.** Both OKF failures are direct violations of existing
validators, but their MCP JSON schemas lack sufficient field-level guidance.
The benchmark failure is deterministic identity drift: source observation and
durable Hub identity deliberately use different namespaces, while the scorer
still assumes they are identical.

## Proposed Remediation

**Preferred — OKF/MCP**: Add concise descriptions to the shared concept-content
schema, schema-guidance tool, prepare guidance request and shared authoring
skills. State that `content` is complete Markdown bytes and that a candidate's
`evidence_ids` may reference only observations with the same `candidate_id`.
Do not add retry state, counters, a workflow engine or a new prompt version.

**Preferred — benchmark only**: For V13, derive and record the expected durable
Hub Repository ID from the source identity hints using the existing
`resolveRepositoryIdentity` function against the benchmark's empty isolated
Hub. Score against that recorded identity, with fallback to the historical
checkout field for older artifacts and prompt versions.

**Files likely to change**:

- `src/app/codebase-memory-mcp/okf-schema-tools.ts`
- `src/app/codebase-memory-mcp/okf-schema-tools.test.ts`
- `src/app/hub-okf/mcp/mcp-tools.ts`
- `src/app/hub-okf/mcp/mcp-tools.test.ts`
- `.agents/skills/agentbase-ingest/SKILL.md`
- `.agents/skills/agentbase-okf/SKILL.md`
- `scripts/checks/check-skills.test.mjs`
- `scripts/benchmark/benchmark-agent.mjs`
- `scripts/benchmark/benchmark-agent.test.mjs`
- `scripts/benchmark/benchmark-okf.mjs`
- `scripts/benchmark/benchmark-okf.test.mjs`

**Tests to add or update**:

- Pin candidate-local evidence and full-Markdown wording on both MCP surfaces
  and shared skills.
- Prove V13 records a durable provenance Repository ID distinct from the
  checkout observation identity when appropriate.
- Prove final scoring selects the recorded durable identity while historical
  artifacts retain checkout-ID fallback.

## Risks & Considerations

- Better tool guidance reduces observed model mistakes but cannot guarantee
  every model run stays within one repair; real qualification remains separate.
- Durable identity derivation is valid for V13 because its Hub is deliberately
  new and isolated. It must not retroactively reinterpret older prompt results.
- Retained benchmark artifacts must not be silently rewritten.

## Open Questions

- None.
