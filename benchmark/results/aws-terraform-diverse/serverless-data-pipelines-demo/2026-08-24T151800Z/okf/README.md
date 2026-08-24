# AgentBase-Hub

AgentBase-Hub is a human-readable OKF knowledge repository created and managed by [AgentBase-MCP](https://github.com/khoaha1904/AgentBase-MCP). Return to this Hub's [repository root](.).

## Start here

Open [`index.md`](index.md). It is the canonical progressive-disclosure entrypoint for both people and agents. Follow its links into Domains, Systems, Repositories and other concepts instead of scanning every file.

## What this Hub stores

The Hub stores reviewed knowledge, relationships, Questions, limitations, evidence and small observed-value snapshots as linked Markdown concepts. It does not duplicate repository source code or the private local Code Graph; concepts retain references that help readers return to source evidence when more detail is needed.

## Layout

```text
index.md                 Knowledge entrypoint
domains/                 Domain navigation
repositories/            Repository identity and evidence scope
systems/, components/    System and workload knowledge
interfaces/              Important integration boundaries
<other concept types>/   Added only when useful knowledge exists
.agentbase/ci/           Self-contained Hub validator
.github/workflows/       Read-only Hub CI
```

## How knowledge changes

AgentBase-MCP reads an authorized repository, prepares a Local Draft, and opens a reviewable pull request. Knowledge becomes Published only after a maintainer merges that PR and MCP synchronizes the Hub. Conflicting evidence may remain visible rather than being forced into one unsupported answer.

Hub CI checks structure, links, obvious sensitive content and freshness metadata. Freshness is warning-only; it never rewrites knowledge automatically.
