# Capability 046 verification

## Offline gate — 2026-08-25

Status: **passed**.

- `npm run verify`: passed.
- Specification, generated Hub validator, TypeScript, dependency-cruiser,
  gitleaks and diff gates: passed.
- Full test suite: 67 passed, 0 failed.
- Focused evidence covers exact source authority/TOCTOU, deterministic Seed,
  malformed and P0-hiding provider output, secret exclusion, bounded group
  overflow, Receipt recovery, Questions/provenance/activity, Batch isolation
  and source-to-Seed-to-Receipt benchmark tracing.
- New Initial Ingest and every Batch member are Receipt-only in production and
  tests; the legacy test bypass is removed. Receipt-owned candidate-evidence
  Questions can be reopened on another machine and answered by a maintainer.
- Public MCP surface remains 44 tools; no new concept role, provider or
  production dependency was added.
- Pinned upstream source verification passed for Codebase Memory and
  diagram-design. Generated Hub CI validator is current.

The consistency audit found one stale test claim: malformed/P0-hiding and
overflow behavior was named in T008 but not directly exercised. The existing
provider-to-Seed suite now covers those boundaries; no architecture change was
required.

## Native provider gate

Status: **passed** through Capability 047.

The approved overlay was rebuilt into the reviewed repository-contained
`linux-x64` bundle. Runtime admission, bundle integrity and the complete 72-test
offline gate pass. No system package was installed; temporary build-only zlib
headers were removed after packaging. The qualification below used the rebuilt
artifact, not the pre-overlay binary.

## Released-skill Sol qualification

Status: **probe failed before OKF authoring; replica correctly skipped**.

Probe `2026-08-25T132725Z` ran the exact `initial-ingest-discovery-v1` released
skill with `gpt-5.6-sol` and the rebuilt provider. It stopped after 282,029 ms:
619,593 input tokens (551,168 cached), 11,268 output tokens and 2,651 reasoning
tokens. It did not Accept, Publish, call a provider CLI or mutate the fixture.

The Discovery Seed was `ready` and exposed all four P0 groups. The agent planned
a Repository, System, four Functions, one Glue Component, one cross-workload
Flow, embedded infrastructure and a useful Python-runtime conflict Question.
No OKF proposal exists, so semantic quality is not scored and there is no prior
accepted run in this suite to compare.

The blocking MCP contract requires the model to construct exact
`repository://` strings for Question candidate evidence even though the Receipt
already owns repository identity, revision and observation spans. The agent
encoded path separators as `%2F`; MCP expected segment-preserving `/`, rejected
the corrected guidance request and exhausted the one-correction budget. This is
a brittle redundant request contract, not hallucinated OKF knowledge. The
recommended correction is for QuestionPlan input to select observation IDs and
for MCP to derive source resource plus revision from the Receipt.

The benchmark also emitted a misleading downstream workspace message saying
only `okf/` was allowed when the skill harness correctly retained `.agents/`;
the actual condition was that `okf/` was never created. That reporting issue did
not cause the lifecycle failure. Because the probe had a clear blocker, no
replica ran under the sequential-run rule.

## V18 contract correction — 2026-08-25

Status: **offline correction passed; V19 qualification pending**.

- QuestionPlan input now selects only `candidate_key + evidence_id` from the
  same guidance request. MCP validates that pairing and derives the canonical
  repository source resource plus exact SourceSnapshot revision before Receipt
  freeze; durable Receipt, SharedQuestion and Hub document formats did not
  change.
- The existing discovery/Receipt suite now proves a nested `src/handler.ts`
  source keeps segment-preserving `/`, derives the exact revision, rejects a
  mismatched evidence selection as retryable `INVALID_ARGUMENT`, then accepts
  the corrected request.
- V18 prompt/results remain immutable. The corrected released-skill run is V19,
  and its missing-output diagnostic now distinguishes the required `.agents/`
  skill directory from the absent `okf/` output.
- The focused test command passed all 72 tests; TypeScript, dependency-cruiser,
  specification and diff checks passed. T037 later repeated the complete gate
  before the V19 probe recorded below.

## Released-skill Sol V19 qualification

Status: **probe failed before Receipt; replica correctly skipped**.

Probe `2026-08-25T135108Z` ran the exact V19 released skill and rebuilt provider.
The complete offline gate passed first with 72 tests, 0 failures. The model run
stopped after 233,140 ms with 470,820 input tokens (401,920 cached), 8,772 output
tokens and 1,933 reasoning tokens. It did not create OKF, Accept, Publish, call a
provider CLI or mutate the fixture.

The V18 provenance correction itself passed offline and the V19 tool schema no
longer asked the Agent for repository URI/revision. This run produced no
QuestionPlan, so the real probe did not exercise that positive path. The first
guidance attempt used human-readable Inventory item IDs instead of the required
fixed pattern and consumed the one correction. The corrected request then
failed because every evidence ID on its infrastructure item had to overlap the
Seed group's bounded source samples, even though the cited Terraform evidence
was valid repository evidence for the same infrastructure disposition.

This is a new MCP/skill Inventory-contract blocker, not an OKF-quality failure
and not a benchmark defect. The corrected workspace diagnostic accurately said
`.agents/` existed while `okf/` was absent. Because there was no Receipt or OKF
to score and the blocker was clear, the sequential replica gate was closed.

Compared with V18, V19 stopped 48,889 ms sooner and used 148,773 fewer input
tokens, 2,496 fewer output tokens and 718 fewer reasoning tokens. Those savings
are descriptive only because neither run reached an equivalent valid proposal.

## V19 root-contract decision

Status: **implemented and passed the complete offline gate; V20 qualification pending**.

The correction is intentionally broader than loosening the failed evidence
check. Agent-facing Inventory becomes three outcomes and removes private IDs,
output parents, item evidence lists and item-ID cross-references. MCP derives
those mechanics and reports bounded caller-correctable defects together. Old
private Receipts are rebuildable and may be discarded; Published Hub/OKF bytes
do not migrate. Requalification uses immutable V20.

The implementation accepts mixed concept/embedded outputs and shared candidates,
derives stable Inventory/QuestionPlan IDs, embedded parents and canonical
Question provenance, and rejects superseded private Receipt shapes before
authoring. Focused tests also prove multiple correctable semantic defects return
together. `npm run verify` passed with 72 tests, 0 failures, no new public tool,
provider or dependency. The first V20 Sol probe is the next gate; an identical
replica is permitted only if that probe is valid and has no clear blocker.

## Released-skill Sol V20 qualification

Status: **probe reached a schema-valid draft but failed Finalize; replica
correctly skipped**.

Probe `2026-08-25T142529Z` ran immutable V20 after the complete 72-test gate.
It took 526,238 ms and used 2,235,749 input tokens (2,132,480 cached), 22,028
output tokens and 4,694 reasoning tokens. It did not Accept, Publish, call a
provider CLI or mutate the fixture.

The V19 blocker is fixed: V20 created a ready Seed, acknowledged every P0 group,
froze one Receipt, prepared authoring and produced a schema-valid nine-concept
draft with Repository, Domain, System, four Functions, one Glue Component, one
Flow and embedded infrastructure. One ordinary relationship-link repair passed.
No mechanical Inventory ID, mixed-output or bounded-sample evidence failure
recurred.

Finalize then rejected the embedded Best Buy dependency because it searched the
parent body for the exact candidate identity hint. The Agent had truthfully
renamed that row from `Best Buy API dependency` to `Best Buy public API
dependency` while retaining its exact Receipt evidence. This is a new MCP
materialization defect, not an OKF-quality or benchmark defect. Compared with
V19, V20 progressed through Receipt and schema-valid authoring, but took 293,098
ms longer and used 1,764,929 more input, 13,256 more output and 2,761 more
reasoning tokens; those costs are not comparable quality wins because neither
run finalized. The clear blocker closed the replica gate. Evidence-based
Finalize is requalified under immutable V21.

## Released-skill Sol V21 qualification

Status: **probe reached a schema-valid draft but dropped one prepared embedded
row; replica correctly skipped**.

Probe `2026-08-25T144513Z` took 459,715 ms and used 1,340,911 input tokens
(1,251,328 cached), 19,314 output tokens and 3,466 reasoning tokens. It did not
Accept, Publish, call a provider CLI or mutate the fixture. Discovery
qualification passed; guidance succeeded on its first request, all P0 groups
received outcomes, and the draft again contained nine schema-valid concepts.
The V20 exact-label defect did not recur.

One ordinary changed-set relationship-link repair passed. Finalize then found
that the Agent had removed the Receipt-prepared `scheduled_trigger` embedded row
from its Flow parent. Because the single repair was already consumed, the skill
correctly stopped Incomplete. This is an MCP ownership defect: detecting a
missing deterministic row still left Receipt mechanics to the Agent. It is not
an OKF semantic or benchmark defect. Compared with V20, V21 was 66,523 ms
faster and used 894,838 fewer input, 2,714 fewer output and 1,228 fewer reasoning
tokens, while reaching the same pre-Finalize depth with no guidance correction.
The clear blocker closed the replica gate. Receipt-owned row restoration is
requalified under immutable V22.

## Released-skill Sol V22 qualification

Status: **valid partial proposal; replica skipped because one exact embedded
source probe remains an owner-review finding**.

Probe `2026-08-25T162253Z` took 386,656 ms and used 1,809,705 input tokens
(1,701,888 cached), 17,076 output tokens and 3,954 reasoning tokens. It did not
Accept, Publish, call a provider CLI or mutate the fixture. Discovery
qualification passed, guidance succeeded on its first request and the complete
Seed → Receipt → Prepare → Validate → Finalize → Inspect lifecycle produced a
schema-valid nine-document proposal. The scheduled trigger and provider-neutral
Glue crawler embedded rows survived Finalize; the V21 dropped-row defect did not
recur.

Initial scoring incorrectly assigned the expected System probe to an
operational-ownership Question and ignored the current-catalog Flow as a useful
Function parent. Those were benchmark defects against AB-BENCH-004/023/027/074,
not OKF or MCP failures. After the scorer excluded Questions from concept
assignment and recognized Component/Flow parents, the same immutable output
re-finalized with 100% recognized-schema agreement, no contradiction or hard
failure and `valid_partial` acceptance. The absent System remains a 75%
non-exhaustive reference-coverage diagnostic. One expected Glue crawler source
path remains missing, leaving embedded coverage at 50% and owner review at
`needs_revision`; it does not invalidate the source-truthful proposal.

Compared with V21, V22 was 73,059 ms faster, used 468,794 more input tokens,
2,238 fewer output tokens and 488 more reasoning tokens, while progressing from
a Finalize blocker to an inspectable proposal. Because the exact embedded-source
finding is still a clear quality-review item, the conditional replica did not
run.

After qualification, the exact reviewed V22 authoring inputs were replayed
deterministically against the configured production Hub without another model
run. MCP accepted the resulting Local Draft and used its dedicated credential to
open [AgentBase-Hub PR #21](https://github.com/khoaha1904/AgentBase-Hub/pull/21)
against `main`. The PR remains unmerged and contains no removal.
