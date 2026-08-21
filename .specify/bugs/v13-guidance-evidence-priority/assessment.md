# Bug Assessment: Structured evidence loses priority in schema guidance

- **Slug**: v13-guidance-evidence-priority
- **Created**: 2026-08-21
- **Source**: retained V13 qualification runs `090301Z`, `090620Z` and `091059Z`
- **Verdict**: valid
- **Severity**: high

## Report

Exact Terraform/AWS mappings became ambiguous when the same candidate's
free-text semantic observation mentioned another catalog word. A Lambda plus
event prose returned `Function, Event`; a DynamoDB table plus event-state prose
returned `Database Table, Event`. Separately, agents reused a System-named
candidate as a Service or omitted System when the semantic observation did not
state an evidenced capability boundary.

## Symptom

Strong structured provider evidence and weaker semantic wording are treated as
equal schema votes. Exact supported resources are therefore omitted, while
semantic System authoring is sensitive to incidental wording.

## Reproduction

1. Request guidance for an `aws_lambda_function` candidate whose semantic
   observation mentions events.
2. Observe `ambiguous: Function, Event` instead of exact `Function`.
3. Submit a broad application/service observation without an explicit separate
   capability boundary and observe Service selection or no System selection.

## Suspected Code Paths

- `src/core/knowledge/schemas/guidance.ts:getOkfAuthoringGuidance()` — unions
  exact resource-profile mappings and semantic selections without precedence.
- `src/app/codebase-memory-mcp/okf-schema-tools.ts` — the public guidance schema
  does not explain evidence strength or separate System candidates.
- `.agents/skills/agentbase-ingest/SKILL.md` — candidate guidance does not make
  the structured/semantic distinction explicit.

## Root Cause Hypothesis

**Confidence: high.** `schemaTypes` is a set union of structured mappings and
keyword-based semantic selections. The tool consequently converts a strong
mapping plus incidental prose into ambiguity. The agent contract also lacks a
short rule that a System is a separate capability candidate supported by
cooperating-entity evidence, not a renamed Service.

## Proposed Remediation

**Preferred**: When one supported structured mapping exists, use it as the
candidate schema and retain semantic evidence only for evidence diagnostics.
Keep multiple structured mappings ambiguous. For candidates without a supported
structured mapping, preserve existing advisory semantic selection. Clarify the
public tool and Ingest skill so System candidates require a recognizable
capability plus cooperating-entity evidence and remain separate from Service or
Repository candidates.

**Files likely to change**:

- `src/core/knowledge/schemas/guidance.ts`
- `src/core/knowledge/schemas/guidance.test.ts`
- `src/app/codebase-memory-mcp/okf-schema-tools.ts`
- `src/app/codebase-memory-mcp/okf-schema-tools.test.ts`
- `.agents/skills/agentbase-ingest/SKILL.md`
- `docs/contracts/okf.md`
- `specs/022-single-repository-ingest/spec.md`

**Tests to add or update**:

- Exact Lambda and DynamoDB mappings survive event-oriented semantic prose.
- Multiple distinct structured mappings remain ambiguous.
- Public MCP guidance exposes the evidence-priority and separate-System rule.

## Risks & Considerations

- Structured precedence applies only to supported exact profile mappings; it
  must not guess unsupported or unresolved provider input.
- This does not force every repository to contain a System or add a confidence
  engine/status.

## Open Questions

- None.
