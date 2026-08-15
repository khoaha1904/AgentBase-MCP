# Bug Assessment: Greedy semantic identity misassigns benchmark concepts

- **Slug**: benchmark-greedy-identity
- **Created**: 2026-08-15
- **Source**: observed real pair `aws-health-aware/2026-08-14T184644Z`
- **Verdict**: valid
- **Severity**: high

## Report

The v2 MCP output authored an `AWS Lambda`, an `Event`, a `Terraform Module` and
a `Database Table`, but the scorer reported only 40% schema precision/recall.
The assignment trace showed the expected Lambda mapped to the schedule Event,
then the actual Lambda mapped to the expected Business Flow.

## Symptom

Greedy identity matching requires every identity term before considering schema
and evidence. A weak textual collision consumes an actual concept before a later
expected concept can receive its correct schema/evidence match. Semantic quality
and relationship coverage are consequently understated.

## Reproduction

1. Score candidates containing an Event whose body says “scheduled invocation”
   and an AWS Lambda supported by the expected Lambda source paths.
2. Expect the Lambda identity terms `scheduled` and `lambda`, followed by an
   expected schedule and a Business Flow whose terms occur in the Lambda body.
3. Observe the Event assigned as Lambda and the Lambda assigned as Business Flow.

## Suspected Code Paths

- `scripts/benchmark-okf.mjs:scoreSemanticBenchmark()` — filters candidates by
  all identity terms, then ranks without schema compatibility.
- `scripts/benchmark-okf.test.mjs` — covers wrong-schema visibility but not a
  stronger schema/evidence candidate competing with a textual collision.

## Root Cause Hypothesis

**Confidence: high.** Candidate admission ignores strong same-schema evidence
unless all terms happen to occur, and ranking gives no preference to the expected
schema. The first greedy assignment therefore consumes the wrong concept.

## Proposed Remediation

**Preferred**: Admit a candidate when either all identity terms match or its
schema matches and at least one required evidence path matches. Rank schema
compatibility above full text identity, then primary identity terms and evidence.
Keep wrong-schema candidates eligible when all identity terms match so schema
errors remain measurable rather than becoming false missing concepts.

**Files likely to change**:

- `scripts/benchmark-okf.mjs`
- `scripts/benchmark-okf.test.mjs`

**Tests to add or update**:

- Reproduce the schedule/Lambda/Business Flow collision and require the Lambda
  and Event to retain their correct semantic assignments.
- Preserve the existing wrong-schema matching regression.

## Risks & Considerations

- Schema preference must not hide an authored wrong schema when it is the only
  textually supported candidate.
- This corrects deterministic scoring only; it does not make the v2 agent output
  satisfy the missing Business Flow expectation.

## Open Questions

- None.
