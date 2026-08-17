# AgentBase-Hub contract

AgentBase-Hub is optional until the first Hub-dependent action. Indexing, graph
queries and ordinary coding never create Hub state, commits or publication.

## Local active knowledge

- **AB-LOCAL-HUB-001** — Exactly one state is admitted globally: no Hub,
  local-only Hub or remote-attached Hub. Local `main`, when present, is the
  active query tree; remote identity fixes only on attach/bootstrap.
- **AB-LOCAL-HUB-002** — `prepare` creates an isolated workspace at an exact
  local commit without mutation. After authoring/finalization/inspection,
  `accept` commits the exact reviewed tree once to local `main` without network.
  Refresh may delete a whole subject only when all its non-index content is
  mutable AgentBase draft and the root index loses only its exact subject link.
- **AB-LOCAL-HUB-003** — Accepted commits bind stable proposal identity, mode,
  subject/source/evidence, parent/base, catalog/types, tree/diff digests and
  meaningful creation time through trailers plus atomic state.
- **AB-LOCAL-HUB-004** — Search/read use accepted local `main`, include pending
  accepted commits, exclude unaccepted workspaces and report commit/path.
- **AB-LOCAL-HUB-005** — Pending proposals derive from ordered first-parent Git
  ancestry after the admitted base; sidecars cannot invent pending commits.
- **AB-LOCAL-HUB-006** — Submit publishes one non-empty contiguous pending prefix
  on one deterministic non-target branch and opens/recovers one PR.
- **AB-LOCAL-HUB-007** — Only explicit attach, bootstrap, submit and synchronize
  may use the global token. Normal operation never writes remote `main`, merges,
  approves, force-pushes, deletes branches, changes settings or overrides target.
- **AB-LOCAL-HUB-008** — Synchronization fetches exact remote `main`, recognizes
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
- **AB-QUESTION-001, AB-QUESTION-005** — Finalization may attach bounded
  governed-question declarations to the reviewed proposal digest. Acceptance
  deterministically creates or merges private subject/property records with
  linked claim references, missing evidence and append-only history; accepted
  attachments recover an interrupted post-commit ledger write idempotently.
- **AB-QUESTION-002, AB-QUESTION-003** — Questions can be listed by pending or
  resolved status with claim roles/sources and history. Only an exact-revision,
  non-empty answer attributed as `human:<id>` resolves one; an incompatible
  later answer is appended and reopens it instead of overwriting evidence.
- **AB-QUESTION-004** — An answer prepares exactly one stable, human-authored
  `guidance/<question-id>-r<revision>.md` Maintainer Guidance proposal. Accepted
  Hub bytes do not change until that proposal passes the ordinary inspect and
  accept lifecycle.
- **AB-QUERY-001** — Code questions primarily use Code Graph; business/system/
  cross-repository questions primarily use local Hub; combined answers retain
  both source kinds and limitations.
- **AB-QUERY-002** — Accepted-Hub search supports exact Domain and type scopes,
  ranks identity/path/title/type/description before body matches, and returns
  Domain clarification candidates instead of bodies when an unscoped broad term
  spans several Domains. Exact identity/path and explicit bounded global search
  remain available.
- **AB-QUERY-003** — Accepted canonical relationships can be traversed outbound,
  inbound or both with predicate, depth and node bounds. Inbound traversal is a
  transient reverse view of the one stored evidenced edge.
- **AB-QUERY-004** — Search and traversal identify one exact accepted commit and
  return bounded typed summaries, paths and evidenced edges. Parsing creates no
  durable index, cache, graph database or second knowledge source.
- **AB-QUERY-005** — Root navigation links bounded Domain and fallback System/
  Repository entrypoints. Domain concepts navigate Systems and critical flows;
  System concepts navigate useful entities without copying their knowledge.
- **AB-QUERY-006..008** — `read_hub_live_evidence` reads validated references at
  one exact accepted Hub commit and binds them only to the repository authorized
  on the current MCP connection. The host resolves ready targets through graph
  search/exact snippets, labels documentation/implementation/configuration and
  Maintainer Guidance separately, and never emits an automatic winner. Missing,
  ambiguous, moved or mismatched evidence is reported without a stale scalar.

## Lazy setup and first bootstrap

- **AB-HUB-SETUP-001** — Hub is optional at install and for all Code Graph use.
- **AB-HUB-SETUP-002** — Hub status is exactly `unconfigured`, `local-only` or
  `remote`, resolved from owner-private global configuration, not caller cwd.
- **AB-HUB-SETUP-003** — Only an unconfigured Hub-dependent action offers attach
  existing versus create local-only, before proposal/Git mutation.
- **AB-HUB-SETUP-004** — Existing attach accepts one credential-free GitHub HTTPS
  URL, clones `main` into staging, validates exact clean conformant content and
  atomically admits it.
- **AB-HUB-SETUP-005** — Failed/interrupted setup preserves the prior admitted
  state and never leaves a partial active checkout.
- **AB-HUB-SETUP-006** — New setup performs no network call and creates a private
  local Git `main` containing only explanatory README and OKF v0.2 root index.
- **AB-HUB-SETUP-007** — Base and knowledge commits have distinct explicit
  identities; pending ancestry rejects unclassified commits above the base.
- **AB-HUB-SETUP-008** — Prepare, finalize, inspect, accept, query and pending
  inventory work fully offline against local-only Hub.
- **AB-HUB-SETUP-009** — AgentBase never creates the GitHub repository. First
  publication requires an exact user-created empty repository; any existing ref
  rejects bootstrap.
- **AB-HUB-SETUP-010** — Preview shows base/head/ordered knowledge and execute
  requires explicit `all-to-main` or recommended
  `base-to-main-knowledge-pr`; no mode is silently selected.
- **AB-HUB-SETUP-011** — `all-to-main` creates remote `main` at exact local head
  once and opens no PR.
- **AB-HUB-SETUP-012** — `base-to-main-knowledge-pr` creates remote `main` at the
  base and publishes all current knowledge in one branch/PR; with no knowledge
  it creates base `main` only.
- **AB-HUB-SETUP-013** — Private non-secret phase receipts bind repository, mode,
  base/head and commits so retries reuse exact state and never rewrite a changed
  `main`.
- **AB-HUB-SETUP-014** — After remote `main` is fetched/admitted, configuration
  becomes `remote` and later work uses normal PR publication/synchronization.
- **AB-HUB-SETUP-015** — The one token never enters tool arguments, Git URLs,
  repositories, configuration, receipts or errors. Missing permissions preserve
  local work and request credential repair.
- **AB-HUB-SETUP-016** — Configuration/receipts are owner-private, non-symlink,
  atomic and share the serialized Hub mutation boundary.
- **AB-HUB-SETUP-017** — Offline verification covers no-Hub graph use, both setup
  paths, local-only lifecycle, both bootstrap modes, races, permissions and
  checkpoint recovery with disposable Git/fake GitHub.
