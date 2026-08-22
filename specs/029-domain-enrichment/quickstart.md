# Quickstart: Validate Domain Enrichment

## Deterministic offline checkpoint

Use a disposable local Hub containing one Domain, three Published Repository
concepts, one SQS relation candidate and one Question per resolution tier. The
fake AWS boundary must return an admitted account, one exact queue ARN, one
identity-only match and one access-denied candidate.

1. Prepare a manifest and establish that no provider call or Hub mutation occurs.
2. Run verification after explicit session confirmation.
3. Inspect sequential calls and establish that each is bound to one candidate,
   account and region; no list/scan call occurs.
4. Submit one recommended answer and defer one direct Question.
5. Finalize and inspect exactly one Enrichment proposal containing:
   - one canonical relation backed by separate identity and interaction evidence;
   - one external identity without an invented relation;
   - one provider limitation and Open Question;
   - automatic evidence without human Guidance;
   - selected human Guidance plus exact Question transition.
6. Establish that accepted Hub bytes are unchanged before Accept.
7. Exercise account mismatch, same-name cross-region collision, unsafe response,
   interrupted retry, stale Question/base and membership revision.

Run the canonical offline gate:

```sh
npm run verify
```

Expected: all 50 tests pass, dependency rules pass, no new production package is
installed and ordinary Ingest/Refresh remains unchanged.

## Mandatory owner checkpoint

Stop here and report results. Do not invoke the user's real AWS CLI or run a
model benchmark until the owner explicitly approves the next checkpoint.

## Optional real AWS smoke

After approval, the owner logs in through their terminal and supplies one exact
account, region and non-sensitive queue candidate. Run only caller identity and
the released exact SQS profile. Inspect a proposal but do not Accept, Publish or
mutate the queue.

Stop on any hard safety/protocol/lifecycle error. If the proposal is valid and
reviewable, report it and ask separately before model-backed qualification.

## Optional model qualification

Run sequentially: one probe; one identical replica only after a valid unblocked
probe; a third only for final acceptance. Compare with the prior result and
separate OKF/MCP findings from harness/scorer findings. Do not rerun Initial
Ingest qualification because Domain Enrichment must not change that flow.
