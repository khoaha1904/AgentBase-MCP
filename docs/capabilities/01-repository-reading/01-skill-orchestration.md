# 01.01 — Skill orchestration

> Status: Baseline orchestration and Capability 046 Init-stage receipt handoff
> are implemented; released-skill qualification remains pending.

## Decision

`agentbase-query`, Ingest and Refresh are the public workflow entry points. The
Agent runs the skill and decides the next investigation step; MCP supplies
bounded tools and data and does not interpret the repository or select concepts
automatically.

```text
Public workflow skill
        ↓
Agent coordinates each step
        ↓
MCP: graph, search, trace, snippet and evidence
        ↓
Agent applies concept/schema rules
```

## Responsibilities

### Skill

- use the Published Hub first for overview/Domain questions;
- call Code Graph only when the question genuinely needs local source;
- define step order and transition conditions;
- require Domain confirmation before authoring;
- invoke the Code Graph workflow when structure or implementation evidence is
  needed;
- pass bounded evidence into concept discovery and OKF authoring;
- stop before Accept/Publish without the corresponding authorization.

### Agent

- choose the next graph question from the latest result;
- distinguish signals, candidates and evidence;
- return to exact source before creating a knowledge claim;
- retain a limitation or Question when evidence is insufficient.

### MCP

- bind one permitted repository root;
- manage provider lifecycle and freshness;
- return bounded graph results, source snippets, validation and Hub operations;
- create a compact machine Discovery Seed and validate coverage/disposition,
  without interpreting semantic meaning for the Agent;
- never decide Domain, concept, schema or truth automatically.

## Select a repository in the workspace

A parent directory containing multiple Git repositories is only a routing
scope. The skill selects a repository in this simple order:

1. a path or repository explicitly named by the user;
2. the Git root containing the current working directory;
3. the only repository identified by the Hub for which the host knows a
   checkout exists in the user-opened workspace;
4. if multiple choices remain, ask the user.

The Agent does not scan arbitrary machine directories. A question needing
source from multiple repositories is processed sequentially, closing the
current session before binding the next repository. It does not create a
combined graph.

## Reuse current skills

The public skill coordinates two existing internal workflows rather than
copying them:

- `use-codebase-memory` for map, search, trace and source retrieval;
- `agentbase-okf` for authoring, validation and the review boundary.

Public `agentbase-ingest` remains the only entry point. It starts Preflight,
Discover, Investigate, Author and Validate without adding a user-written prompt
or public scanner skill/tool. Only Domain, repository identity or
scope/authority ambiguity is blocking; other uncertainty becomes a
Question/limitation.

Detailed rules retain one owner. The umbrella skill only routes and passes
results between the two workflows; it does not import content by copying an
entire skill.

## Non-goals

- Do not add a prompt that the user must write manually.
- Do not let MCP run a fixed autonomous scan and create concepts. Machine Seed
  only captures/groups structural signals; the Agent still investigates and
  assigns dispositions.
- Do not ingest a raw graph into the Hub.
- Do not clone a remote repository for ordinary query. Hub Init may create a
  detached worktree/cache for the exact authorized remote default commit.
- Do not combine Accept or Publish with default Ingest/Refresh authorization.
