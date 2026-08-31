# Verification: Refresh preflight topology

## Deterministic gates

- Focused source-ID, structural-reachability and projection tests pass.
- A new Resource with `implemented-in -> Repository` is admitted as a primary
  node in the Repository's Domain projection with the expected structural edge.
- Canonical `npm run verify` passes: 156/156 tests plus specification, upstream,
  provider bundle, Hub validator, type, dependency, Knip, Gitleaks and diff checks.

## Model benchmark status

- Run `2026-08-30T182852Z` exited after 5,026 ms because the Codex account had
  reached its usage limit. It made zero MCP calls, created no proposal and is
  classified as an external setup failure, not a C1 quality result.
- Run `2026-08-30T183454Z` completed in 221,626 ms. It recalled all three
  critical feature facts and created both useful Resource candidates, while
  session validation correctly stopped before Finalize. The agent used
  `declared-by` and Resource-to-Resource `depends-on`, which Resource schema does
  not admit, after generic workflow text presented those predicates as possible
  structural links. This is a bounded instruction defect, not missing Hub/source
  evidence and not a reason to widen Resource schema.
- The revised C1 quality gate remains pending after narrowing the workflow to
  exact schema guidance. No C2, Accept, Publish, operator Hub write or
  source-fixture mutation occurred.
- Run `2026-08-30T184441Z` completed in 197,636 ms and used the correct Resource
  relation. It exposed two preflight implementation defects: changed-set failure
  short-circuited session checks, revealing repairable errors over three calls;
  and source-ID reuse escaped session validation when its source span changed,
  then failed at Finalize. Focused regressions now require combined diagnostics
  and span-independent revision-distinct source IDs.
- Corrected run `2026-08-30T185244Z` completed in 291,706 ms with two Validate
  calls, one successful Finalize and one Inspect. It produced proposal
  `3b21492288720dd239975772`, accounted for all four changed paths, retained all
  three critical feature facts and linked both new Resources to the Repository
  through schema-valid `implemented-in` relations. Input usage was 663,019
  tokens, including 591,616 cached and 71,403 uncached; output was 13,395 tokens.
- The first deterministic score reported three lexical/identity false negatives:
  one valid paraphrase and two valid shorter concept IDs. Benchmark manifest v6
  admits those observed semantic/identity variants without weakening source or
  topology requirements. Re-score passes 5/5 critical and 1/1 important probes
  as `useful_for_ait`; focused benchmark tests pass 8/8.

## Current classification

- Early source revision/source-ID validation: deterministic pass.
- New-concept structural reachability: deterministic pass.
- Published Domain projection inclusion: deterministic pass.
- Real model lifecycle, recall and topology: pass.
- No C2, Accept, Publish, operator Hub write or source-fixture mutation occurred.
- Capability status: complete on the isolated feature branch; ready for owner
  review, not merged.
