# AgentBase Product Vision

## Official products

AgentBase has two official products with distinct responsibilities:

- **AgentBase-MCP** is the local MCP application used by coding agents. It owns
  the managed Code Intelligence boundary, OKF schema catalog, local knowledge
  workflows and synchronization with the configured Hub.
- **AgentBase-Hub** is a Git repository containing shared Google Open Knowledge
  Format data. It has no code-graph responsibility and is not the application.

Names such as `agentbase-next`, `agentbase-mcp` and `knowledger-hub` are legacy
or development repository names. They are not product identities and MUST NOT
be emitted as OKF subjects unless a user explicitly asks to document a source
repository under that exact name.

## User outcome

A user working in a source repository can build a detailed local code graph,
use a coding agent to investigate that graph and related source evidence, and
turn useful findings into local OKF knowledge. That knowledge is immediately
queryable from the user's local AgentBase-Hub. The user may accumulate several
local proposals from several repositories before publishing selected proposals
through one reviewed GitHub pull request for other people to share.

## Part 1: local Code Intelligence

AgentBase-MCP exposes Code Intelligence for code questions. It uses Codebase
Memory as the detailed graph authority instead of creating a competing graph.
The graph contains code-level structure and relationships such as symbols,
imports and call paths.

Desired properties:

- local-first and useful without Hub or cloud credentials;
- deterministic where practical and low in model usage;
- fast to refresh after source changes;
- detailed enough for coding navigation;
- safe to discard and rebuild;
- private to the machine and repository;
- not required to be byte-identical across machines;
- accessed through an AgentBase-owned contract even if the graph engine changes.

Code questions primarily query the current repository graph. Raw graph records,
provider-private identifiers and graph databases MUST NOT be stored in
AgentBase-Hub.

## The bridge: agent investigation and observations

Creating OKF is a separate, explicit user action. A coding agent uses the graph
as a navigation surface and may combine it with authorized evidence such as
source snippets, manifests, Terraform or Terragrunt, package metadata,
documentation, comments and existing local Hub knowledge.

Only bounded, provenance-bearing observations may support generated OKF.
Observation records identify source revision, source spans, provider identity,
limitations and collection context. The graph helps locate evidence; it does
not decide the durable knowledge model by itself.

## Part 2: local-first governed OKF knowledge

AgentBase-Hub is the user's active OKF knowledge store, not merely a remote
publication target. AgentBase-MCP keeps an owned local clone with a local
`main`. A reviewed OKF proposal is committed to that local `main`, so business,
system and domain queries can use it immediately even before anything is pushed
or merged remotely.

The ordinary lifecycle is:

```text
source repository
  -> build or refresh local Code Graph
  -> agent investigates graph and related evidence
  -> agent selects applicable OKF concept schemas
  -> agent authors and validates an OKF proposal
  -> user accepts it as one local Hub commit
  -> local Hub queries see the accepted pending knowledge immediately
  -> repeat for more repositories or subjects
  -> user lists and selects pending proposal commits
  -> AgentBase-MCP pushes one publication branch and opens one PR
  -> people review and merge the PR into remote main
  -> AgentBase-MCP fetches and safely rebases remaining local commits
```

Local acceptance and remote publication are separate authorizations. Creating a
local proposal MUST NOT push or open a PR. Publishing MUST NOT merge, approve or
write directly to remote `main`.

## Local and remote state

The Hub has two simultaneous views:

- **Remote accepted base**: knowledge already shared through the configured
  AgentBase-Hub remote `main`.
- **Local active knowledge**: the remote base plus ordered, accepted-but-pending
  proposal commits on local `main`.

AgentBase-MCP queries local active knowledge. It can list pending proposals,
show each proposal's source subject and diff, and publish one or more selected
commits together. After a PR is merged, synchronization fetches the exact remote
state and rebases any still-pending local proposals. Conflict resolution is
explicit; synchronization MUST NOT reset, drop or silently overwrite local
knowledge.

## Google OKF and the AgentBase schema catalog

Google OKF defines the portable representation: linked Markdown concept files,
YAML frontmatter, `type`, provenance and reserved `index.md` or `log.md` files.
It deliberately does not define a universal software or cloud taxonomy.

AgentBase-MCP therefore owns a versioned **OKF concept schema catalog**. These
are authoring and validation schemas for Hub knowledge, not MCP tool input
schemas and not Codebase Memory graph schemas.

The catalog has two layers:

1. Common AgentBase fields and lifecycle rules, including title, description,
   status, generation identity, sources, limitations, stable identity and
   relationships.
2. Concrete concept schemas that tell an agent what evidence and fields are
   useful for a particular kind of knowledge, such as Repository, Service,
   Server, API Endpoint, Event, Database Table, Queue, AWS Lambda, AWS SQS
   Queue, Terraform Module, Business Capability, Business Flow,
   Cross-Repository Relationship, Open Question or Maintainer Guidance.

Concrete schemas may share internal rules, but emitted concepts use the most
useful specific type supported by evidence. For example, a Lambda and an SQS
queue are not flattened into a generic infrastructure concept when their
specific identities and relationships are observable.

Schema selection is evidence-driven and sparse:

- the agent considers graph results and other authorized evidence;
- it selects only schemas relevant to observed concepts;
- a schema may produce zero, one or many concept files;
- a repository does not receive empty files or directories for every catalog
  entry;
- missing evidence results in an explicit limitation or question, not an
  invented field;
- unknown valid Google OKF types remain readable and preservable.

## Hub organization

AgentBase-Hub is one OKF bundle. Directory layout supports progressive
disclosure; links and stable concept identities carry the knowledge graph.

A repository-oriented concept has one canonical file under its source subject,
for example:

```text
index.md
repositories/
  orders/
    index.md
    repository.md
    services/
    interfaces/
    infrastructure/
    flows/
    questions/
relationships/
capabilities/
```

The exact folders are created only when concepts exist. Hub-wide indexes may
link to canonical concepts by repository, infrastructure kind, capability or
relationship without duplicating their content. The source repository slug is
derived from configured source identity or explicit user naming; it is never
derived from AgentBase-MCP's temporary development directory by accident.

## Draft-first convergence

An OKF build is a reviewable proposal, not automatic truth. The first build may
be incomplete or partly wrong. Generated concepts remain drafts, disclose
limitations and are not marked human-verified automatically.

Later repositories, refreshes and human guidance may add support, expose a
conflict, supersede a concept or answer a question. Missing evidence in a later
run is not proof of deletion. Human-authored, human-verified and ambiguously
owned bytes are protected unless an explicit governed operation authorizes a
change.

## Query routing

- Questions about code structure or implementation primarily query the current
  repository's Code Graph.
- Questions about business behavior, system context, cross-repository flows,
  infrastructure relationships or accumulated team knowledge primarily query
  the local AgentBase-Hub.
- A response may use both when the question crosses those boundaries, while
  preserving the provenance and limitations of each source.

## Product boundaries

AgentBase-MCP MUST NOT silently create or rename a GitHub repository, mutate
remote `main`, merge a PR, publish raw graphs, or discard pending local commits.
Remote repository identity, credentials and branch policy remain explicit
operator configuration.

AgentBase-Hub MUST remain consumable as ordinary Google OKF Markdown through
Git. It is not coupled to one graph engine, model provider or proprietary
database.

## Primary success measures

- A coding agent retrieves relevant code context without broadly rereading the
  repository.
- A user can accept useful OKF locally and query it before remote publication.
- Pending proposals from multiple repositories remain individually inspectable
  and can be selected for one publication PR.
- Re-ingest adds support, conflict or review state without silently destroying
  accepted knowledge.
- Another user can pull merged Hub knowledge and query the same portable OKF
  concepts without receiving another machine's raw code graph.

## Non-goals for the current correction

- Automatically merging or approving GitHub pull requests.
- Publishing every local proposal immediately.
- Requiring every repository to use every schema.
- Defining all future cloud, business and domain schemas in the first catalog
  revision.
- Treating filesystem placement as the only relationship model.
- Rewriting already shared Git history merely to rename development artifacts.
