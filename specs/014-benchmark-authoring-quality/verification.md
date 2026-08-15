# Verification: Benchmark Authoring Quality

## v3 heterogeneous model evidence

Both pairs used catalog `3.0.0`, immutable v3 prompts, Codex CLI `0.147.0`,
`gpt-5.6-terra` and medium effort. Both source fixtures remained clean and both
MCP `run.json` artifacts record `validate_okf_relationships: true`.

### Health Aware — `2026-08-15T040000Z`

- MCP: `reviewable`; conformance passed; reference concepts 80%; recognized
  schema agreement 100%; metadata 83%; provenance 86%; relationships 67%; no
  unjudged concepts and no hard failures.
- Missing DynamoDB knowledge remains diagnostic. The Business Flow is now
  confirmed, showing that reviewability does not require the same omissions or
  output shape across runs.
- Direct: `invalid` due to draft/provenance policy failures and two known schema
  contradictions.
- MCP-minus-direct: +11,400 ms, +210,649 input, +3,289 uncached input, -879
  output and -775 reasoning-output tokens.

### Shopping cart — `2026-08-15T041000Z`

- MCP: `reviewable`; conformance passed; reference concepts 100%; recognized
  schema agreement 100%; metadata 100%; provenance 80%; relationships 100%; one
  deletion Lambda is unjudged and there are no hard failures.
- Direct: `invalid` due to draft/provenance policy failures, three known schema
  contradictions and one missing relationship link.
- MCP-minus-direct: +33,661 ms, +466,574 input, +13,966 uncached input, +400
  output and -362 reasoning-output tokens.

### Conclusion

The same general v3 workflow is reviewable on two unlike repositories without
fixture answers. This satisfies the bounded quality checkpoint, not universal
generalization or automatic acceptance. MCP consumed 677,223 more input tokens
and took 45,061 ms longer across the two pairs; context efficiency remains an
explicitly unsolved concern.

Final `npm run verify` passed with 292 tests, 0 failures and 0 architecture
errors. The six architecture warnings are unchanged reviewed baselines.

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

## Completion

SC-001 through SC-006 are satisfied under the owner-amended evidence-first
contract. Capability 014 can close. Question management, AWS enrichment and MCP
payload/token optimization remain separate future work.
