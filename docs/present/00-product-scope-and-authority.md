# Product

## Outcome and ownership

AgentBase has two products:

- **AgentBase-MCP** is the local application used by coding agents. It owns Code
  Graph access, evidence investigation, the OKF schema catalog, local knowledge
  workflows and synchronization.
- **AgentBase-Hub** is an ordinary Git repository containing shared Google Open
  Knowledge Format Markdown. It contains no graph engine, MCP runtime or hidden
  operational database.

A user can investigate source through a disposable local graph, turn bounded
evidence into a reviewed OKF proposal, accept it as Local Draft and later
publish selected pending commits through a pull request. Ordinary Hub query
reads only synchronized Published knowledge.

Installation selects no Hub and Code Graph never requires one. OKF authoring and
Hub query require an explicitly configured remote profile identified by exact
GitHub host, repository and target branch; its token remains owner-private.
Each identity keeps independent Published/Draft state, while one profile is
active. Changing the active Hub never merges or copies knowledge between
profiles.

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
- **AB-MIGRATION-001** — Migration preflight records exact source state and
  collisions; canonical clones are created only from admitted commits/remotes.
- **AB-MIGRATION-002** — Cutover and cleanup remain independent approvals and
  prove rollback before the next external step.

## Current non-goals

- A second graph model, shared raw graphs, background watchers or a daemon.
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
