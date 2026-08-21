# Bug Assessment: V15 source and Flow selection variance

- **Slug**: v15-source-flow-variance
- **Created**: 2026-08-21
- **Source**: benchmark probe `aws-health-aware/2026-08-21T154146Z`
- **Verdict**: valid
- **Severity**: medium

## Report

The post-navigation probe completed the lifecycle but supplied no structured
resource observations despite supported Terraform in the fixture. It selected
semantic CloudFormation evidence and promoted an optional Flow between one
System and its only runtime. Provenance fell to 75% and embedded coverage to
25% compared with 100%/100% in the preceding probe.

## Symptom

The current instructions say structured mapping wins but do not require the
investigation to retain supported Terraform evidence when it exists. Flow
guidance says “spanning independently useful concepts” but does not explicitly
exclude a System plus its single contained Function.

## Reproduction

1. Run V15 on the mixed-source `aws-health-aware` fixture.
2. Build only semantic observations from CloudFormation/handler sources.
3. Suggest a Flow for schedule → single Function → embedded destinations.
4. Guidance accepts the request and renders an extra Flow skeleton.

## Suspected Code Paths

- `.agents/skills/agentbase-ingest/SKILL.md` — investigation priority is not
  explicit for mixed-source repositories.
- `benchmark/prompts/okf-author-v15.md` — Terraform-only qualification does not
  require relevant exact resource observations.
- `src/core/knowledge/schemas/definitions/infrastructure.ts` — Flow guidance
  does not spell out the minimum independent-endpoint boundary.
- `src/core/knowledge/schemas/catalog.test.ts` — existing Flow guidance test can
  pin the clarification without a new test case.

## Root Cause Hypothesis

Confidence is high. The model complied with the literal contract: unsupported
IaC was used only as semantic evidence, and System/Function are both concepts.
The missing source priority and weak Flow boundary allow a materially less
useful but valid output.

## Proposed Remediation

**Preferred**: Clarify investigation guidance that supported Terraform or
Terragrunt evidence for retained runtime/infrastructure candidates must be
submitted when available; unsupported IaC may supplement but not replace it.
Clarify released Flow guidance that at least two independently useful endpoint
boundaries are required and a System plus its single contained runtime does not
justify a standalone Flow.

Do not add repository scanning to MCP, a Flow inference engine, another schema,
or a hard rule based on candidate count. These choices still require bounded
semantic judgment.

**Files likely to change**:

- `.agents/skills/agentbase-ingest/SKILL.md`
- `.agents/skills/agentbase-okf/references/navigation-and-boundaries.md`
- `benchmark/prompts/okf-author-v15.md`
- `src/core/knowledge/schemas/definitions/infrastructure.ts`
- `src/core/knowledge/schemas/catalog.test.ts`
- `docs/contracts/okf.md`

**Tests to add or update**:

- Extend the existing catalog guidance test to require the single-runtime Flow
  exclusion and independent-endpoint wording.

## Risks & Considerations

- Guidance reduces model variance but cannot deterministically guarantee source
  discovery; benchmark evidence is still required.
- Some single-runtime systems may have a genuinely independent external Flow;
  the rule excludes only embedded/internal endpoints, not evidenced boundaries.

## Open Questions

- None.
