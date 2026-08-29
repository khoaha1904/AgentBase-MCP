# 01 — How MCP reads a repository

> Status: Local Code Graph, Capability 046 broad discovery/selective OKF and
> Capability 051 reliability hardening are implemented; released-skill
> qualification remains pending.

## Short answer

MCP uses a Code Graph to build a repository map, then reads only the exact code
and documentation needed as evidence.

```text
User calls an ingest/refresh skill
             ↓
Preflight binds an exact repository/source snapshot
             ↓
Discover builds or reuses the graph, then MCP runs a fixed baseline
             ↓
Code Graph finds files, functions, dependencies and call paths
             ↓
MCP groups signals into bounded discovery groups
             ↓
Agent investigates important groups and reads source as evidence
```

## Why use a Code Graph?

A repository may contain thousands of files. Sending all of them to AI at once
is expensive and makes it harder to focus on what matters.

The Code Graph works like a map or index. It shows:

- which files and components the repository contains;
- which functions or modules call one another;
- which components depend on which others; and
- where a processing flow may travel.

The agent uses this map to narrow the scope. For example, when it needs to find
performance data collection, the graph may lead it to a Lambda, its input event
and the result store. The agent then reads exactly those sources to confirm the
finding.

## The map is not the final evidence

- **Code Graph** helps find the right place.
- **Code, Terraform, configuration and original documentation** provide evidence.
- **The agent** investigates and interprets evidence according to the skill.
- **MCP** provides bounded tools for reading, searching and checking.

MCP does not copy the entire Code Graph into the Hub. The graph is private,
temporary and rebuildable. Only useful, sourced and reviewed knowledge is
proposed for the Hub.

The Code Graph is used only for a repository that is local or inside the
workspace. MCP does not automatically clone a remote repository to build a
graph during a query.

Hub authoring is an explicit-authority exception: Preflight uses the active
Hub's token to fetch the exact remote default-branch commit from the same
GitHub/GHE host into an AgentBase-private cache. This is not a query-time clone
and does not change the user's checkout, refs or credentials.

## When a workspace contains multiple repositories

Each Git repository still has its own Code Graph. A parent directory is only a
scope that helps the agent choose a repository; it does not become one large graph.

- If the open directory is a Git monorepo, the whole Git root uses one graph;
  child projects are scopes/paths inside that graph.
- If the open directory contains several independent Git repositories, the
  agent chooses the requested repository, the repository containing the current
  working directory, or a unique known local Hub mapping.
- If several repositories are equally plausible, the agent asks instead of guessing.
- Overview/domain questions use the Published Hub first and do not build a graph.
- Questions requiring source from multiple repositories read each repository
  sequentially; they do not merge graphs or scan the entire workspace.

The exception is an explicit `agentbase-scan` call: that workflow only finds Git
roots in the selected workspace to build a bounded inventory. It does not build
a Code Graph or read deep source.

## How deep does MCP read?

During Initial Ingest/Batch Init, after indexing the exact Preflight source, MCP
automatically runs a fixed baseline containing index diagnostics, architecture
aspects and a safe file census; it does not depend on the agent remembering to
call every tool. The index preserves graph data and adds a small Seed summary so
the agent can see the group IDs to process. Discover broadly inventories
high-signal groups: root README, runtime/package manifest, entrypoint,
interface/route/event/trigger, integration/data/channel, Terraform/Terragrunt,
deployment and CI. It does not crawl all source or `docs/`.

The agent opens deeply only the files identified as important by the graph or
census; generated/vendor/build and secret-like paths are excluded, while a
lockfile is only a dependency hint. Every important group must be processed or
recorded as a limitation, but it need not become a concept.

Before a source line becomes agent context, MCP filters inline sensitive content
such as tokens, passwords or credential-bearing URLs. A path denylist and
content redaction are separate layers: a file with an allowed name still must
not expose a raw secret in the Discovery Seed.

Ordinary queries and normal change-first Refresh do not run this baseline or
create a Discovery Seed. They still use the graph/source within their own bounds.

## When is a graph created?

Graphs are created or reused lazily: only when a workflow truly needs exact
source reading for the selected repository. Opening a parent directory or
querying the Hub alone does not prebuild a graph.

In Ingest, the graph is created or reused during Discover after Preflight selects
the exact source. If the current checkout is clean and matches the remote default
commit, MCP uses it; if it is a feature/dirty/different commit, MCP uses a
temporary detached worktree. In Refresh, a cache is reused only when repository
identity, source revision, engine and namespace match; otherwise it re-indexes.
The process closes after the run while the local cache may remain. There is no
watcher, daemon or background indexing by default.

## One-sentence explanation

> AgentBase-MCP does not blindly read the entire project. It uses the Code Graph
> as a map to find what matters, then returns to the original code and documents
> to verify it before creating Hub knowledge.
