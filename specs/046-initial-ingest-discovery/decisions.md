# Initial Ingest discovery — owner decision checkpoint

> Status: owner decisions and reviewer corrections D01–D34 are approved. This
> is a design checkpoint, not current runtime authority.

## Reference findings

- GitNexus performs broad deterministic structural extraction first, including
  routes, entry points, call paths and process candidates, then ranks, groups
  and deduplicates. AgentBase adopts the discovery lesson, not its graph model.
- Potpie's current local baseline is harness-led rather than scanner-written.
  It requires explicit discovery lanes and an evidence matrix before a graph
  write. AgentBase adopts the explicit-coverage lesson, not Potpie's ontology or
  tool surface.
- The pinned Codebase Memory `0.10.8` already exposes more useful architecture
  evidence than AgentBase's normalized overview currently retains. Capability
  046 should use that provider rather than introduce another parser.
- Reference projects are learning inputs only. The target is the best fit for
  AgentBase, Codebase Memory and compact OKF; there is no requirement to balance
  or imitate the two products.

## Approved decisions

### D01 — Broad discovery, selective knowledge

Discovery is broad across high-value source signals. Rendering stays selective:
there is no concept quota and no requirement to copy the repository into OKF.
A sparse result is valid only when important discovered signals have an explicit
disposition.

### D02 — Responsibility split

- Codebase Memory detects structural signals and helps locate source.
- The host Agent interprets meaning and chooses a disposition.
- MCP validates machine-signal acknowledgement, evidence, disposition and OKF integrity.

Code Graph output does not decide concepts and is never Hub evidence by itself.

### D03 — Five discovery lanes

Every Init covers or explicitly limits:

1. repository identity and product purpose;
2. runtime units and entry points;
3. interfaces, routes, events and triggers;
4. dependencies, integrations, data and channels;
5. deploy and operational configuration.

### D04 — Four dispositions

Every important discovery group becomes exactly one of `concept`, `embedded`,
`question` or `ignored` with a bounded reason. Question and Ignored items do not
pass through schema selection.

### D05 — Preserve the five-stage workflow

Keep `Preflight -> Discover -> Investigate -> Author -> Validate`.

- Preflight binds repo/revision, reads bounded root docs, confirms Domain and
  routes an existing Repository to Refresh.
- Discover indexes once and builds a machine-derived Discovery Seed.
- Investigate closes the five lanes and creates the Inventory.
- Author validates guidance, prepares skeletons and writes concepts, embedded
  knowledge and Questions.
- Validate applies separate discovery-coverage and OKF-integrity gates before
  Finalize/Inspect.

### D06 — Important versus low-value signals

Routes, entry points, runtime roots, API specs, IaC/deploy files, explicit
service boundaries, channels and datastores require acknowledgement. Individual
CRUD handlers, ordinary functions, lockfile-only dependencies, generated code,
vendor code and non-authoritative fixtures can be grouped or ignored. Important
means “must be handled,” not “must become a concept.”

### D07 — Evidence and snapshots

Code Graph is a locator. Attributed OKF claims and relations cite authorized
repository source paths/spans. Root docs establish stated purpose; code/config,
API specs and IaC establish implementation or desired state. Small direct,
non-sensitive values are rendered snapshot-first with revision/time. Large or
scattered configuration keeps a general file reference. Live/provider-only
values become limitations or Questions during Init.

### D08 — Concept boundaries

Repository and confirmed Domain assignment are mandatory anchors. System is not
automatic: it represents an evidenced runtime/product identity. Components map
to meaningful workloads within a System; Function maps only to an independently
triggered/deployed function; Interface groups a useful contract rather than one
CRUD route; Flow represents a source-proven goal/operational sequence rather
than a raw call trace. Queue, topic, table, bucket, host and similar resources
stay embedded unless they have independent ownership, operational, lifecycle,
security, failure or shared-contract value. Catalog 7 remains unchanged.

### D09 — Cross-repository relations

Init records every outbound dependency found in its authorized repository. It
creates a relation only when an exact Published target is uniquely resolved by
strong identity evidence. Otherwise it retains an embedded candidate or
Question for later Domain Enrichment. It does not create placeholder external
concepts. New members inside one Batch are not reconciled against each other
during Init.

### D10 — Outcome semantics

The public result is either `Ready for review` or `Incomplete`. A ready result
may have partial coverage, Questions and limitations. Incomplete is reserved for
authority, process, source-mutation, integrity or unrepaired validation failure
that prevents a trustworthy proposal. Detailed internal benchmark categories
may remain internal.

### D11 — Retry and checkpoint behavior

The user calls Init again; MCP decides resume or restart.

- Before Prepare, retry restarts Discover/Investigate but may reuse a verified
  Code Graph cache for the same revision.
- After Prepare, Author/Validate may resume from the retained private workspace
  and Inventory Receipt when repo revision and Hub base still match.
- Source/base/integrity drift invalidates unsafe state and starts a new attempt.
- Incomplete output is never queryable, acceptable or publishable.
- Batch retries only the failed member when exact completed checkpoints remain valid.

### D12 — Codebase Memory integration

Gateway captures index diagnostics and normalizes the pinned provider's routes,
entry points, packages, boundaries, layers, hotspots and clusters. A bounded
source-file census groups API specs, Terraform/Terragrunt, Docker/deploy, CI,
runtime manifests and root docs. Routes, entry points, service boundaries,
source groups and partial/unsupported diagnostics may drive coverage gates;
hotspots, clusters and raw package boundaries are investigation hints only.
No public `scan_for_okf_concepts` tool is added. Provider-format compatibility
is covered by adapter contract tests on upgrade.

### D13 — Discovery Seed and Inventory Receipt

The per-connection Discovery Seed binds repository root/revision and captured
machine signals; it is discarded on repo switch, revision change or session
close. During Investigate, Inventory remains editable. Successful guidance
freezes a compact Receipt containing lane statuses, items, dispositions, source
references, limitations and an MCP-derived digest. Raw graph/source does not
enter the Receipt.

MCP validates `Discovery Seed -> Inventory -> OKF`: high-signal groups cannot be
silently absent, and Concept/Embedded/Question dispositions must materialize in
the proposal. Ignored groups appear only as bounded inspection counts/reasons.

### D14 — Receipt handoff

`get_okf_authoring_schemas` should return a `discovery_receipt_id` after
validating the inventory. New-mode `prepare_hub_okf` consumes that exact receipt
instead of trusting a re-sent mutable guidance request. Before Prepare the
receipt is session-only; after Prepare its compact form belongs to the private
authoring checkpoint. This adds no public tool or workflow database.

### D15 — Public skill behavior

The user invokes only `agentbase-ingest`. Internal Codebase Memory and OKF skills
guide the five stages. Routine ambiguity becomes a Question instead of an
interactive interruption. Only Domain, Repository identity or scope/authority
ambiguity may block for user confirmation. MCP does not choose the harness
model; Sol remains the Init qualification recommendation, not a runtime router.

### D16 — Init, Refresh and Enrichment boundary

Init creates the first broad repository-local baseline. Normal Refresh remains
change-first, then known gaps, then a small discovery pass. A later explicit
Full Discovery Refresh may rerun broad discovery after an MCP upgrade or owner
audit while preserving Repository identity. Domain Enrichment resolves
cross-repository/provider candidates after publication. It does not replace
repo-local discovery.

### D17 — Batch behavior

Batch reuses isolated single-repository Init sequentially. Each member owns its
Seed, Receipt, staging and checkpoint. One member's evidence cannot support
another. The batch validates and publishes one atomic proposal; cross-member
reconciliation waits for post-publish Domain Enrichment. Parallel/model-router
work remains deferred until measured need.

### D18 — Review presentation

Proposal inspection shows Repository/Domain/revision, concept adds/updates/
deletes, embedded groups, relations/Flows, Questions, five-lane coverage,
Ignored group counts/reasons and limitations. Raw Inventory and graph records do
not enter the PR. Structured inspection plus Markdown diff remains the MVP;
HTML review is optional later.

### D19 — Qualification policy

Benchmark the released skill, not a synthetic authoring prompt. Expectations are
tiered: P0 identity/runtime/interface/deploy/outbound-evidence/integrity signals
are blocking; P1 useful Flows/data/integrations/limitations may yield partial;
P2 CRUD/helper/test details are not completeness targets. Do not require exact
concept counts, names or one exact evidence-file combination when another valid
representation exists. Run sequentially; stop on an obvious blocker, otherwise
run one identical replica. Report improvements, regressions, OKF/MCP issues,
benchmark issues, elapsed time and tokens. Measure tokens before optimizing.

### D20 — Large repositories and monorepos

One Git root gets one Init and one Code Graph. A parent workspace containing
multiple Git roots routes through Scan/Batch. A real monorepo receives one whole
repo overview; path-scoped architecture may investigate evidenced runtime roots
without reindexing. Unsupported/partial parser coverage is a limitation and may
fall back to bounded direct source reading; it is not automatically a failed
run. Do not infer one System per `apps/*` directory without semantic evidence.

### D21 — Questions

Question is durable unresolved knowledge, not an error or a dump for every
missing detail. Useful kinds include identity, relation, ownership/scope,
runtime value and conflict. Questions include observed evidence, missing proof,
options/recommendation when available and affected concepts/relations. Only
Repository identity and primary Domain questions block Init. Resolution remains
proposal/review based and user answers remain user evidence rather than absolute
truth. Similar questions are grouped to prevent flooding.

### D22 — Init mutation authority

Init may add its Repository, owned concepts, confirmed Domain relation,
navigation, Questions and strongly resolved outgoing relations. It must not
delete or rewrite Published knowledge owned by another repository, merge old
concepts, repair stale Hub content or re-Init an existing Repository. Existing
Repository routes to Refresh. Hub-base advance triggers rebase/revalidation and
returns to source investigation only when evidence or identity actually changed.

### D23 — Human-readable knowledge activity

Keep Git commit/PR and proposal diff as authoritative history. Add concise
non-concept activity summaries at:

```text
repositories/<slug>/log.md
domains/<slug>/log.md
```

Repository logs cover successful Init, Refresh, corrections and Question
resolution affecting that repo. Domain logs cover successful Enrichment,
cross-repository relation/Flow and membership changes. Do not log queries, tool
calls, raw Inventory or failed/Incomplete attempts into the Hub. Logs use the
existing validated date/bullet format, newest first; concepts may link to their
log. Do not place history in indexes, every concept or one global log.

### D24 — Conflicting repository sources

Do not silently choose one source as absolute truth when repository evidence
conflicts. Preserve each useful claim with its source role and revision: direct
code/config/API specifications/IaC describe implemented or desired technical
state, while README/docs may describe intent or an older public contract. Render
small safe values as attributed snapshots. Create a grouped Question when the
conflict materially affects behavior, ownership, relations or operations;
otherwise retain the attributed difference without interrupting Init. There is
no global rule that code always defeats documentation.

### D25 — Source selection for local and Hub Init

`agentbase-scan` reports repository, branch, dirty state and Hub membership
without building a Code Graph. Initial Ingest requires one active Remote Hub;
without it AgentBase offers Scan and source/Code Graph work only, not OKF
authoring or a Local Draft. Source selection happens during Init Preflight,
before Discover. Init targets the exact current commit of the repository's
remote default branch:

- the current checkout is reused only when it is clean and already matches that
  exact remote commit;
- otherwise MCP creates an isolated detached worktree/cache for the remote
  default commit and never checks out, stashes or modifies the user's workspace.

Discover builds or reuses a graph bound to that exact source snapshot. The same
graph, Receipt and OKF proposal can continue only while that snapshot and its
authority remain valid. Changing only the graph cannot make old OKF valid.
Failure to resolve or access a Hub-bound remote default source makes that member
Incomplete rather than falling back to a feature branch. Batch applies this
rule sequentially and independently per repository.

### D26 — Discovery completion rule

Broad discovery is not exhaustive reading. Discover completes when every one of
the five lanes is marked covered, absent-after-check or limited, and every
important machine-signal group has one explicit disposition. It does not keep
traversing ordinary CRUD handlers, helpers, tests or individual functions to
maximize concept count or benchmark recall. An unresolved P0 signal caused by
source, authority or adapter failure makes the run Incomplete; remaining P1/P2
detail may produce a Ready-for-review proposal with Questions or limitations.
Do not set a fixed concept quota or premature token/time target. Measure the
real skill workflow first, then optimize only demonstrated cost.

### D27 — Bounded repository reading

Read the root README when present and inspect primary runtime/package manifests,
API specifications, Terraform/Terragrunt, Docker/deploy, CI and runtime config
groups. For `docs/`, inspect its index, filenames and headings first; read deeper
only for relevant architecture/deployment/integration documents or documents
linked by the root README. Use Code Graph signals to open source at entry points,
routes, triggers, integrations and runtime boundaries. Generated/vendor/build
output is excluded, and lockfiles are dependency hints rather than attributed
behavior evidence. When parser coverage misses an important area, permit bounded
direct reading of relevant files and record the limitation. Do not crawl all
documentation or source merely for completeness.

### D28 — Compact discovery groups

The Discovery Seed presents compact evidence groups rather than raw graph nodes
or one item per route/function/resource. Deterministic grouping may combine
entry points belonging to one runtime, routes sharing one interface boundary,
calls sharing a target/protocol and deployment resources supporting one
workload. Low-value repeated items retain a count and bounded source samples.
Each Seed group has a session-stable ID and receives exactly one disposition.
The Agent may materialize several concept or embedded outputs from that one
group, but the coverage group itself is not split or merged in the MVP. MCP
groups structure and owns coverage; the Agent still decides meaning and outputs.

### D29 — One source authority for all Hub authoring

Every Hub-bound repository authoring workflow that may later publish knowledge
uses the same exact remote default-branch SourceSnapshot: single Init, Batch
Init, normal Refresh and a future Full Discovery Refresh. The current local
working tree, including feature or dirty state, remains available to ordinary
source/Code Graph query but cannot become Hub knowledge. This removes the
feature-draft publication path from the MVP and prevents an abandoned branch
from entering the Hub through Refresh after a clean Init.

### D30 — Remote default advance is freshness, not corruption

Preflight proves the pinned commit was the remote default head at selection
time. If that branch later advances, the exact immutable snapshot remains valid
for review and publication and receives a visible `source-advanced` freshness
warning. A later Refresh handles the newer commit. Invalidate discovery or
authoring state only when the pinned source snapshot changes, disappears,
becomes inaccessible, fails integrity checks or loses repository authority.
Default-head advance alone must not restart a long Batch.

### D31 — One host-bound credential authority in the MVP

The active Hub credential may access source repositories only on the exact same
GitHub.com or GitHub Enterprise host as the active Hub. Canonicalize admitted
HTTPS, `ssh://git@...` and SCP-style `git@host:owner/repository.git` identity to
credential-free HTTPS, but never reuse SSH agent or ambient Git credentials for
network access. A source on another host, an ambiguous/missing canonical remote
or insufficient per-repository token permission makes that member Incomplete.
Multi-host source credential profiles are deferred.

### D32 — Activity-log ownership stays narrow

Initial Ingest writes only the affected Repository activity log; its routine
Repository-to-Domain membership does not also write a Domain log. Repository
logs remain the home for later repo-owned Refresh, correction and Question
resolution summaries. Domain logs are reserved for Domain Enrichment,
cross-repository relation/Flow work and explicit Domain-level corrections,
including reviewed membership correction. Capability 046 implements the Init
Repository entry only; Git/PR/diff remains complete history.

### D33 — Recoverable Batch member failure does not stop siblings

A semantic, materialization or member-local provider failure marks that member
failed and, after confirmed clean provider/worktree cleanup, Batch continues
sequentially with remaining members. Uncertain cleanup, process corruption,
Hub/source authority failure or invalid shared base stops the whole Batch.
Finalize remains unavailable until every confirmed member is complete or the
user explicitly revises membership; retry replaces only failed member state and
reuses exact completed sibling checkpoints.

### D34 — Reviewer corrections make discovery deterministic, not larger

After an Init/Batch-Init Preflight arms the exact analysis root and indexing that
root succeeds, MCP—not the Agent—runs one fixed private baseline over index
status/coverage, explicit architecture aspects (`overview`, `structure`,
`dependencies`, `routes`, `languages`, `packages`, `entry_points`, `hotspots`,
`boundaries`, `layers`, `clusters`) and a bounded safe file census. `file_tree`
and `cycles` are excluded. Search and trace remain bounded Agent investigation,
not Seed accumulation. MCP assigns lane status and fixed P0 classes; the Agent
cannot self-declare coverage, absence or priority.

P0 covers repository/confirmed-Domain identity, evidenced runtime/entrypoint,
explicit interface/trigger, explicit deploy/IaC workload, explicit outbound
dependency and diagnostics that may hide any of them. A non-terminal page cannot
prove absence. P0 overflow or a limitation capable of hiding P0 makes the member
Incomplete; lower-priority overflow is grouped and disclosed. A P0 group may be
ignored only as `duplicate-covered` with a target Inventory item that will
materialize. Generated/out-of-scope signals are classified below P0 before Seed
publication; discovering that classification only later becomes a limitation or
Incomplete result, not ignored success.

Questions reuse the existing SharedQuestion model and candidate-evidence
reference. A private QuestionPlan binds kind, target subject/candidate, property,
scope, source/revision and missing evidence; Finalize renders it from the
immutable Receipt rather than trusting mutable question text. An unbindable
uncertainty stays a limitation. One outbound/trigger/datastore boundary may
produce a bounded P1 Flow candidate and one representative trace; no process
graph is added.

Remote source materialization uses an AgentBase-owned, profile/source-scoped
private bare mirror and detached worktree outside the user repository. It
normalizes a unique canonical remote, uses only same-host Hub-token HTTPS,
verifies the fetched commit against the API result, and never uses local refs,
filters, hooks, submodules, LFS, SSH agent or ambient Git credentials. Provider
admission excludes secret-like paths before indexing. Cleanup is marker-owned
and path-validated. Evidence authored from a snapshot retains its exact source
revision so later Refresh cannot relabel old claims.

For that armed Init only, `index_repository` preserves the provider result blocks
and appends one bounded AgentBase Seed summary so the Agent can see group IDs
without a new public tool. Ordinary query and normal change-first Refresh do not
create a Seed; future Full Discovery Refresh may opt in later.
Each Inventory item names one origin group and may carry multiple output
mappings. The Receipt is immutable connection state until Prepare atomically creates one
persisted authoring session. Identical Prepare retry returns that session;
mismatched input is rejected; finalized/cancelled sessions are terminal. Hub
base movement before Init Finalize retains unchanged source/Seed/Inventory,
rematches Published identity, issues a new Receipt and creates a replacement
authoring session without rerunning source discovery. Normal Refresh instead
reruns its existing preparation/guidance against the new Published base while
reusing unchanged source analysis; it has no Discovery Receipt. After Finalize,
normal publication reconciliation applies.
Capability 046 does not broaden current
AWS/SQS-only Domain Enrichment or retrofit already Published repositories; those
require the already-deferred Full Discovery Refresh or an intentional clean
re-ingest during qualification.

## Review closure

Owner review is complete through D34. High-level presentation and low-level
living design must label this behavior as a pending Capability 046 target until
implementation and released-skill qualification complete. Any later material
implementation gap changes this record and the affected living design before
runtime code changes; small grouped gaps follow the same reconciliation before
the capability closes.
