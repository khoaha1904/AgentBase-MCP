# Product

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

## AgentBase CLI boundary

The CLI is the small owner control surface, not a second API for every MCP
workflow. Its product name is `abs`; OKF remains the shared knowledge-format
standard. The public MVP intentionally exposes only:

```text
abs status                         read local AgentBase state
abs hub connect --url ... --branch ...  select/validate one Hub
abs hub sync                       explicitly pull the active Hub
```

Ingest, Refresh, Enrichment, Query, Questions, Accept, Publish, benchmark and
recovery are selected by product skills/MCP or developer verification. The
technical `mcp` launcher and legacy `okf` routes remain hidden compatibility
paths so client registration and existing automation are not broken.

Hub connection asks for one owner-private token through a masked terminal
prompt. A blank prompt reuses the existing shared token; a new token is staged
and committed only after the destination validates. The CLI never creates a
token, logs into a provider or sends a token through chat, arguments, Hub files
or MCP input. Connect and sync remain separate authority boundaries.

A user can investigate source through a disposable local graph, turn bounded
evidence into a reviewed OKF proposal, accept it as Local Draft and later
publish selected pending commits through a pull request. Ordinary Hub query
reads only synchronized Published knowledge.

Installation selects no Hub and Code Graph never requires one. OKF authoring and
Hub query require an explicitly configured remote profile identified by exact
GitHub host, repository and target branch; one shared Hub token remains
owner-private and is reused across those profiles. Each identity keeps
independent Published/Draft state, while one profile is active. Changing the
active Hub never merges or copies knowledge between profiles.

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

## Current flow

```text
source repository
  -> resolve canonical Repository and confirm one primary Domain
  -> build or reuse private Code Graph
  -> agent investigates graph and authorized source evidence
  -> normalize bounded provenance-bearing observations
  -> batch-select concrete OKF guidance and author a sparse proposal
  -> batch-validate, inspect and explicitly accept into Local Draft
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
compatibility. Opening a remote endpoint and OAuth hardening remain opt-in
deployment capabilities; they do not change local tool authority or Hub
publication rules.

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
- **AB-MIGRATION-001** — Migration preflight records exact source state and
  collisions; canonical clones are created only from admitted commits/remotes.
- **AB-MIGRATION-002** — Cutover and cleanup remain independent approvals and
  prove rollback before the next external step.
- **AB-MIGRATION-003** — New local AgentBase data uses one owner-private root,
  `AGENTBASE_HOME` when explicitly set or `~/.agentbase` by default. Its
  `config`, `hubs`, `state`, `cache` and `tmp` children have fixed ownership.
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

## Domain Enrichment boundary

Initial Ingest stays inside one repository and records unresolved evidence as
limitations or governed Questions. The bounded Domain Enrichment workflow can
review several already-published repositories together, answer Questions and
propose cross-repository relationships without interrupting each Ingest.

Some questions may identify external evidence that could resolve repository or
cross-repository resource identity, such as AWS account, region, deployed name
or ARN. Released AWS CLI profiles require explicit bounded read-only evidence
collection, never store credentials or secrets in Hub and preserve source/time
provenance. Additional provider/profile access remains separately specified.
Exact canonical
resource identity can support cross-repository links; same-name guesses cannot.
