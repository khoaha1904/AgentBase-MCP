# 00 — Scope and authority

> Status: Product identity, authority, MVP scope and migration boundaries are
> accepted and implemented unless an item is explicitly marked deferred.

## Read selectively

This page is not required startup context. Use the relevant section below;
follow its linked owner rather than loading unrelated sections.

- [Approved product simplification horizon](#approved-product-simplification-horizon)
- [Outcome and ownership](#outcome-and-ownership)
- [Durable team knowledge boundary](#durable-team-knowledge-boundary)
- [Default deployment trust](#default-deployment-trust)
- [AgentBase CLI boundary](#agentbase-cli-boundary)
- [Accepted release and operating model](#accepted-release-and-operating-model)
- [Current flow](#current-flow)
- [Knowledge model](#knowledge-model)
- [MCP protocol direction](#mcp-protocol-direction)
- [Governance and authority](#governance-and-authority)
- [Stable product requirements](#stable-product-requirements)
- [Current non-goals](#current-non-goals)
- [Accepted current limits](#accepted-current-limits)
- [Accepted product design groups](#accepted-product-design-groups)
- [Downstream Product Contracts](#downstream-product-contracts)

## Approved product simplification horizon

Groups 7–9 are implemented and verified for the current internal release.
The current experience is:

```text
Add / update knowledge → private preparation → validate + preview → Publish
Use knowledge → standalone answer or workflow context → optional scoped repair
```

Publish defaults to one complete direct remote commit where Hub policy and
permissions allow; PR publication is an optional per-Hub policy. Private
resumable preparation remains, but user-managed Local Draft acceptance is no
longer required. One Publish confirmation approves sharing the exact prepared
change. It neither certifies semantic completeness nor authorizes future
unattended updates.

The owning decisions are [Knowledge lifecycle](03-knowledge-lifecycle.md#accepted-simplification-target--group-7)
and [Query and context](05-query-and-context.md#accepted-unified-use-target--group-8).
Trusted-enterprise access, source provenance, deterministic validation,
Published-only query, explicit provider scope and recoverable Git history remain.
Do not replace Git/Markdown, the graph engine, schema/layout or visualization
to deliver this horizon. Automatic publication, continuous whole-Hub refresh,
mandatory AI review and broad new provider integration are not approved work.

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
Enrichment and explicit policy-bound Publish.

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
standard. The baseline public MVP exposes:

```text
abs status                         read local AgentBase state
abs hub connect --url ... --branch ...  select/validate one Hub
abs hub sync                       explicitly pull the active Hub
```

Group 7 adds `abs hub policy [--mode direct|pr]` for visible per-Hub policy
and `abs hub publish --proposal <id> --digest <digest> --mode direct` for
explicit exact-content publication. CLI also accepts `--mode pr`, and MCP uses
the same policy-bound Publish. Accept/pending/submit public actions are removed.
Production legacy helpers are retired; candidate cleanup and retry recovery
are implemented without migrating old test work.

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

Ingest, Refresh, Enrichment, Query, Questions, Publish, benchmark and
recovery are selected by product skills/MCP or developer verification. The
technical `mcp` launcher and legacy `okf` routes remain hidden compatibility
paths so client registration and existing automation are not broken.

Hub connection identifies and validates the exact destination profile. Its
credential may come from the enterprise or local credential mechanism already
available to the operator and may be reused where that provider policy allows.
AgentBase never writes a secret into Hub knowledge or accepts one through model
content. Connect and sync remain separate workflow boundaries.

A user can investigate source through a disposable local graph, turn bounded
evidence into a private OKF proposal, review its material changes and explicitly
Publish through the configured Direct/PR policy. Ordinary Hub query
reads only synchronized Published knowledge.

Installation selects no Hub and Code Graph never requires one. OKF authoring and
Hub query require an explicitly configured remote profile identified by exact
GitHub host, repository and target branch. Each profile keeps independent
Published/private-proposal state while one profile is active; credential resolution remains
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
  -> explicit policy-bound Publish of one complete reviewed proposal
  -> direct commit + local recognition, or external PR merge + explicit sync
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
Terraform/Terragrunt and bounded SAM/CloudFormation are supported source tools;
exact scope and unresolved-expression limits live in schema-selection contracts.
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

- There is no backup or shared private preparation; unpublished work remains local and
  can be lost with the owning machine.
- Refresh reads one repository and never treats absence as deletion evidence.
- Batch Refresh and mixed Init/Refresh are deferred.
- Reconciliation cannot guarantee a relationship when sources lack strong
  shared identity.
- AgentBase performs no remote auto-clone, global provider-account/region scan
  or automatic semantic/vector fallback.
- Hub access reads all Published knowledge; there is no Domain-, concept- or
  field-level ACL.
- Structured infrastructure evidence supports Terraform/Terragrunt and bounded
  SAM/CloudFormation. General template evaluation and additional provider
  profiles remain deferred.
- Ordinary Hub query is Published-only. Private proposals exist for review.
- The Published Hub graph and every search index are rebuildable read-only
  projections, not additional sources of truth.
- Real model/provider qualification is opt-in evidence and is not required by
  the canonical offline repository gate.

There are no unresolved product decisions hidden in these limits. Expanding a
limit requires an explicit Product/Architecture/Capability Contract delta.

## Accepted product design groups

Groups 1–9 are closed for the current internal release. The table records current
outcomes, not an implementation backlog; Git retains the replaced designs.

| Group | Current outcome | Contract owner |
|---|---|---|
| 1 — Authority and trust | Trusted enterprise; readable per-workflow source scope; shared enterprise credential | [Trust](04-trust-conflicts-and-freshness.md) |
| 2 — Release and operations | Immutable Linux x64 artifact, transactional lifecycle, profile locks and CI qualification | [Release](../capabilities/12-version-scope/10-release-artifact-requirements.md) |
| 3 — Usefulness | Freshness and semantic-impact preview; real-model/longitudinal proof deferred | [AI SDLC](07-ai-sdlc-context.md) |
| 4 — Interoperability | Profile 1.0, Domain homes, cross-home participation and reviewed migration; scale unqualified | [Knowledge model](02-knowledge-model-and-relations.md) |
| 5 — Compact knowledge | Rich Repository dossiers, type-neutral knowledge and no activity logs; AI admission deferred | [Understanding](01-repository-understanding.md) |
| 6 — Hardening | Delta/Coverage recovery, visible debt and governed skill/tool surface | [Refresh](../capabilities/09-ingest-and-refresh/02-refresh-and-change-detection.md) |
| 7 — Publish | Private preparation, material preview, explicit Direct/PR Publish and recovery; no Accept | [Lifecycle](03-knowledge-lifecycle.md) |
| 8 — Use and repair | Unified read entry; approved scoped repair; host workflow keeps ownership | [Query](05-query-and-context.md) |
| 9 — Add and Update | Existing Ingest/Refresh commands expose two user intentions; provider reads require separate approval | [Lifecycle](03-knowledge-lifecycle.md) |

### Horizon close and presentation

No new feature, mandatory AI critic or benchmark campaign is required to close
this implementation. Markdown and standalone presentation HTML describe the
delivered workflow. Final source publication still requires the clean exact-tag
CI/artifact gate, not merely a local test pass.

A separately approved real-use session should use one bounded Domain to check
whether agents retrieve useful context, expose important omissions and repair
knowledge without excessive effort. Different-model routing and semantic quality
are unqualified until exercised explicitly. No model run starts automatically.
Linux x64 pilot readiness is not a claim of public/multitenant security, macOS
qualification, general scale, completeness or measured ROI.

## Downstream Product Contracts

- [Repository understanding](01-repository-understanding.md)
- [Knowledge model and relations](02-knowledge-model-and-relations.md)
- [Knowledge lifecycle](03-knowledge-lifecycle.md)
- [Trust, conflicts and freshness](04-trust-conflicts-and-freshness.md)
- [Query and context](05-query-and-context.md)
- [Visualization](06-visualization.md)
- [AI SDLC context](07-ai-sdlc-context.md)
