# 09.11 — Deferred semantic quality admission design

> Status: Deferred and inactive. G5-C2 is not part of the current release,
> Finalize admission or requirement-evidence gate. This design is retained for
> future Product review only and may be activated only after observed ingest
> defects justify its workflow cost and the owner explicitly reopens it.
>
> Potential impact: Broad workflow change. It would reuse Discovery
> Seed/Receipt, authoring sessions, deterministic validation, proposal inspection
> and the existing one-repair principle. It adds no production model service,
> Benchmark gate or Published report format.

Product Contracts:
[Repository understanding](../../product/01-repository-understanding.md) and
[Knowledge lifecycle](../../product/03-knowledge-lifecycle.md).

Architecture Contracts:
[Ownership](../../architecture/ownership.md),
[Dependencies](../../architecture/dependencies.md),
[Flows](../../architecture/flows.md),
[State and trust](../../architecture/state-and-trust.md), and
[Runtime](../../architecture/runtime.md).

## Current → target

The implemented workflow accounts for important Discovery groups, validates
evidence and OKF structure and permits one repair. A structurally valid proposal
can still be shallow, omit a developer-important boundary, split knowledge into
thin documents or retrieve poorly. The same authoring context is unlikely to
notice all of its own omissions.

If reactivated, G5-C2 would add deterministic semantic coverage/risk assessment and a
conditional fresh-context AI critic while the bundle is editable. The critic is
required by generic complexity/limitation signals, not by repository language,
framework, provider or labels such as frontend/backend. It may request one
repair and review the repaired digest once. Deterministic Finalize and human
Accept/Publish remain the authority boundaries.

## Quality sequence

```text
exact source + frozen Discovery Receipt + editable compact bundle
    -> deterministic quality packet and review-risk decision
    -> not-required(reason) | required AI critic
    -> ready | repair-required | incomplete-source
    -> at most one repair and one digest-bound re-review
    -> deterministic validation and Finalize
    -> Inspect -> Accept -> Publish
```

Every draft gets a quality packet. A versioned deterministic policy requires the
critic when any of these Receipt/draft facts is present:

- a priority discovery lane is limited, truncated or depends on high-signal
  direct-source fallback;
- more than one non-governance standalone boundary beyond the Repository/Domain
  is proposed;
- an Interface, Flow or cross-home/cross-repository relation is proposed;
- the draft changes a standalone boundary, relation or Flow during Refresh;
- the run is one member of a multi-repository Batch Initial Ingest; or
- the owner explicitly requests review.

The policy may evolve only as a versioned provider-neutral contract with focused
fixtures. A low-risk run records `not-required` plus exact reasons. Model cost or
availability cannot silently downgrade a required decision.

## Reviewer packet and isolation

The packet binds:

- authoring mode, exact Hub base and source snapshot identity/revision;
- Discovery Seed/Receipt identity and digest, coverage lanes, candidates,
  disposition and explicit limitations/ignored reasons;
- compact home plan, current Published contribution when Refreshing, full
  editable changed documents and draft tree/digest;
- bounded evidence locators/excerpts and source-fallback diagnostics; and
- bounded draft-retrieval probes and their exact expected subject identities.

The critic begins in a separate fresh context that receives the packet but not
the author's private reasoning or transcript. It may use the same authorized
exact source snapshot and Code Graph for bounded follow-up verification, but it
cannot change source, expand repository/Hub/provider authority or inspect
secrets. Model/provider/reasoning identity is recorded as execution evidence,
not hard-coded product policy. A host unable to provide required isolation
returns an unavailable/incomplete result rather than self-certifying.

## Provider-neutral rubric

The critic evaluates only obligations applicable to evidence it can establish:

1. repository purpose and real deployment/ownership boundaries;
2. principal capabilities and responsibilities;
3. public interfaces, commands, events, schedules and triggers;
4. important data stores and external dependencies/integrations;
5. evidenced cross-boundary flows and failure/operation concerns;
6. claim-to-source evidence quality and visible source limitations;
7. Repository dossier usefulness and links to independently promoted knowledge;
8. over-modeling, thin/duplicate documents and under-modeling;
9. unresolved gaps represented as Questions/limitations rather than certainty;
10. source-grounded developer questions retrieving the expected dossier or
    concept from the bounded draft projection.

Absence of an inapplicable lane is not a defect. There is no minimum document
length, concept quota, generic completeness percentage or framework-specific
endpoint/resource rule. The report explains concrete findings with evidence;
it does not replace them with a single quality score.

## Report, repair and override

A submitted report has one strict version and binds the quality-packet digest,
source/Receipt/base identities, exact draft digest, rubric/risk-policy versions,
reviewer isolation/execution identity, bounded probe outcomes and bounded
findings. Each finding has one category, `blocking` or `warning` severity,
evidence references, affected document/candidate identities and one concise
recommended disposition such as merge, embed, add evidence, promote, question
or ignore-with-reason.

The verdict is exactly `ready`, `repair-required` or `incomplete-source`.
Unknown fields, stale digests, unsupported versions, missing evidence references
or inconsistent verdict/severity fail report admission. Reviewer prose never
becomes a claim merely because a model produced it.

`repair-required` permits one authoring repair. Any byte change invalidates the
prior report and requires one review of the new digest; there is no second
automatic repair. A still-blocking or incomplete result stops the attempt. The
owner may explicitly override exact remaining findings for the exact draft
digest with a bounded reason. The override is visible in Inspect/PR and grants
no exception to deterministic OKF, evidence, source or Profile validation.

## State, Batch and Refresh

Packets, complete reports, probes, repair history and overrides live in the
existing owner-private session/proposal state. They are retained only while
authoring, review, publication or recovery needs the proposal. Inspect and PR
text may show a bounded digest-bound summary. No report, transcript, Inventory,
score or activity `log.md` enters Published Hub content.

Each Batch Initial Ingest member receives an isolated decision/report before
composition. One member's review cannot cover another's source or findings, and
the batch cannot Finalize until every member is ready, validly skipped or
explicitly overridden. Refresh requires review only for the generic risk facts
above; evidence/prose-only low-risk updates may record `not-required`.

Reviewer timeout, crash, malformed output, stale source/base/draft or lost
isolation changes no Hub bytes and leaves the attempt recoverable or Incomplete.
Retry may reuse an exact packet/report only while every bound digest and policy
version remains identical.

## Deferred requirements (inactive)

The following identifiers describe the retained future design. They are not
current runtime requirements, release evidence obligations or permission to add
packet/report, reviewer, repair, override or draft-query state.

- **AB-QUALITY-001** — Every Initial Ingest and Refresh draft receives one
  versioned deterministic semantic coverage/risk decision before Finalize.
- **AB-QUALITY-002** — Risk depends only on bounded Receipt/draft/workflow facts
  listed in this contract and explicit owner request; repository language,
  framework, provider, name and frontend/backend labels are forbidden inputs.
- **AB-QUALITY-003** — A `not-required` decision retains exact policy version and
  reasons. A required decision cannot be downgraded by model cost, timeout or
  unavailable reviewer execution.
- **AB-QUALITY-004** — The quality packet binds exact Hub base, source snapshot,
  Seed/Receipt, coverage, candidates/dispositions, home plan, draft tree/digest,
  current contribution when applicable, evidence/fallback diagnostics and
  bounded draft probes.
- **AB-QUALITY-005** — A required critic runs in a fresh context without the
  author's private reasoning, receives no new authority and records execution
  identity as evidence rather than product policy. Missing isolation is visible
  failure, not readiness.
- **AB-QUALITY-006** — Reviewer follow-up reads remain bounded to the same exact
  authorized source snapshot/graph and cannot read secrets, mutate source or
  invoke provider/Hub publication operations.
- **AB-QUALITY-007** — The critic applies the ten provider-neutral rubric areas
  above only when applicable and reports evidence-backed findings rather than a
  numeric quality or completeness score.
- **AB-QUALITY-008** — Document-density review has no length/file/concept quota.
  It flags a standalone document only when independent value is unjustified,
  content duplicates a parent or important evidence is fragmented/omitted.
- **AB-QUALITY-009** — Draft probes are source-grounded developer questions with
  exact expected subject identities and bounded results. They operate on a
  private draft projection and never expose Local Draft to ordinary query.
- **AB-QUALITY-010** — A report uses one strict bounded schema, binds every input
  and policy/draft digest, validates all evidence references and has exactly one
  verdict: `ready`, `repair-required` or `incomplete-source`.
- **AB-QUALITY-011** — A blocking finding cannot coexist with `ready`; warnings
  remain visible. Model prose, unsupported suggestions and unknown fields never
  become knowledge or silently alter the draft.
- **AB-QUALITY-012** — `repair-required` permits at most one authoring repair and
  one review of the changed digest. Any byte change invalidates the old report;
  unresolved blocking/incomplete results stop automatic progress.
- **AB-QUALITY-013** — An owner override binds the exact draft digest, remaining
  finding identities and bounded reason, is visible in Inspect/PR and cannot
  bypass deterministic source/evidence/Profile/OKF validation.
- **AB-QUALITY-014** — Finalize remains deterministic and model-free. It admits
  only a valid `not-required`, exact `ready` report or exact owner override, then
  runs all existing validation before creating an immutable proposal.
- **AB-QUALITY-015** — Quality packets, full reports, probes, repairs and
  overrides remain owner-private proposal/session state. Published Hub contains
  none of them and no AgentBase activity log; inspection may render only a
  bounded digest-bound summary.
- **AB-QUALITY-016** — Batch evaluates every member independently before atomic
  composition. Refresh uses the same generic risk policy and does not invoke a
  critic for low-risk evidence/prose updates solely because the repository is a
  particular kind.
- **AB-QUALITY-017** — Timeout, malformed/stale output, source/base drift,
  unavailable isolation and interrupted review mutate no Hub bytes and retain an
  exact retryable or Incomplete state.
- **AB-QUALITY-018** — Semantic quality admission adds no production model SDK,
  daemon, reviewer database, Benchmark execution or generalized usefulness
  claim. Deterministic fixtures and one full disposable-domain re-ingest are the
  release evidence.

## Implementation and verification ownership

If Product review reactivates this design, `app/hub-okf/authoring` would own
packets, risk/admission, report validation and
repair state; public `core/knowledge` entrypoints own reusable provider-neutral
values and bounded bundle projection; released host skills own critic
orchestration. Focused tests cover policy, schema, digest invalidation,
isolation failure, repair/override, Batch and private-draft containment before
the canonical repository/release gate and one owner-authorized domain re-ingest.
