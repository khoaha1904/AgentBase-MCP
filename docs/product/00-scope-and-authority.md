# 00 — Scope and authority

> Status: Product identity, authority, MVP scope and migration boundaries are
> accepted and implemented unless an item is explicitly marked deferred.

## Outcome and ownership

AgentBase has two products:

- **AgentBase-MCP** is the local application used by coding agents. It owns Code
  Graph access, evidence investigation, the OKF schema catalog, local knowledge
  workflows and synchronization.
- **AgentBase-Hub** is an ordinary Git repository containing shared Google Open
  Knowledge Format Markdown. It contains no graph engine, MCP runtime or hidden
  operational database.

Other AI workflows may consume AgentBase through its installed skills and MCP
tools. AgentBase supplies bounded system context and evidence; it does not own
the caller's planning, discovery, delivery or approval workflow. The first
product qualification target is Hub-only feature discovery for BA/PO/DM, with
no source checkout prerequisite. Developer task planning may add selective local
Code Graph/source investigation after Hub context identifies the relevant scope.

## Durable team knowledge boundary

AgentBase is a Git-native knowledge publishing system for a team, not a general
living-context database. A team connects a bounded set of repositories to one
Hub and improves that Hub over time through Ingest, Refresh, Questions, Domain
Enrichment and ordinary pull-request review.

Repository graphs, provider reads and source investigation are rebuildable
inputs. Their useful conclusions are reduced into consistent, human-readable
OKF documents with provenance, uncertainty and navigation back to source. The
reviewed OKF output and its Git history are the durable shared product.

As more repositories are published and revisited, AgentBase may propose better
cross-repository relationships and replace weak assumptions with stronger
evidence. It does not require one ingest to be complete, and it never treats an
automatically inferred graph edge as accepted team knowledge without the normal
review boundary.

AgentBase may learn implementation patterns from code-graph and context-graph
products, but keeps a different result and authority model:

- Code intelligence remains detailed, local, disposable and source-derived.
- Hub knowledge remains sparse, portable, reviewable and team-owned.
- Git diff, pull-request review and Git history remain the publication and
  correction mechanism.
- AgentBase does not attempt to retain every code fact, development event or
  external-workflow record in a hidden canonical graph.

## Default deployment trust

AgentBase is designed first for a trusted enterprise workspace. The operator,
machine, network, MCP client/AI service and enterprise identity providers are
managed for the intended company work. The product still protects knowledge
correctness through provenance, explicit workflow transitions, review,
publication boundaries and recovery; it does not add a separate security grant
to every normal internal action.

A workflow may select any local Git repository readable by the current process.
AgentBase resolves and pins that repository for the workflow; changing
repositories requires neither reinstalling AgentBase nor maintaining a
persistent source-root allowlist.

This default is not a public or hostile-client security claim. Source,
credential, workflow and transport boundaries remain explicit product concepts
so a separately qualified hardened/public deployment can enforce stricter
policy later without changing the knowledge model or normal workflows.

## AgentBase CLI boundary

The CLI is the small owner control surface, not a second API for every MCP
workflow. Its product name is `abs`; OKF remains the shared knowledge-format
standard. The public MVP intentionally exposes only:

```text
abs status                         read local AgentBase state
abs hub connect --url ... --branch ...  select/validate one Hub
abs hub sync                       explicitly pull the active Hub
```

Group 2 adds three owner lifecycle commands after its downstream contracts and
implementation are complete:

```text
abs upgrade --bundle <file>        transactionally activate an exact release
abs rollback                       restore the retained previous release
abs uninstall                      remove managed application integration, preserving owner data
```

Initial installation remains the release bundle's `install.sh`. Automatic
update discovery, a background updater and a release-coordination service are
not part of this group.

Ingest, Refresh, Enrichment, Query, Questions, Accept, Publish, benchmark and
recovery are selected by product skills/MCP or developer verification. The
technical `mcp` launcher and legacy `okf` routes remain hidden compatibility
paths so client registration and existing automation are not broken.

Hub connection identifies and validates the exact destination profile. Its
credential may come from the enterprise or local credential mechanism already
available to the operator and may be reused where that provider policy allows.
AgentBase never writes a secret into Hub knowledge or accepts one through model
content. Connect and sync remain separate workflow boundaries.

A user can investigate source through a disposable local graph, turn bounded
evidence into a reviewed OKF proposal, accept it as Local Draft and later
publish selected pending commits through a pull request. Ordinary Hub query
reads only synchronized Published knowledge.

Installation selects no Hub and Code Graph never requires one. OKF authoring and
Hub query require an explicitly configured remote profile identified by exact
GitHub host, repository and target branch. Each profile keeps independent
Published/Draft state while one profile is active; credential resolution remains
the responsibility of the configured enterprise or local provider. Changing
the active Hub never merges or copies knowledge between profiles.

All Hub profiles are product-level peers. Labels such as production, staging or
test are environment conventions chosen by an owner or development team; they
are not persisted AgentBase roles and do not change query, ingest or publication
semantics.

For enterprise installation, AgentBase owns pinned, attributed source snapshots
for its Code Graph engine and future diagram foundation. Release maintainers
build one reviewed Code Graph bundle per supported platform; ordinary
installation verifies and activates that repository-contained bundle without a
compiler, native headers or a provider download. The Codebase Memory Graph UI
frontend is excluded. Retained diagram-design source adds no released UI,
renderer, tool or skill by itself.

## Accepted release and operating model

> Product and Architecture design accepted. Deterministic release artifacts,
> the local application lifecycle, client/skill integration and CI qualification
> plus local/Git concurrency are implemented and verified. Group 2 is closed.

The legacy developer installer remains coupled to a mutable checkout. The
product now has identity `0.1.0`, a deterministic `linux-x64` archive and a
transactional stable-launcher lifecycle covering client registration and
versioned skills. Only an exact version-tag build that passes repository and
release-evidence verification becomes a distributable CI artifact; the first
such artifact can exist only after this implementation lands and its tag runs.

The target product distributes immutable, versioned application releases while
keeping durable owner data independent from application bytes. MCP clients and
users address a stable launcher rather than a checkout or version directory.
Install, upgrade and uninstall stage and verify their complete change before an
atomic cutover; a failed operation restores the last working application and
configuration state. Uninstall preserves durable Hub, workflow and owner data
unless a separate explicit purge is requested.

Every release has a real compatibility identity and passes required CI. Its
artifacts include a release manifest, checksums and an SBOM, and released
requirements remain traceable to automated verification. The trusted-enterprise
default does not require public-distribution signing or attestation; a future
hardened/public profile may add those controls at the preserved release-policy
boundary.

AgentBase permits one local writer for a Hub profile at a time. Multiple team
members coordinate shared changes through ordinary Git branches, pull requests
and rebase/conflict handling. AgentBase adds neither a central coordination
server nor a distributed lock manager; concurrent edits may require re-review
after Git reconciliation.

## Current flow

```text
source repository
  -> resolve canonical Repository and confirm grouped physical home/participation
  -> build or reuse private Code Graph
  -> agent investigates graph and authorized source evidence
  -> normalize bounded provenance-bearing observations
  -> author a rich Repository dossier plus independently useful knowledge
  -> deterministic Finalize and explicit human review
  -> accept into Local Draft
  -> publish user-selected dependency-safe proposal units through MCP-owned PRs
  -> after merge, synchronize and rebase remaining pending commits safely
  -> query synchronized Published knowledge
```

Remote status is a read-only comparison. AgentBase never performs a hidden
daily pull: it reports available updates and synchronizes only after an explicit
user request.

Code structure, symbols, callers and exact implementation primarily come from
the current repository graph. Business, system, infrastructure and
cross-repository knowledge primarily come from local AgentBase-Hub. Answers may
combine both when their sources and limitations remain visible.

## Knowledge model

The detailed Codebase Memory graph is machine-local, private, disposable and
non-canonical. Raw graph records, provider identifiers and graph databases never
enter AgentBase-Hub.

Only selected observations with repository revision, bounded source provenance,
engine identity and limitations may support generated OKF. Observation is an
explicit action and does not create knowledge by itself.

AgentBase targets Google OKF v0.2 at pinned source commit
`3fcbb9f828c2f23d109c855ee403c3a4c81f3a96`:
<https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/3fcbb9f828c2f23d109c855ee403c3a4c81f3a96/okf/SPEC.md>.
An OKF bundle is linked Markdown with YAML frontmatter, bundle-relative concept
IDs and reserved index/log rules. Conformance does not prove semantic truth.

## MCP protocol direction

AgentBase-MCP serves the official MCP `2026-07-28` era over stdio and its
reusable Streamable HTTP adapter while retaining legacy `2025-11-25`
compatibility. The default HTTP deployment remains inside the trusted enterprise
boundary. Public, hostile-client or multi-tenant exposure is unsupported until
a separately qualified hardened profile supplies the required authentication
and authorization; this does not change Hub publication rules.

AgentBase catalog 7.0 supplies a small provider-neutral authoring core.
Versioned Terraform-family detection and AWS mapping profiles attach technology
metadata without deciding that every cloud resource deserves a concept.
Terraform and Terragrunt are supported source tools; SAM/CloudFormation is not.
Promotion is evidence-driven and sparse: internal resources remain searchable
inside a useful parent, while independent runtime, contract or operational
boundaries may become concepts. Unknown valid OKF types remain readable and
protected. Missing evidence becomes a limitation or governed Question, never
an invented field.

A **Concept Schema** is one reusable released catalog definition. A **Concept
Instance** is one concrete provenance-bearing Hub document created from
repository evidence. One schema may yield many instances, but each instance
declares one concrete type; AgentBase does not merge competing schemas onto one
document.

## Governance and authority

Generated concepts begin as drafts. Previous generated prose is continuity, not
new evidence. Human-authored, verified, externally owned or ambiguously owned
knowledge is protected. Absence from a later ingest is not deletion evidence.

Local acceptance and remote publication are separate authorizations. Normal
operation never creates a GitHub repository, writes remote `main`, merges or
approves a PR, force-pushes, deletes branches, changes repository settings or
drops pending local commits. The only direct target-branch write is an explicit
empty-remote bootstrap of the complete released README + root index + CI
baseline after preview/confirmation.

## Stable product requirements

- **AB-PRODUCT-001** — Official identities are AgentBase-MCP and AgentBase-Hub.
- **AB-PRODUCT-002** — Temporary or legacy names never become product defaults
  or generated subjects; an explicitly admitted source keeps its real identity.
- **AB-PRODUCT-003** — AgentBase-MCP owns application behavior; AgentBase-Hub
  owns portable OKF Markdown and Git history only.
- **AB-PRODUCT-004** — Canonical directory migration is report-first, additive,
  history-preserving and never modifies dirty legacy worktrees.
- **AB-PRODUCT-005** — Remote renames, remote rewrites, launcher cutover,
  directory cleanup and shared-history rewriting each require separate owner
  authorization and an exact rollback point.
- **AB-PRODUCT-006** — The user-facing AgentBase command name is `abs`; OKF is
  a knowledge-format standard, not a CLI namespace. `abs --help` exposes only
  a small set of owner operations. MCP tools, product skills and developer
  runners remain separate internal interfaces and are not dumped into public
  command help.
- **AB-PRODUCT-AUTH-001** — The default product profile is a trusted enterprise
  workspace. It relies on the operator's process access and configured
  enterprise identities; it does not claim public, hostile-client or
  multi-tenant safety.
- **AB-PRODUCT-AUTH-002** — A workflow may select any local Git repository
  readable by the current process. AgentBase resolves and pins its exact root
  and source state for that workflow without persistent root admission,
  per-repository installation or reconfiguration.
- **AB-PRODUCT-AUTH-003** — A Hub profile is identified by exact host,
  repository and target branch and keeps independent knowledge/workflow state.
  Credential resolution may reuse the operator's configured enterprise or local
  provider policy; secrets never enter Hub knowledge or model content.
- **AB-PRODUCT-AUTH-004** — Normal internal authoring, provider reads and Hub
  operations use explicit product workflows and their existing review/state
  transitions. The default profile does not require separate capability
  activation or a per-action security ticket.
- **AB-PRODUCT-AUTH-005** — Source, credential, workflow and transport
  boundaries remain stable so a future hardened/public profile can enforce
  stricter policy without changing AgentBase's knowledge model or normal
  workflow semantics.
- **AB-PRODUCT-AUTH-006** — One Hub is one Published-knowledge read trust zone.
  Teams split Hubs when readers must not see the same knowledge; current MVP
  does not claim Domain-, concept- or field-level access control.
- **AB-PRODUCT-RELEASE-001** — Every distributable release has a real version
  and an explicit compatibility identity. `0.0.0` is development state, never a
  published release identity.
- **AB-PRODUCT-RELEASE-002** — Released application bytes are immutable and
  independent from durable owner data. Users and MCP clients address one stable
  launcher and do not depend on a repository checkout or version directory.
- **AB-PRODUCT-RELEASE-003** — Install, upgrade and uninstall are transactional:
  stage and verify the complete target, cut over atomically, and restore the
  last working application/configuration state on failure. Uninstall does not
  implicitly purge durable Hub, workflow or owner data.
- **AB-PRODUCT-RELEASE-004** — Required CI qualifies every release. Each
  released artifact has a manifest, checksums and an SBOM, and every released
  requirement is traceable to automated verification or an explicit qualified
  evidence gate. Public signing and attestation remain a future deployment
  policy, not a trusted-enterprise prerequisite.
- **AB-PRODUCT-RELEASE-005** — Compatibility and migration cover the
  application, stable launcher, client registration, installed skills,
  configuration, durable local state and MCP contract. An incompatible or
  irreversible migration requires a new Product decision and an explicit
  recovery path before release.
- **AB-PRODUCT-OPS-001** — At most one AgentBase writer may mutate one local Hub
  profile at a time. Multiple users coordinate shared Hub writes through Git
  branches, pull requests and rebase/conflict handling; AgentBase has no central
  coordination service or distributed lock manager.
- **AB-MIGRATION-001** — Migration preflight records exact source state and
  collisions; canonical clones are created only from admitted commits/remotes.
- **AB-MIGRATION-002** — Cutover and cleanup remain independent approvals and
  prove rollback before the next external step.
- **AB-MIGRATION-003** — New local AgentBase data uses one owner-private root,
  `AGENTBASE_HOME` when explicitly set or `~/.agentbase` by default. Its
  `bin`, `runtime`, `config`, `hubs`, `state`, `cache` and `tmp` children have
  fixed ownership. Application-managed `bin`/`runtime` remain lifecycle-
  independent from durable owner data.
- **AB-MIGRATION-004** — Hub checkout/Draft/Published and recoverable workflow
  state are durable under the root; provider/query caches are rebuildable and
  temporary workspaces are disposable. No secret or raw graph enters Hub.
- **AB-MIGRATION-005** — Existing XDG-era directories are compatibility input
  only and are never deleted, moved or rewritten implicitly. A safe legacy
  `/tmp` Hub runtime is copied once into durable `state/` when the new target is
  absent; the source remains untouched and unsafe/colliding input fails closed.
- **AB-MIGRATION-006** — A storage-root failure, collision or unsafe permission
  fails closed before a Hub or provider mutation; isolated test/benchmark runs
  may select `AGENTBASE_HOME` without touching the operator's root.

## Current non-goals

- A second graph model, shared raw graphs, background watchers or a daemon.
- A general-purpose living context graph or complete SDLC event store.
- Ownership of another tool's Feature, Issue, Requirement, User Story or Task
  lifecycle.
- A hard-coded integration with one tracker, discovery skill or company process.
- Automatic OKF generation from ordinary coding or indexing.
- Automatic publication, merge or GitHub repository creation.
- A complete universal ontology or one file/directory per schema.
- Model SDKs, model credential storage or real model calls in canonical tests.

## Accepted current limits

- There is no backup or shared Local Draft; unpublished work remains local and
  can be lost with the owning machine.
- Refresh reads one repository and never treats absence as deletion evidence.
- Batch Refresh and mixed Init/Refresh are deferred.
- Reconciliation cannot guarantee a relationship when sources lack strong
  shared identity.
- AgentBase performs no remote auto-clone, global provider-account/region scan
  or automatic semantic/vector fallback.
- Hub access reads all Published knowledge; there is no Domain-, concept- or
  field-level ACL.
- Structured infrastructure evidence currently supports Terraform/Terragrunt;
  SAM/CloudFormation and additional provider profiles are deferred.
- Ordinary Hub query is Published-only. Local Draft exists for review.
- The Published Hub graph and every search index are rebuildable read-only
  projections, not additional sources of truth.
- Real model/provider qualification is opt-in evidence and is not required by
  the canonical offline repository gate.

There are no unresolved product decisions hidden in these limits. Expanding a
limit requires an explicit Product/Architecture/Capability Contract delta.

## Accepted product design groups

These groups are the accepted order for closing current product-readiness gaps.
Each group collects related decisions that may affect one another. The complete
Product horizon is accepted first so a later group can still reshape an earlier
Product decision before delivery makes that change expensive.

### Group 1 — Authority and trust

**Group status:** Closed across Product, Architecture, Capability,
implementation and verification.

- **Current → Target:** The deployment trust model is implicit, while proposed
  hardening would add persistent source admission and per-action grants to every
  environment. Make trusted enterprise the explicit default: select readable
  repositories per workflow, use configured enterprise identities, retain
  review/state boundaries and keep one Hub as one read trust zone. Reserve a
  stable policy boundary for a future hardened/public profile.
- **Benefit → Impact:** Internal teams can change repositories and use normal
  workflows without repeated security setup, while later hardening need not
  replace the knowledge model or workflow contracts. The default inherits the
  operator's machine/network/provider access and must not be exposed as a safe
  public or hostile-client service; separate audiences still require separate
  Hubs.

### Group 2 — Release and operations

**Group status:** Closed across Product, Architecture, Capability,
implementation and verification. The deterministic `linux-x64` release
artifact, stable-launcher application lifecycle, client/skill integration,
release-CI evidence and local/Git concurrency capabilities are implemented.

- **Current → Target:** Replace checkout-coupled `0.0.0` installation and
  primarily local verification with immutable versioned releases, a stable
  launcher, transactional install/upgrade/uninstall with rollback, required CI,
  manifest/checksum/SBOM evidence and requirement-to-test traceability. Permit
  one local writer per Hub profile and use Git PR/rebase for team concurrency;
  add no central AgentBase server.
- **Benefit → Impact:** Releases become reproducible, supportable and recoverable
  while Git remains the shared concurrency mechanism. Installer storage, client
  registration, skills, artifacts and compatibility handling change; existing
  installations migrate once, and concurrent Hub edits may require rebase and
  re-review.

### Group 3 — Knowledge usefulness and product proof

**Group status:** Closed for the current internal enterprise release scope.
G3-C1 uniform freshness and G3-C2 proposal semantic impact are implemented and
verified. G3-C3 real-model usefulness qualification is explicitly deferred and
is not a release gate. The accepted campaign design remains current for later
use, but this release makes no generalized benchmark-proven usefulness claim.

- **Current → Target:** Useful results are qualified mainly in one Crawler
  Domain, while freshness visibility, proposal review effort, stewardship cost,
  retrieval omissions and onboarding value remain partially measured. Replace
  this with one explicit cross-repository impact/requirement-clarification wedge
  qualified across different Domains, a monorepo and a longitudinal Refresh,
  with a uniform freshness envelope and bounded proposal impact preview.
- **Benefit → Impact:** This proves where AgentBase creates repeatable value and
  exposes its maintenance cost before broader adoption. Evidence may invalidate
  current query limits, knowledge scope, default workflow assumptions or a
  proposed feature; Benchmark and presentation repositories must keep clean,
  explicit authority roles.

### Group 4 — Scale and interoperability

**Group status:** G4-C1 through G4-C7 are implemented and verified. Profile 1.0
admission, grouped-home authoring, lifecycle/query/visualization projection,
semantic impact, Profile-aware Enrichment, reviewed migration and final common
mutation admission now form one closed internal enterprise release boundary.
Capacity and real-model qualification remain explicitly deferred.

- **Current → Target:** Replace the type-first Hub layout and one-primary-Domain
  rule with a Domain Capsule layout: every document has one physical home under
  `domains/<slug>/` or `shared/`, while evidenced relations may cross Domains
  and one Repository may contribute to several. Define AgentBase OKF Profile
  1.0, retain base-OKF validity and keep one-Hub trust zones, lexical retrieval
  and the current AWS profile until measured evidence requires expansion.
- **Benefit → Impact:** This gives consumers an honest compatibility boundary
  and makes Domain ownership, browsing and future extraction visible in Git.
  Paths, concept IDs, links, indexes, validation, authoring, query and
  visualization change. Current Crawler knowledge is test data and may be reset
  and re-ingested instead of receiving a compatibility migration; real Hub data
  still requires a reviewed migration and recovery path. Fine-grained ACL,
  federation, automatic invocation, semantic retrieval and broader provider
  expansion remain evidence-gated. Capacity benchmarking is deferred; releases
  keep `qualified_scale: null` and make no 100-repository/25-Domain/10,000-
  document/50,000-relation performance claim until a later explicit campaign.

### Group 5 — Compact knowledge and semantic ingest quality

**Group status:** G5-C1 compact Profile 1.0 layout and dossier authoring are
implemented and verified. Group 5 is closed for the current internal enterprise
release.
G5-C2 semantic quality admission is deferred, inactive and not a release gate;
it may resume only after observed ingest defects justify its workflow cost and
the owner explicitly reopens Product review. Existing Profile 1.0 Hub contents
are qualification data and may be reset and re-ingested; this decision
authorizes no deletion of an owner-declared durable Hub.

- **Current → Target:** The Domain Capsule boundary is correct, but its
  type-relative directories and separate Domain document encourage many thin
  concept files, while Repository activity directories look like repository
  knowledge and contain only `log.md`. Initial Ingest validates evidence and
  structure but can still Finalize a semantically shallow bundle. Keep the
  Domain Capsule while reducing each home to a Domain `index.md`, rich
  Repository dossiers, one type-neutral `knowledge/` collection and
  lifecycle-owned `questions/`; remove Published activity logs. For the current
  release, use existing deterministic validation plus explicit Inspect/Accept
  review. A provider-neutral independent AI review remains optional operator
  practice, not product workflow state or Finalize admission.
- **Benefit → Impact:** Readers get fewer, denser documents and one useful
  Repository view without turning the Hub into a source-tree mirror. Review can
  catch missing boundaries, weak evidence, unusable retrieval and unjustified
  thin concepts while the proposal is still repairable. Profile paths,
  identities, navigation, authoring, CI, query and visualization change. The
  deterministic validator, explicit owner review and Git publication authority
  remain unchanged. No quality-packet, model-review, override or repair state
  is added to the current release.

### Group 6 — Release hardening

**Group status:** G6-C1 Refresh recoverability and G6-C2 skill/tool surface
governance are implemented and verified; Group 6 is closed for the current
internal enterprise release. This group adds no provider, benchmark campaign,
background service, semantic critic or publication lifecycle.

- **G6-C1 — Refresh recoverability. Current → Target:** Normal Refresh can add
  knowledge from changed source, known gaps and one small discovery pass, but a
  semantic omission that created no Question/limitation has no dependable
  recovery route. A bounded source delta may also report omitted paths while
  advancing the Repository observation. Keep one public `agentbase-refresh`
  workflow and one `prepare_hub_okf` tool, with `delta` as the default scope and
  an explicit `coverage` scope for broad bounded re-investigation after a weak
  Init, skill/model upgrade or owner concern. Partial delta or coverage records
  one compact current coverage debt on the Repository. Coverage stops early
  when a non-partial pass adds no knowledge; otherwise the debt permits at most
  three owner-reviewed convergence passes before returning to Delta with any
  remainder visible. Neither the cap nor either scope claims completeness or
  treats absence as deletion evidence.
- **G6-C1 — Benefit → Impact:** Teams can improve a sparse Hub without deleting
  durable knowledge or pretending every Refresh rereads the repository. Delta
  stays cheap; Coverage reuses the exact source and fresh graph cache, then
  reads only evidence needed for broad candidates and known gaps. The existing
  Refresh skill, Prepare input/session, Repository metadata, continuity and
  focused tests change. No new skill, MCP tool, model service or quality packet
  is introduced.
- **G6-C2 — Skill/tool surface governance. Current → Target:** The release
  exposes ten public skills, three internal skills and forty-six MCP tools. The
  audit found no orphan tool or duplicate user outcome worth compatibility and
  lifecycle risk: shared tools are deliberate primitives, while state-changing
  Prepare/Finalize/Inspect/Accept boundaries remain explicit. Freeze this
  release surface and require every advertised tool to be named by at least one
  shipped workflow skill. Any added skill/tool needs explicit Product approval
  or an accepted replacement/consolidation.
- **G6-C2 — Benefit → Impact:** Operators and Agents see fewer overlapping
  choices because ten outcome-level skills remain the entry surface, while tool
  ownership and count drift become release-tested. No runtime route, tool schema
  or installed skill is removed for cosmetic count reduction. Existing trusted
  capability policy remains the extension point for narrower deployments. This
  adds no capability, provider, benchmark or broad rewrite.

Several groups may be under Product review in the same horizon. After the whole
horizon is accepted, only one delivery group is active at a time. Its
Architecture is revalidated against all Product decisions, then each affected
Capability proceeds through contract, implementation and verification before
the next Capability begins. The group closes/releases as one consistent outcome
before delivery starts for the next group.

## Downstream Product Contracts

- [Repository understanding](01-repository-understanding.md)
- [Knowledge model and relations](02-knowledge-model-and-relations.md)
- [Knowledge lifecycle](03-knowledge-lifecycle.md)
- [Trust, conflicts and freshness](04-trust-conflicts-and-freshness.md)
- [Query and context](05-query-and-context.md)
- [Visualization](06-visualization.md)
- [AI SDLC context](07-ai-sdlc-context.md)
