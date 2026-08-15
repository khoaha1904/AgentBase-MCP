# Verification: Benchmark Authoring Quality

## v3 relationship-validator phase

- Date: 2026-08-15
- Focused: `node --test --experimental-strip-types scripts/benchmark-agent.test.mjs scripts/benchmark-okf.test.mjs src/core/knowledge/okf-relationships.test.ts src/app/codebase-memory-mcp/okf-schema-tools.test.ts src/app/codebase-memory-mcp/server.test.ts`
- Result: 32 tests passed, 0 failed.
- Canonical: `npm run verify`
- Result: specification checks and typecheck passed; architecture reported 0
  errors and 6 unchanged warnings; 292 tests passed, 0 failed; diff check passed.
- The new MCP tool accepts only bounded `{ identity, path, content }` values and
  exposes no output-directory or arbitrary filesystem-read argument.
- Core and MCP tests cover valid relationships, duplicate identity, missing
  target, missing Markdown link, known-schema mismatch and portable unknown
  schemas. The benchmark scorer now uses the same core validator.
- v3 MCP lifecycle requires an observed `validate_okf_relationships` call;
  v1/v2 identities remain historical and direct v3 receives no MCP capability.

## Offline gate

- Date: 2026-08-15
- Focused: `node --test --experimental-strip-types scripts/benchmark-agent.test.mjs scripts/benchmark-okf.test.mjs`
- Result: 26 tests passed, 0 failed.
- Canonical: `npm run verify`
- Result: specification checks and typecheck passed; architecture reported 0
  errors and 6 unchanged warnings; 289 tests passed, 0 failed; diff check passed.

## Requirement evidence

- AB-BENCH-018/019/022/024: shared v2 prompt contract, leakage and immutable v1
  presence are covered in `scripts/benchmark-agent.test.mjs`.
- AB-BENCH-021/023: empty output, conformance, known schema contradiction and
  target/link/schema relationship failures are invalid; sparse coverage remains
  reviewable.
- AB-BENCH-025/026/027/029: fake paired lifecycle retains both prompt identities,
  classifies unmatched output as unjudged, separates assessment from efficiency
  and reports the need for human review.

## Real pair

- Pair: `aws-health-aware/2026-08-14T184644Z`
- Lifecycle: complete; both arms succeeded; fixture remained clean.
- MCP: conformance passed; reference concepts 80%; recognized schema agreement
  100%; metadata 75%; provenance 71%; reference relationships 83%. Four
  concepts are confirmed, one authored Repository is unjudged and the Business
  Flow is missing reference coverage.
- MCP assessment: `invalid` because the Lambda frontmatter declares
  `declared-by -> aha-deployment-terraform-module` without a resolving Markdown
  link in that concept.
- Direct assessment: `invalid` due to conformance failures and two recognized
  schema contradictions. Seven unmatched concepts and eight relationships are
  unjudged rather than false positives.
- MCP efficiency delta: +74,856 ms, +440,523 input tokens, +22,731 uncached
  input tokens, +1,812 output tokens and +55 reasoning-output tokens.
- Conclusion: low completeness is not the failure. The retained MCP bundle has
  one deterministic relationship-integrity fault despite the v2 final-review
  instruction. This is a general bundle-consistency gap, not a Health Aware
  answer to add to the prompt. It provides no context-token saving evidence.

## Scorer correction

The first comparison incorrectly mapped the schedule Event to expected Lambda
and the Lambda to expected Business Flow, reporting schema 40/40 and
relationships 50. Bug `benchmark-greedy-identity` was reproduced and fixed.
The retained comparison was deterministically regenerated from unchanged arm
artifacts and now reports schema 80/80 and relationships 100. Focused combined
benchmark verification passed with 23 tests.

## Remaining decision

The scorer correction is implemented, but SC-004 is not met because the retained
v2 MCP artifact is invalid. Do not run shopping cart yet. The next proposed
general fix is deterministic bundle-level validation exposed to the authoring
workflow, followed by a new immutable prompt identity that requires that check.
Proving that change would require new model-backed pairs on both repositories;
it must not contain Health Aware or shopping-cart answers.
