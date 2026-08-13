# Owner Evidence: Local Code Graph and Incremental OKF

- **Captured:** 2026-08-12
- **Status:** Owner direction updated for review; accepted portions are promoted
  separately into living product documents
- **Scope:** Product intent, operating model and review corrections

## Why this record exists

This document preserves the owner's current mental model before implementation
continues. It intentionally separates three things:

1. the intent stated by the owner;
2. review notes that correct or sharpen technical assumptions;
3. candidate product boundaries that still need owner acceptance.

Nothing in this record silently overrides `docs/product/vision.md`,
`docs/ARCHITECTURE.md` or a living requirement under `docs/specs/`.

## Latest owner alignment

This section is the current simple product direction. When older candidate text
below differs from it, use this section for the next review and then promote an
accepted version into the living product documents.

### Official names and responsibilities

The official application name is **AgentBase-MCP**. The official shared OKF
repository name is **AgentBase-Hub**. `agentbase-next` is only the development
repository used while rebuilding AgentBase-MCP; it is not a product name or an
automatic OKF subject. `knowledger-hub` and lowercase legacy directory names
are migration sources, not the target identity.

AgentBase-MCP owns Code Graph access, evidence investigation, the versioned OKF
concept-schema catalog, local Hub workflows, queries and publication. AgentBase-
Hub only stores portable OKF data and Git history.

### The product has two separately useful parts

```text
Part 1: local Code Intelligence
  repository source
    -> Codebase Memory graph
    -> coding-agent navigation and selected evidence

Part 2: local-first shared AgentBase knowledge
  user explicitly requests OKF new or refresh
    -> AgentBase-MCP prepares a local multi-file Google OKF proposal
    -> user reviews and accepts it as a commit on local Hub main
    -> local Hub queries see it immediately
    -> user accumulates and selects pending commits
    -> AgentBase-MCP pushes a branch and opens a PR in AgentBase-Hub
```

Part 1 never creates OKF automatically. Graph refresh, graph queries,
observation collection, local OKF acceptance and remote publication are
different operations.

### Part 1 follows Codebase Memory

Codebase Memory owns the detailed local code graph: indexing, graph structure,
node and edge meaning, and graph queries. AgentBase owns the safe managed
boundary around it, including exact provider version, private local state,
source integrity, process cleanup and the small evidence contract that may be
used by later workflows.

AgentBase must not build a competing canonical graph or copy the provider's
private graph schema into durable knowledge. The graph stays local, disposable
and independently useful to coding agents.

### Part 2 produces Google OKF files

OKF means a Google Open Knowledge Format bundle, not one generated report. The
bundle contains multiple linked Markdown concept files with YAML frontmatter,
stable bundle-relative identities, provenance and an `index.md` entrypoint.

The first result may be incomplete or partly wrong. It is a reviewable proposal,
not automatic truth. Later refreshes, repository evidence and human review help
the bundle converge.

Google OKF deliberately defines no central taxonomy or schema registry. Its
base conformance requires a directory of Markdown concepts, parseable YAML
frontmatter, a non-empty `type`, and valid reserved `index.md`/`log.md` files.
Unknown types and extension fields remain valid.

AgentBase therefore owns a separate versioned concept-schema catalog exposed
through MCP. Each schema describes when a type is useful, its suggested path,
required AgentBase fields, useful body sections and link targets. The agent
selects a subset from repository evidence; it must not create every schema or
empty directory for every repository. Validation layers AgentBase policy on top
of Google conformance without rejecting unknown domain types.

The initial catalog covers repository, component, public interface, software
flow, external dependency, data store, infrastructure resource, business
capability, cross-repository relationship, open question and maintainer
guidance. This is a versioned producer vocabulary, not a claim that Google OKF
standardizes those types.

### AgentBase-Hub is the active local and shared Git repository

Shared OKF lives in one explicitly configured Git repository called
**AgentBase-Hub**. AgentBase-MCP manages an owned local clone whose local `main`
is the active knowledge store. It contains the remote accepted base followed by
ordered, reviewed-but-not-yet-published proposal commits. Business and system
queries use this local view, so accepted knowledge is useful immediately.

AgentBase-MCP does not silently create or rename a GitHub repository, change its
default branch, write directly to remote `main`, merge a PR or delete remote
branches. The Hub repository, remote identity and target branch are configured
explicitly. Writing a reviewed proposal to local `main` is allowed and is not a
remote publication.

### OKF is always a deliberate user action

The intended authorization boundary separates local acceptance from remote
publication:

```text
agentbase okf prepare --mode new|refresh
agentbase okf accept <proposal-id>
agentbase okf pending
agentbase okf submit <proposal-id>...
```

`prepare` investigates the selected repository evidence and renders a complete
proposed OKF file tree. It shows the user a tree/content diff and does not
publish anything. `accept` commits the exact reviewed tree to local Hub `main`.
The commit becomes immediately queryable and is listed as pending publication.

`submit` is a separate explicit action. It selects one or more pending local
proposal commits, validates them against the current remote base, pushes one
publication branch and opens one pull request against remote Hub `main`. It does
not recreate the accepted commits and never merges the pull request. After a
remote merge, synchronization fetches and safely rebases any remaining pending
local commits; conflicts are explicit and no local proposal is silently lost.

### AgentBase-MCP owns concrete OKF concept schemas

The schema catalog discussed below is an OKF authoring catalog exposed by the
MCP, not the JSON schema of an MCP tool and not the private Code Graph schema.
Google OKF supplies the base Markdown/frontmatter format but does not define a
software or AWS taxonomy.

The catalog therefore combines common lifecycle/provenance rules with concrete
types useful to the agent, such as Repository, Service, Server, API Endpoint,
Event, Database Table, Queue, AWS Lambda, AWS SQS Queue, Terraform Module,
Business Flow and Cross-Repository Relationship. Concrete schemas may reuse
common internal rules, but generated OKF should use the most specific type
supported by evidence. Lambda and SQS must not be collapsed into one generic
infrastructure type when their specific fields and relationship are observable.

Schema selection is sparse and evidence-driven. One selected schema may create
many files; an available schema may create none. AgentBase-MCP must not create
one empty file or directory per catalog entry.

### `new` and `refresh` have different intent

- `new` proposes knowledge for a repository or subject that does not yet have
  an AgentBase-owned representation in the Hub. It creates new linked concepts
  and updates navigation needed to reach them.
- `refresh` reads the accepted Hub state plus new authorized evidence and
  proposes an incremental diff. It may update AgentBase-owned drafts or create
  replacement/superseding concepts, but it must not silently erase or overwrite
  reviewed or ambiguously owned knowledge.

Deletion, supersession and conflicts must be visible in the local diff and the
pull request. Missing evidence in a later run is not proof that existing
knowledge should disappear.

### Review and later enrichment remain separate

GitHub PR review is the first shared review surface. Later AgentBase capabilities
may add hub-wide reconciliation, questions, cross-repository relationships and
explicitly authorized cloud enrichment. Those later workflows must preserve
the original evidence, PR/review provenance and human guidance.

## Owner intent

AgentBase is expected to contain two primary product parts. More internal
capabilities may be introduced when they express real ownership boundaries.

### Part 1: build a code graph

The first part builds a local graph of code structure and relationships,
including functions, variables, imports and related program elements. Its
primary consumer is a coding agent that needs to understand the relevant area
of a codebase quickly without repeatedly reading the entire repository.

The intended operating characteristics are:

- no paid AI inference in the mandatory path, or as close to that as practical;
- parser, index and graph libraries perform most of the work;
- indexing and refresh are fast enough to follow normal source changes;
- refresh should not interrupt the user with repeated approval prompts;
- the graph is machine-local, disposable and normally not shared;
- independently built graphs should be reliable enough to feed the same OKF
  workflow;
- the graph is the technical foundation from which higher-level OKF evidence
  can be selected.

Codebase Memory is the selected graph authority for this experience: its
structural backend provides the graph and the coding agent uses that graph for
navigation and explanation. AgentBase manages the boundary; it does not create
a parallel graph model.

### Part 2: build shared multi-file OKF Markdown knowledge

The second part creates synthesized, shareable Google OKF knowledge in the
configured AgentBase Hub GitHub repository. The intended consumers include:

- people and agents working across a team;
- transformation or product work that needs feature and user-story context;
- engineering workflows such as specification-driven development;
- future agents that should start from durable team context rather than infer
  everything again.

This part is expected to use AI substantially. Instead of asking an agent to
read the full repository blindly, it should use selected graph evidence as a
compact navigation and investigation surface, then combine it with comments,
identifiers, file structure, documentation, README files and, when useful,
commit history.

The first OKF build for a repository is allowed to be incomplete. Later
repositories or later refreshes may reveal additional facts and relationships.
Knowledge therefore accumulates incrementally: a later scan adds support,
conflict or uncertainty and does not erase an earlier claim merely because that
claim was not observed again.

### Cross-repository relationships

The most difficult later outcome is identifying relationships across
repositories. The primary initial domain is AWS infrastructure described by
Terraform or Terragrunt. Examples include:

- a Lambda in repository A sending to an SQS queue consumed by a Lambda in
  repository B;
- a frontend calling a server endpoint;
- multiple technical components contributing to a business feature such as
  sign-in or purchasing.

Repository A may be built before repository B exists in the hub. The system
must tolerate the relationship being absent at first, discover it during the
second ingest, and attach it to both sides during reconciliation or a later
refresh.

### Separate review and enrichment phase

Uncertain claims should remain visible rather than being silently promoted to
truth. An initial OKF build may ask only small, basic questions needed to form a
useful draft. Deeper ambiguity is queued for a later hub-wide workflow.

In that workflow, a user may:

- retrieve unreviewed claims and unanswered questions through an app or MCP;
- answer a question once for the shared hub rather than once per repository;
- provide additional evidence;
- explicitly authorize narrowly scoped, read-only AWS CLI investigation when
  deployed resource identity cannot be established from source alone.

### Owner correction: prefer useful drafts over strict initial correctness

The initial OKF build does not need to prove that every synthesized statement
is correct before producing a useful result. A partially wrong or incomplete
draft is acceptable because review, enrichment and later rebuilds are the
mechanisms that improve it.

During review, a user may ignore an uncertain or currently unhelpful item and
return to it later. A user may also attach guidance that future rebuilds should
remember. Since an OKF rebuild reads the existing OKF, retained knowledge,
review decisions and user guidance should influence the next proposal instead
of forcing the process to start from zero.

## Review: what is strong in this direction

The fundamental separation is sound:

```text
local, cheap, disposable detail
  -> selected evidence
  -> AI-assisted repository synthesis
  -> shared, governed knowledge
  -> later hub-wide reconciliation and enrichment
```

It gives Part 1 an independent coding-agent value, prevents raw parser detail
from becoming a permanent team contract, and accepts that business knowledge
is provisional and cumulative. The explicit separation between initial build
and later uncertainty resolution is especially important: exhaustive questions
would otherwise make the first useful result too slow and brittle.

The owner's correction strengthens this model: semantic correctness is a
convergence goal, not a prerequisite for emitting the first OKF draft. Initial
generation needs only enough structural validity to remain reviewable and
rebuildable.

## Review corrections and sharper constraints

### 1. Near-zero cost means zero mandatory model calls, not zero resources

Local indexing still consumes CPU, memory, disk and filesystem I/O. The product
target should be zero paid model calls in the mandatory graph path, bounded
resource use and a measured incremental latency budget. AI may help an agent
choose or interpret a query, but graph correctness must not depend on AI.

### 2. Automatic refresh can be quiet, but must not be invisible

The recommended rule is:

> After a user explicitly enables or initializes local Code Intelligence,
> bounded local incremental refresh may run without asking again for each
> source change. Its status, resource use, failures and disable control remain
> observable.

Installation, configuration mutation, daemon activation outside the accepted
runtime model, network access, credential access and expensive full rebuilds
are separate actions. They must not be hidden inside the meaning of “refresh.”

Codebase Memory v0.10.1 supports this distinction. `auto_index` must be enabled
for automatic first indexing; watcher registration is controlled separately by
`auto_watch`, whose default is true. Daemon-backed sessions start a shared
coordination daemon, while one-shot CLI calls do not start watchers or leave a
standing process. AgentBase should choose and expose its own lifecycle policy
rather than inherit these behaviors accidentally.

### 3. A code graph is high-confidence evidence, not perfect truth

Parser-based output is generally more reproducible than AI inference, but it
can still miss or misresolve dynamic dispatch, reflection, generated code,
macros, runtime configuration, unsupported language constructs and environment
dependent resolution. Even the reference engine publishes different support
tiers across languages.

The cross-machine requirement should therefore be compatibility, not identical
raw databases. Given the same repository identity and source revision,
AgentBase should pin or record:

- provider and adapter versions;
- normalization schema version;
- relevant configuration and ignore rules;
- collection limitations.

Two machines may then produce non-identical private graphs while still
producing compatible normalized observations. Those observations, not the raw
graph, are the stable input to OKF.

Codebase Memory v0.10.1 also offers an optional repository-committed compressed
graph artifact. That upstream option does not require AgentBase to adopt graph
sharing. The current owner intent remains local rebuilds and shared OKF; any raw
graph distribution would require a separate product and security decision.

### 4. Markdown is a review surface; it should not define all semantics

Markdown is a good shared and reviewable representation, especially through
Git. It still needs a machine-stable model beneath or within it: stable IDs,
schema versions, provenance, confidence, lifecycle state and deterministic
rendering. Otherwise normal prose edits, file moves and Git merges can make
incremental reconciliation unreliable.

The storage decision remains open. GitHub can be a transport and review system,
but branch policy, concurrent proposals, conflict handling and accepted-state
ownership must be designed explicitly.

### 5. Cross-repository links need resource identity and evidence levels

“Same account and region” is not a universal linking rule. AWS identity varies
by service, and a matching display name is not enough. Where applicable, a
candidate identity should include partition, account, region, service and
resource identifier or ARN.

Terraform source alone may not reveal the deployed identity because values can
come from workspaces, variables, provider aliases, remote state, data sources
or deployment-time configuration. Cross-repository links should preserve an
evidence level such as:

- **configuration-inferred:** inferred from source expressions and defaults;
- **plan-resolved:** resolved from an authorized Terraform/Terragrunt plan;
- **deployment-confirmed:** confirmed from state, runtime traces or a scoped
  cloud query;
- **owner-confirmed:** confirmed by a human with answer provenance.

Cloud access belongs only to explicit enrichment. It should be read-only by
default, scoped to named accounts, regions and services, and unnecessary for
the basic local graph.

### 6. Business-feature inference needs traceable claims

Names, comments and file layout can suggest concepts such as sign-in or
purchasing, but they do not prove them. API routes, infrastructure wiring,
schemas, tests, runtime traces and owner answers may strengthen those claims.
Commit history is useful historical evidence but must not be treated as proof
of current behavior.

For the MVP, important claims such as business flows, external dependencies and
future cross-repository links should either identify useful source evidence or
be visibly labeled as inference/open questions. Per-claim confidence,
limitations and exhaustive provenance are hardening goals, not prerequisites
for emitting a first draft. The user should still be able to inspect why an
important claim exists before accepting it.

### 7. Uncertainty is multi-dimensional

A single `unreviewed` flag will eventually be too weak. A later data model may
need to keep these concerns distinct:

- epistemic basis: observed, inferred, confirmed or conflicting;
- review decision: unreviewed, accepted or rejected;
- lifecycle: current, stale, detached or superseded.

A queued question should point to stable claim IDs, describe the missing
evidence, state its hub-wide scope and preserve the provenance of any answer.
This taxonomy is explicitly deferred beyond the MVP. The first OKF loop needs
only replaceable generated content and protected human guidance.

### 8. Reusing the existing OKF needs an anti-feedback-loop boundary

Reading the previous OKF during rebuild is desirable, but previous AI prose is
not independent evidence. If a model-generated statement is repeatedly copied,
its confidence must not increase merely because it appeared in earlier OKF
versions.

The rebuild context should distinguish at least:

- accepted or owner-confirmed knowledge;
- unresolved draft claims;
- source-backed observations from the new revision;
- review directives and owner guidance;
- ignored items and their revisit condition.

An ignore action should normally mean “do not block this build and do not keep
asking now,” rather than “the claim is false” or “delete its history.” A durable
review directive can express behavior such as “do not propose this again until
new source evidence appears.” This directive may be rendered as a readable OKF
section, but should carry a stable identity and provenance so it cannot be
confused with repository evidence.

Only a small structural gate is needed before draft output: the document is
parseable, stable identities are not duplicated, provenance fields are not
malformed and accepted knowledge is not destructively overwritten. Confidence,
completeness and business interpretation improve later through review and
enrichment.

## Candidate capability boundaries

The owner's two-part product model can remain the product story while the
implementation uses four clearer capability areas:

1. **Local Code Intelligence** builds and queries the disposable graph.
2. **Repository OKF Synthesis** creates evidence-bound repository proposals.
3. **Hub Reconciliation** accumulates evidence and discovers cross-repository
   relationships without destructive replacement.
4. **Review and Enrichment** resolves questions using people, plans, state,
   runtime evidence or explicitly authorized providers.

This split prevents the first repository build from owning global truth and
prevents credentialed investigation from becoming a hidden dependency of local
coding assistance.

## Candidate end-to-end flow

```text
repository source at revision R
  -> local provider graph (private, rebuildable)
  -> normalized observations (versioned, provenance-bearing)
  -> explicit OKF prepare: new or refresh
  -> local multi-file Google OKF proposal and reviewed diff
  -> explicit OKF submit: proposal branch, push and Hub pull request
  -> accepted Hub state after external review/merge
  -> cross-repository reconciliation
  -> review/enrichment questions
  -> accepted shared OKF knowledge
```

Graph refresh and OKF refresh are different operations. A graph can remain
continuously fresh; AI-heavy synthesis and hub reconciliation can run on a
deliberate schedule or user request.

## Decisions now settled

- Detailed code-graph behavior follows Codebase Memory.
- AgentBase owns the safe provider boundary and selected provenance-bearing
  evidence, not a second canonical graph.
- OKF is a Google OKF bundle made of multiple linked Markdown files.
- Shared knowledge lives in an explicitly configured GitHub repository named
  AgentBase Hub, cloned into AgentBase-owned local state before proposal work.
- OKF generation is never automatic; it starts only from an explicit user
  action.
- `new` and `refresh` are explicit proposal intents.
- Preparation and publication are separate: review local diff first, then
  explicitly submit one branch and pull request.
- AgentBase never writes directly to `main` or merges the pull request.
- Refresh is cumulative and non-destructive toward reviewed or ambiguously
  owned knowledge.
- MCP exposes a versioned AgentBase schema catalog. The authoring agent selects
  only evidence-relevant schemas and validates concepts against both AgentBase
  policy and Google OKF base conformance.
- AgentBase schemas are extensible producer conventions. Unknown Google OKF
  types remain consumable and are not rejected merely for being unregistered.

## Decisions still open for the implementation specification

- The smallest useful first Hub concept set beyond the required OKF index and
  provenance resources.
- Exact Hub repository configuration UX and supported GitHub authentication
  source, without AgentBase storing new long-lived credentials.
- Branch naming, PR title/body contract, concurrent proposal handling and safe
  recovery when push succeeds but PR creation fails.
- Whether the local Hub checkout is owned behind MCP or another internal
  capability; this must not change the explicit user workflow.
- The first later cross-repository or AWS/Terraform relationship family.

The next step is owner review of this updated direction. After acceptance,
promote it into product vision, architecture and living requirements, then
create a Full Feature specification for the Hub proposal and PR lifecycle.

## External evidence consulted

- Codebase Memory v0.10.1 README:
  <https://github.com/DeusData/codebase-memory-mcp/blob/v0.10.1/README.md>
- Codebase Memory v0.10.1 security policy:
  <https://github.com/DeusData/codebase-memory-mcp/blob/v0.10.1/SECURITY.md>
- Codebase Memory v0.10.1 release:
  <https://github.com/DeusData/codebase-memory-mcp/releases/tag/v0.10.1>

Observed upstream facts are evidence about the reference engine, not accepted
AgentBase product requirements.
