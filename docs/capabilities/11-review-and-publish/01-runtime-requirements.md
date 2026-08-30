# 11.01 — Capability requirements

This file contains normative requirements enforced by the shared Local Hub,
publication, Question and synchronization runtime. Capability-specific indexes
route to shared groups without copying their IDs.

AgentBase-Hub is optional until the first Hub-dependent action. Indexing, graph
queries and ordinary coding never create Hub state, commits or publication.

## Local active knowledge

- **AB-LOCAL-HUB-001** — Exactly one state is active: no Hub or one configured
  remote Hub profile. Without a remote profile only Code Graph workflows run.
  Each normalized host/repository/branch profile owns isolated Published and
  Draft Git state.
- **AB-LOCAL-HUB-002** — `prepare` creates an isolated workspace at an exact
  local commit without mutation. After authoring/finalization/inspection,
  `accept` commits the exact reviewed tree once to local `main` without network.
  Refresh omission never authorizes deletion; destructive changes require an
  explicit correction/removal intent, reason and evidence bound to final bytes.
- **AB-LOCAL-HUB-003** — Accepted commits bind stable proposal identity, mode,
  subject/source/evidence, parent/base, catalog/types, tree/diff digests and
  meaningful creation time through trailers plus atomic state.
- **AB-LOCAL-HUB-004** — Ordinary search/read use only exact synchronized
  Published state. Accepted pending commits and unaccepted workspaces are
  available only to scan/status, inspection, review and publication workflows.
- **AB-LOCAL-HUB-005** — Pending proposals derive from ordered first-parent Git
  ancestry after the admitted base; sidecars cannot invent pending commits.
- **AB-LOCAL-HUB-006** — Submit publishes one non-empty dependency-safe selection
  as deterministic per-Repository publication units and opens/recovers their PRs.
- **AB-LOCAL-HUB-007** — Only explicit attach, bootstrap, submit, synchronize and
  Hub Initialization actions may use the shared owner-private Hub token. Normal operation never writes the remote target branch, merges,
  approves, force-pushes, deletes branches, changes settings or overrides target.
- **AB-LOCAL-HUB-008** — Synchronization fetches the exact configured remote target, recognizes
  published identity, rebases remaining commits in an isolated candidate and
  advances the active ref only after validation; conflict/interruption preserves
  original state and recovery evidence.
- **AB-LOCAL-HUB-009** — Mutations fail before changing refs/state on wrong
  remote/ref, unsafe paths, dirty Hub, ambiguous ancestry, stale reviewed bytes
  or conflicting transaction ownership.
- **AB-LOCAL-HUB-010** — Canonical lifecycle proof uses disposable real Git and
  fake GitHub HTTP, never a real repository.
- **AB-LOCAL-HUB-011** — Accept, publication, synchronization and recovery share
  one atomic owner lock; cancellation never silently resets or drops knowledge.
- **AB-LOCAL-HUB-012** — A proposal subject is a logical canonical review focus,
  while `sourceRepositoryId` independently records the evidence source. New
  selected concepts may be created across canonical entity roots; their paths
  are not forced beneath the repository concept.
- **AB-LOCAL-HUB-013** — Refresh may change an unverified AgentBase draft across
  canonical roots only when the proposed concept cites the current source and
  retains exact foreign-repository source resources. Protected bytes remain
  unchanged, and shared indexes may only add navigation without rewriting
  existing nonblank lines.
- **AB-LOCAL-HUB-014** — Prepare reports exact-base bounded continuity:
  current-source summaries, the logical subject when resolved, one-hop
  neighbors and relevant navigation paths with explicit omitted counts. The
  complete checkout remains lifecycle state and is not serialized as authoring
  context.
- **AB-LOCAL-HUB-015** — A new repository proposal may append navigation to an
  existing root or category `index.md`, but every accepted nonblank line remains
  byte-exact and ordered. Renaming the Hub/category heading, deleting, replacing
  or reordering existing navigation fails before proposal acceptance.
- **AB-LOCAL-HUB-016** — Hub assigns one canonical Repository ID once and stores
  strong remote/forge/lineage aliases in the Repository concept. Checkout path,
  display name and current remote are hints, not regenerated identity. One
  strong match survives rename/organization transfer; shared fork/mirror
  lineage is ambiguous and requires owner choice.
- **AB-LOCAL-HUB-017** — The active local view stores one explicit last-admitted
  Published ref independently from mutable remote-tracking/candidate refs.
  Status and pending ancestry derive from that Published ref; fetch or conflict
  cannot advance it. Successful synchronization atomically advances Published,
  active local state and recovery evidence while preserving remaining drafts.
- **AB-LOCAL-HUB-018** — Status returns available local identity/heads/draft
  health even when pending parsing, credentials, network or remote inspection
  fails. Remote status best-effort reports exact target, current versus updates
  available, bounded open-PR count and synchronization/recovery state without
  mutating refs or knowledge.
- **AB-LOCAL-HUB-019** — Explicit workspace Scan/status may correlate strong
  local Repository identities with active-profile Local Draft and exact matching
  PR metadata to recommend review, submit, wait or reconcile instead of a
  duplicate Init/Refresh. It never exposes Draft bytes through ordinary Hub
  search/read and performs no automatic workflow action.

## Reviewable PR publication

- **AB-PUBLISH-001** — `submit_hub_okf_proposals` is the only public action that
  pushes accepted Hub knowledge and creates PRs. It uses the dedicated Hub token;
  the caller never receives the token or substitutes `gh`.
- **AB-PUBLISH-002, AB-PUBLISH-003, AB-PUBLISH-004** — Every new PR deterministically presents Purpose,
  Scope, Knowledge Changes, Uncertainty, Evidence and Validation, and Reviewer
  Action. Scope identifies exact proposals, source Repositories, available
  Domains/revisions and accepted commits. Changes distinguish Added, Updated,
  Removed; Questions, limitations and unavailable
  optional detail remain visible. Bounded rendering must preserve complete
  proposal, subject and Domain identities rather than truncating a combined
  scope line.
- **AB-PUBLISH-005** — PR prose/receipts contain no token, credential, local
  absolute path or unbounded model narrative.
- **AB-PUBLISH-006** — Publication dependency is derived per source Repository,
  not from global Local Draft ancestry. Each Init targets configured `main`; each
  Refresh targets the immediately preceding unpublished proposal branch for that
  same Repository.
- **AB-PUBLISH-007** — Independent Repository Init proposals publish as separate
  branches/PRs from the same admitted Published `main`, even when their accepted
  local commits are consecutive. Empty-remote bootstrap is a support-baseline
  direct write, not a knowledge publication batch or PR.
- **AB-PUBLISH-008** — MCP replays only each proposal's exact accepted
  contribution onto its publication base and admits repository, base
  branch/commit and head branch/commit before PR creation. For a governed
  append-only shared index, exact contribution means only navigation added by
  the selected proposal; unrelated earlier Local Draft lines are excluded.
  Other conflict, drift or multiple matching PRs stop without merge, deletion
  or target mutation.
- **AB-PUBLISH-009** — Retry recovers exact existing branches and matching open
  PRs, and refreshes their deterministic title/body from retained accepted
  proposal evidence. Partial multi-PR failure leaves completed units intact and
  retryable.
- **AB-PUBLISH-010** — Canonical proof uses disposable Git and fake GitHub HTTP;
  real credentials and publication remain opt-in.
- **AB-PUBLISH-011** — When Published `main` advances, remaining open proposal
  branches are reconciled sequentially. A compatible branch is advanced on the
  same remote branch so the PR number/URL survives; conflict stops before push.
  A Refresh whose predecessor became Published is retargeted to `main` before it
  can continue. MCP never approves, closes or merges the PR.
- Confirmed primary-Domain materialization is governed by
  [`AB-INGEST-010`](../05-knowledge-entry/06-runtime-requirements.md#single-repository-initial-ingest);
  publication adds no side registry or System-name inference.
- **AB-QUESTION-001** — Question is an MCP-rendered shared Hub governance
  document at `questions/<stable-id>.md`, with navigation in
  `questions/index.md`. It is part of the ordinary proposal tree/digest and
  becomes visible to another machine through normal Git synchronization; no
  private ledger or attachment is knowledge authority.
- **AB-QUESTION-002** — Stable Question identity is created once from immutable
  origin kind/subject/property/scope without a machine-local Hub identifier.
  Rename/redirect updates references but never regenerates ID/path. Typed
  references namespace owning concept, item kind/key, source and optional
  observed revision so multi-repository evidence resolves at one exact Hub
  commit.
- **AB-QUESTION-003** — Dedicated MCP rendering/validation owns exact Question
  fields, bounds, references, index uniqueness and
  `agentbase.question.state` transitions among `open`, `resolved` and
  `needs-review`. Top-level OKF `status` remains a separate document lifecycle.
  Each accepted Question-document edit increments revision exactly once;
  generic Ingest/Refresh cannot edit Question bytes or broaden mutable-draft
  policy. `Resolved` only means no maintainer action remains; competing current
  positions stay visible until a reviewed correction/removal changes Published
  bytes.
- **AB-QUESTION-004** — An exact-revision answer attributed as `human:<id>`
  atomically proposes one stable Maintainer Guidance revision and the linked
  Question update. Published state does not change before ordinary validation,
  inspection and Accept; a stale answer never updates state.
- **AB-QUESTION-005** — Private Question indexes/caches are optional and fully
  rebuildable from one exact Hub commit. Clean cutover rejects orphan accepted
  Guidance instead of silently discarding prior Question context.
- **AB-QUESTION-006** — The public `agentbase-hub` skill owns explicit Question
  review: list bounded accepted Questions, answer only one selected exact
  revision with `human:*` attribution, inspect the resulting proposal and stop
  before Accept or Publish unless each later action is explicitly requested.
  Ordinary `agentbase-query` remains read-only.
## Hub CI

- **AB-HUB-CI-001** — `okf hub-ci --root <checkout>` performs one bounded offline
  validation pass and returns deterministic blocking errors, warnings and the
  AB-QUERY-011 freshness projection. It performs no source/provider/network write.
- **AB-HUB-CI-002** — Blocking validation covers OKF/root/index syntax, known
  AgentBase schemas, canonical relationship targets, Questions/index, observed
  values, external identities and obvious sensitive content or paths.
- **AB-HUB-CI-003** — Unknown custom OKF types receive base validation and a
  visible warning; unknown type alone does not fail CI.
- **AB-HUB-CI-004** — Freshness is always warning-only context. CI has no stale
  threshold and never creates a Question, triggers Refresh or changes knowledge.
- **AB-HUB-CI-005** — Every MCP-created Hub base includes one exact CI bundle:
  workflow, standalone validator and version/checksum manifest. It runs for pull
  requests, pushes to `main`, weekly schedule and manual dispatch.
- **AB-HUB-CI-006** — The workflow grants only `contents: read`, uses pinned
  third-party actions, verifies the bundled validator before execution and
  contains no package install, sibling-repository checkout, MCP credential,
  `pull_request_target` or write permission.
- **AB-HUB-CI-007** — CI emits only the GitHub Actions Summary. It stores no Hub
  report/artifact and adds no daemon, model/provider call or production dependency.
- **AB-HUB-CI-008** — An existing Hub receives missing or outdated CI only through
  the explicit support-only Hub Initialization PR based on exact remote `main`.
- **AB-HUB-CI-009** — Retry recovers only the exact deterministic branch and open
  PR. Changed base, extra files, drift or ambiguity fail before a remote write.
- **AB-HUB-CI-010** — Hub Initialization uses the dedicated Hub token internally and
  never writes remote `main`, merges, approves, closes, deletes or changes settings.
- **AB-HUB-CI-011** — Canonical proof uses fixtures, disposable Git and fake
  GitHub. The generated artifact is derived from canonical validator source and
  Hub execution requires no public or internal package registry.

## Hub Initialization

- **AB-HUB-SETUP-018** — Existing-Hub initialization previews exact remote
  `main`, README state, CI state, intended support paths and one deterministic
  digest without synchronizing or replaying Local Draft knowledge.
- **AB-HUB-SETUP-019** — Initialization adds the standard README only when it is
  absent, never overwrites an existing README, skips exact current CI and installs
  all three released CI files only when CI is missing, partial or outdated.
- **AB-HUB-SETUP-020** — Explicit initialize creates or recovers one exact
  support-only PR. Complete baseline is a no-op; changed base, extra paths, byte
  drift or ambiguous PR state stops before remote write.
- **AB-HUB-SETUP-021** — The standard README on a newly created or initialized
  Hub gives human readers one concise onboarding path: link AgentBase-MCP and
  the Hub, direct readers to canonical `index.md`, explain the OKF/not-source-
  copy boundary, describe representative layout, review publication and CI.
  It never duplicates the concept catalog or becomes a second knowledge index.

## Single-repository Refresh

- **AB-REFRESH-001..003** — Refresh binds one authorized checkout to one
  unambiguous existing Repository and active local `main`. It returns bounded
  prior concepts, observed source state, changed paths, known gaps and omitted
  counts; a missing Repository routes to Initial Ingest. Existing attributable
  non-governance concept roles remain authorable without being guessed again
  from semantic signals. The skill reads exact changed Git hunks before known
  gaps or bounded discovery; a partial large-file read is not equivalent.
- **AB-REFRESH-004..006** — Refresh changes only attributable current-repository
  contributions. Omission, age and search/graph absence preserve knowledge.
  Correction/removal requires exact intent, reason and current-source evidence;
  foreign evidence and ambiguous prose remain.
- **AB-REFRESH-007..011** — Finalize fails on stale Hub/source or invalid source
  spans, treats unchanged bytes as successful `no_change`, preserves truthful
  partial coverage, and groups review as Added, Updated, Removed and Questions/
  Limitations. Only a reviewable contribution
  records a new observed source checkpoint in its Repository concept.
- **AB-REFRESH-012** — The packaged Refresh skill investigates Changed Source →
  Known Gaps → Bounded Discovery and stops before Accept, publication, provider
  CLI enrichment or remote mutation.

## Lazy setup and first bootstrap

- **AB-HUB-SETUP-001** — Hub is optional at install and for all Code Graph use.
- **AB-HUB-SETUP-002** — Hub status is exactly `unconfigured` or one active
  `remote` profile, resolved from owner-private configuration, not caller cwd.
- **AB-HUB-SETUP-003** — An unconfigured Hub-dependent action stops with compact
  guidance to connect one remote URL/branch/token profile; it never creates a
  local-only OKF authority implicitly.
- **AB-HUB-SETUP-004** — Existing attach accepts one credential-free GitHub HTTPS
  URL plus exact target branch, clones that branch into staging, validates exact clean conformant OKF content
  and atomically admits it. A legacy existing Hub may omit the explanatory
  README; MCP-created new Hubs still include it.
- **AB-HUB-SETUP-005** — Failed/interrupted setup preserves the prior admitted
  state and never leaves a partial active checkout.
- **AB-HUB-SETUP-006** — After explicit preview/confirmation, an exact empty
  user-created remote may receive one bootstrap commit directly on the configured
  target branch containing only the complete released baseline: standard README,
  valid OKF v0.2 root `index.md` and exact read-only Hub CI bundle.
- **AB-HUB-SETUP-007** — Base and knowledge commits have distinct explicit
  identities; pending ancestry rejects unclassified commits above the base.
- **AB-HUB-SETUP-008** — After remote admission/synchronization, prepare,
  finalize, inspect, accept, Published query and pending inventory may work from
  that profile's local state without an automatic network call.
- **AB-HUB-SETUP-009** — AgentBase never creates the GitHub repository. First
  publication requires an exact user-created empty repository; any existing ref
  rejects bootstrap.
- **AB-HUB-SETUP-010** — Bootstrap preview shows exact remote emptiness, target
  branch, baseline paths/digest and the one-time direct-write exception. There
  is no bootstrap publication-mode choice.
- **AB-HUB-SETUP-011** — Confirmed bootstrap creates exactly the configured
  target at the released baseline commit and opens no PR. It contains no Local
  Draft or knowledge proposal.
- **AB-HUB-SETUP-012 (retired)** — The former base-plus-knowledge bootstrap PR
  mode is removed. Knowledge begins only through normal proposal PRs after the
  complete baseline is admitted.
- **AB-HUB-SETUP-013** — Private non-secret phase receipts bind repository,
  target, baseline digest and commit so retry accepts only the exact ref created
  by that intent and never rewrites a changed target.
- **AB-HUB-SETUP-014** — After the remote target is fetched/admitted, configuration
  becomes `remote` and later work uses normal PR publication/synchronization.
- **AB-HUB-SETUP-015** — The shared owner-private Hub token never enters tool
  arguments, Git URLs, repositories, configuration metadata, receipts or errors.
  Missing permissions preserve local work and request credential repair.
- **AB-HUB-SETUP-016** — Configuration/receipts are owner-private, non-symlink,
  atomic and share the serialized Hub mutation boundary.
- **AB-HUB-SETUP-017** — Offline verification covers no-Hub graph/scan use,
  existing remote connection, exact-empty full-baseline bootstrap, races,
  permissions and checkpoint recovery with disposable Git/fake GitHub.
- **AB-HUB-SETUP-022** — Installation creates no Hub and collects no token.
  Only explicit Hub-profile connection creates/adopts Hub state; status, Code
  Graph and workspace inventory never create Hub authority.
- **AB-HUB-SETUP-023** — A remote profile is identified by normalized HTTPS
  GitHub host, repository and exact target branch. Each identity owns isolated
  local checkout and configuration; exactly one profile is active. One
  owner-private shared Hub token is reused across profiles, while activation
  never merges, replays or copies knowledge from another profile.
- **AB-HUB-SETUP-024** — Remote connection accepts credential-free repository
  URL plus target branch. Token entry occurs only through an owner-private
  masked terminal flow; blank input reuses the shared token and non-empty input
  stages a replacement. The token is never a model/tool argument. GitHub.com
  uses its public API; another admitted HTTPS GitHub host uses the standard
  Enterprise API on that host. Clone, API, PR URL and permission checks bind the
  same host.
- **AB-HUB-SETUP-025** — Internal accepted ancestry may stay on local `main`
  while every remote read/write, pull request, initialization and CI target uses
  the configured branch. A profile change is staged and validated before one
  atomic active-pointer update; failure preserves the prior active profile.
- **AB-HUB-SETUP-026** — The packaged Hub control skill presents compact status,
  guides secure profile/credential setup and calls synchronization only after
  explicit user intent. The MVP has no daemon, periodic task, hidden first-call
  pull, simultaneous multi-Hub query or cross-Hub merge.
- **AB-HUB-SETUP-027** — Status is byte-for-byte read-only. Legacy profile,
  credential and transaction migration runs only before an explicit mutation;
  it canonicalizes host/repository/branch identity without moving the checkout
  or losing drafts. Active remote actions read the shared owner-private Hub token;
  no GitHub CLI or ambient credential fallback is used.
- **AB-HUB-SETUP-028** — Bootstrap holds mutation and activation ownership,
  rechecks remote emptiness and active intent before its sole direct target write,
  then admits the canonical profile and Published baseline atomically/recoverably.
  Any pre-existing ref or byte drift stops; subsequent direct target writes are
  forbidden.
- **AB-HUB-SETUP-029** — Synchronization rejects rewritten Published ancestry,
  dirty candidates and blocking OKF integrity defects before atomic admission.
  This integrity subset does not require support-CI files or treat freshness as
  a gate. Recovery binds exact Main/Published state and may take over only the
  matching dead-process lock; legacy transactions remain idempotent.
- **AB-HUB-SETUP-030** — One explicit owner-terminal Hub connect command accepts
  only a credential-free GitHub HTTPS repository URL and exact target branch,
  prompts for an optional masked shared token, reuses the prior token when the
  prompt is blank, and invokes the ordinary validated attach/activation
  boundary. Token bytes never enter chat, MCP/tool inputs, process arguments,
  output, errors, repositories or Git configuration. MCP tools never obtain a
  token or gain ambient credential fallback.
- **AB-HUB-SETUP-031** — Connect activates the destination profile only after
  token admission, remote access and exact Hub validation all succeed. A
  missing token, denied or malformed token, unavailable branch, invalid Hub or
  interrupted attach preserves the previously active profile and shared token;
  a reported failure restores any replacement staged by that attempt. An
  uncatchable process termination may leave only owner-private staged state, but
  never activates the destination. Connect does not synchronize, copy/replay
  Local Draft, or merge knowledge across profiles; the packaged Hub-control
  skill directs connect/switch requests through this single terminal flow.
