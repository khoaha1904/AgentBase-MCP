# Cross-capability flows

> Status: Accepted sequencing and authority baseline; update when a
> cross-capability flow or authority transfer changes. Group 3 usefulness-proof
> flow is owner-approved; G3-C1 freshness and G3-C2 proposal impact are
> implemented. Its real-model qualification branch is deferred and is not a
> current release gate. Group 4 Profile/Layout, Domain Capsule, migration and
> final mutation-admission flows are implemented and verified; Group 4 is
> closed for the current internal enterprise release. G5-C1 compact authoring
> flows are implemented and verified. G5-C2
> pre-Finalize semantic-quality flows are deferred and inactive. Group 6
> Refresh convergence and release-surface governance are implemented and
> verified.

These flows define system sequencing and authority transfer. Detailed behavior,
bounds and failure recovery remain in the linked Capability Contracts.

## Repository knowledge flow

G9-C1 keeps Add/Update routing in installed instructions, not a runtime router.
Preflight resolves repository identity; Ingest/Refresh retain their own admission
and recovery. Ordinary source updates use Delta, requested missing-knowledge
repair uses Coverage. Provider-dependent relation gaps require a scoped offer
to Domain Enrichment; approval does not replace provider-session confirmation
or Publish authorization.

```text
Repository Reading
        ↓ bounded source evidence
Concept Discovery
        ↓ qualified candidates
Schema Selection
        ↓ provider-neutral roles
Knowledge Entry / Repository dossier authoring
        ↓ editable local proposal
Ingest / Refresh
        ↓ deterministic coverage, source, evidence, OKF and Profile checks
Deterministic Finalize
        ↓ immutable reviewable change
Review and Publish
```

Repository Reading never writes shared knowledge. Discovery and Schema
Selection classify evidence without acquiring publication authority. Knowledge
Entry renders a local proposal; only Review and Publish may advance shared Hub
state.

Refresh freezes its bounded source-change set in the authoring session. Finalize
checks one outcome for every returned path and retains that accounting in the
proposal inspection beside omitted counts and source-diff limitations. The
accounting is review context, not an OKF concept or independent state authority.

The discovery gateway preserves distinct runtime evidence locations before
semantic consolidation and discloses source-census bounds. Core coverage carries
lane, group-sampling and capture limitations into the frozen Receipt. Initial
Ingest Finalize derives the existing Repository coverage-debt marker from that
Receipt in the normalized proposal; author prose cannot silently discard it.
This reuses the current authoring and Refresh owners, adds no public tool or
state collection, and does not rewrite previously Published repositories.

Release-hardening keeps one Refresh flow with two scopes. Delta follows the
existing change-first sequence. Explicit Coverage performs its broad bounded
five-lane source investigation before preparing the same authoring
workspace, then processes continuity and known gaps normally. Partial delta or
Coverage updates one compact Repository coverage-debt marker; later Prepare
projects it as a known gap. A reviewed non-partial Coverage proposal clears that
marker only when it adds no knowledge; otherwise a bounded pass count supports
at most three owner-reviewed convergence passes. No scope bypasses deterministic
Finalize or publication review, and the cap is not a completeness claim.

Group 5 keeps Finalize deterministic and model-free. Existing discovery
coverage and proposal validation run before the exact proposal is inspected and
accepted by the user. A separate AI may advise the operator while a draft is
editable, but it creates no workflow state or admission decision.

Routes: [Repository Reading](../capabilities/01-repository-reading/README.md),
[Concept Discovery](../capabilities/03-concept-discovery/README.md),
[Schema Selection](../capabilities/04-schema-selection/README.md),
[Knowledge Entry](../capabilities/05-knowledge-entry/README.md),
[Ingest/Refresh](../capabilities/09-ingest-and-refresh/README.md), and
[Review/Publish](../capabilities/11-review-and-publish/README.md).

## Query and context flow

Group 8 uses one installed instruction owner, `agentbase-query`, for standalone
answers and evidence inside a primary workflow. The retained `agentbase-context`
entry links to that same owner; it adds no second retrieval or runtime router.
Composition chooses output ownership, not new permissions. Existing bounded
Published search/read and authorized single-repository source reads remain the
only evidence routes. Missing evidence degrades the answer without mutation;
G8-C2 carries a concrete finding, Published identity/revision, needed source and
agreed scope in the current conversation into an existing authoring owner.
There is no stored handoff object or runtime router. Authoring revalidates source
and current Hub identity, then returns a private proposal through its existing
validation/inspection path. Preparation agreement never authorizes Publish.

```text
Exact Published Hub commit
        ↓ commit-bound projection
Query Routing
        ├─→ bounded answer context
        ├─→ Phase 1 AI-SDLC context / impact view
        └─→ Published Visualization projection

Selected local Repository root and pinned revision
        ↓ bounded source reads/searches
Phase 2 AI-SDLC context
        └─→ session-local implementation impact view
```

Query and presentation consume accepted knowledge; they do not overlay Local
Draft or mutate Hub state. AI-SDLC and visualization outputs remain derived and
rebuildable. The Phase 2 implementation view is owned by AI-SDLC context rather
than Published Visualization: exact files, symbols and source edges retain the
authorized repository revision and are never written to Hub or a durable graph
artifact.

The Published Visualization branch may expand standardized, evidence-backed
embedded resource rows into presentation-only references. Those references
remain owned by their Published parent, use only an `embedded-in` presentation
link and never become accepted OKF concepts or canonical runtime relations.

Routes: [Query Routing](../capabilities/10-query-routing/README.md),
[AI-SDLC Context](../capabilities/14-ai-sdlc-context/README.md), and
[Visualization](../capabilities/13-visualization/README.md).

## Enrichment flow

```text
Published Domain knowledge + bounded provider observation
        ↓
Cross-repository relation reconciliation
        ↓
Questions / Guidance when evidence is unresolved
        ↓
local enrichment proposal
        ↓
Review and Publish
```

Provider adapters own observation transport, not knowledge decisions.
Enrichment reconciles only admitted Published inputs and produces a proposal;
unresolved evidence stays explicit rather than becoming an inferred fact.

Routes: [Relations and Enrichment](../capabilities/06-cross-repository-relations/README.md),
[Questions and Guidance](../capabilities/07-conflicts-and-questions/README.md), and
[Review/Publish](../capabilities/11-review-and-publish/README.md).

## Publication flow

```text
Local proposal
    ↓ inspect
Review
    ↓ explicit Publish workflow transition
Direct remote commit / Git branch + pull request
    ↓ local recognition / external merge + explicit synchronization
Published Hub commit
```

Prepare, review and Publish remain distinct correctness transitions; PR policy
additionally requires external merge and synchronization. Failure preserves the last valid state and
exposes a recovery action; no lower layer silently skips a transition.

In the trusted-enterprise profile, selecting the workflow is sufficient to use
the operator's existing process and enterprise identity access; no independent
security ticket is added to each transition. Capability policy may restrict a
future hardened deployment, but it cannot skip, merge or redefine these core
lifecycle transitions within that path.

## Group 7 direct-publication flow

The replacement public flow adds a policy branch after the same validated
candidate: direct mode advances the remote target and recognizes Published;
PR mode pushes a deterministic branch and opens/reuses an exact PR without
advancing either local main or Published. CLI and MCP share configured policy
resolution and publication ownership. Old Accept/pending/submit public routes
are removed, not aliased. PR merge remains external and Sync remains explicit.

The first application slice implements:

```text
Prepared proposal + exact preview confirmation + explicit direct authorization
    -> revalidate inspection / Profile / unchanged base
    -> isolated complete candidate commit + durable receipt
    -> inspect remote -> normal direct push (or recognize an earlier success)
    -> fast-forward clean local main + recognize Published
```

A remote advance stops for reconciliation and renewed review, without editing
the approved proposal. A network failure is not proof of rejection: recover by
checking whether the recorded candidate is already in target ancestry. Local
recognition failure after remote success preserves the receipt for retry.
CLI/MCP and per-Hub policy are implemented for Direct and PR. Shipped skills
use preview then explicit Publish. Old test-state disposal and production helper
retirement are complete; no action silently changes publication mode. Interrupted
candidate construction retries only with proven transaction ownership. After a
candidate is committed, a private ref preserves it while its worktree is removed;
cleanup failure remains visible and retryable without republishing.
Cutover discards owner-authorized old test work and removes the Accept/Local
Draft flow. It introduces no migration or dual-lifecycle compatibility branch;
new private preparation, failure recovery and optional PR publication remain.

## Release and upgrade flow

```text
versioned source commit
    -> required repository verification
    -> platform release build
    -> manifest + checksums + SBOM
    -> installation preflight and lock
    -> stage release + skills + integration changes
    -> verify complete staged state
    -> atomically select current release
    -> retain previous release and close receipt
```

Initial install and `abs upgrade --bundle` use the same transaction owner.
Already migrated clients continue pointing at the stable launcher, so ordinary
upgrades do not rewrite their configuration. A legacy checkout registration is
replaced once only when its complete old identity is recognized; an unknown or
changed same-name entry remains an explicit conflict.

Failure before commit removes only staged state. Failure after any external
integration mutation replays the durable receipt and restores exact previous
installer-owned bytes. `abs rollback` runs the same flow with the retained
previous release as target. `abs uninstall` removes application-managed state
and integrations while preserving durable owner data.

Release compatibility preflight may read the active Hub's declared AgentBase
OKF profile but never edits it. If the target cannot safely read the active
profile/state, upgrade stops before mutation and routes any required content
migration back through its own Product/Architecture/Capability workflow.

## Team concurrency flow

```text
local Hub profile mutation lock
    -> accepted local commit
    -> proposal-specific Git branch / pull request
    -> external review and merge
    -> explicit fetch + ancestry check
    -> rebase/revalidate pending commits or report conflict
```

The local lock prevents competing writers from corrupting one profile on one
machine. Git branches and pull requests coordinate different machines. A
conflict never causes last-writer-wins publication: reconciled content returns
through validation and any affected human review boundary before publication.

## Release evidence flow

Capability documents remain the source of stable requirement IDs. Tests cite
those IDs at their owning behavior. The release-evidence checker derives
coverage in memory and fails CI for missing, duplicate or unknown active release
evidence; no hand-maintained traceability matrix becomes a second authority.
Release CI records the successful contract, evidence and repository gates in
the release manifest without run-specific metadata.

## Group 3 usefulness-proof flow

```text
exact Published commit + relied-upon Repository observations
    -> bounded query/context projection
    -> optional receipt from an already authorized current-source workflow
    -> uniform freshness envelope
    -> sourced response with visible omissions

exact finalized proposal + exact admitted base
    -> semantic before/after impact projection
    -> bounded text / optional disposable visual preview
    -> confirm Publish for the exact proposal or return to authoring

```

Historical comparisons remain external evidence. Model campaigns and their
runner lifecycle are retired; current verification uses focused offline tests.

## Group 4 Profile and Domain Capsule flows

```text
exact Published commit
    -> load base OKF bundle
    -> inspect shared/agentbase-profile.md
    -> classify Profile 1.0 | legacy-unprofiled | unsupported
    -> validate physical home and Domain Capsule paths
    -> admit bounded read or reject unsupported state
```

Profile absence permits an explicitly limited legacy read. An invalid or
unknown declaration is unsupported. Mutation requires the exact authoring
profile; local configuration and release metadata never upgrade Hub authority.

```text
bounded Initial Ingest candidates
    -> propose Repository default home + bounded concept exceptions
    -> show Domain matches, shared choices and participation relations
    -> one owner confirmation
    -> materialize Profile 1.0 paths and navigation
    -> Finalize -> semantic impact -> policy-bound Publish
```

Physical home and Domain participation are separate inputs. A home move is not
an implicit relation edit, and a new relation does not move a document. The
former `confirmed_domain` input may be interpreted as the Domain-default
compatibility form only while it remains unambiguous; no missing shared choice
is inferred.

```text
legacy Published commit
    -> read-only profile/layout report
    -> owner/agent authors exact moves + link/endpoint rewrites
    -> ordinary migration proposal with rollback commit
    -> semantic impact -> policy-bound Publish
    -> Profile 1.0 authoring enabled
```

New Hub bootstrap switches to Profile 1.0 only in the same capability slice
that can author and validate the baseline. Application upgrade/rollback never
runs this flow. The Crawler fixture may instead be reset and re-ingested under
the new profile. Deterministic correctness and round-trip fixtures remain gates;
capacity and real-model benchmarks are deferred.

## Group 5 compact Profile flow

```text
new or reset Profile 1.0 Hub
    -> root and shared navigation + Profile declaration
    -> domains/<slug>/index.md Domain concept/navigation
    -> repositories/<slug>.md rich dossier
    -> optional knowledge/<slug>.md independent concepts
    -> optional questions/<id>.md lifecycle documents
    -> no Published activity logs
```

Schema type is read from frontmatter. Domain, Repository, Question and Profile
have fixed placement; every other admitted standalone type shares
`knowledge/`. Missing directories do not get scaffolded. Existing qualification
Hubs may be reset and re-ingested because the owner classified their data as
disposable; no application upgrade, normal authoring flow or test fixture may
generalize that permission to a durable Hub.

```text
exact source + Discovery Receipt + editable compact bundle
    -> deterministic coverage/source/evidence/OKF/Profile validation
    -> Finalize -> Inspect -> policy-bound Publish
```

Optional external AI review may advise draft edits before Finalize. The deferred
product-integrated quality design creates no current packet, report, probe,
repair, override or Batch gate.
