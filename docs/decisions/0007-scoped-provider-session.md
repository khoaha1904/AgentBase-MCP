# ADR 0007: Use One Scoped MCP Session per Repository Evidence Round

- **Status:** Accepted and promoted by Capability 003
- **Date:** 2026-08-12
- **Provider:** exact managed `codebase-memory-mcp@0.10.1`
- **Client:** exact `@modelcontextprotocol/client@2.0.0`

## Context

Capability 002 safely invoked every provider operation through a separate
one-shot CLI process. On the accepted fixture, indexing took roughly 11 seconds
and each query roughly 9 seconds because coordination startup repeated. The
public adapter already accepts a provider invoker, so lifecycle can change
without changing normalized core evidence.

The product needs a faster explicit Part 1 unit of work without silently adding
a daemon, watcher, UI or machine-wide provider service.

## Decision

AgentBase may open one provider stdio MCP session for exactly one repository
evidence round:

1. admit the exact package-private executable through the existing integrity
   and version boundary;
2. create the existing private cache outside the exact repository allow root;
3. connect through the exact official MCP client;
4. serve index, architecture, search, trace and bounded snippet calls through
   one child process and the existing response adapter;
5. close after success or failure and require zero standing provider process.

AgentBase does not invoke provider install/update/config commands, register an
MCP, enable a UI, request a user binary, search `PATH` or automatically fall
back to one-shot after session failure. One-shot remains an explicit rollback
and diagnostic transport.

## Dependency decision

Pin `@modelcontextprotocol/client@2.0.0` exactly rather than hand-writing MCP
framing, negotiation, correlation, timeout and cancellation behavior. The
accepted npm archive integrity is
`sha512-8f1OghQ2rjzIOfqgUCP+8GiUWqRs89njoWLNqAe8kWmDePv3s1fZXseej+QXemssEuuOvLLmLO/kqM3IQHtISw==`.
It resolves exact `@modelcontextprotocol/core@2.0.0` and requires Node.js 20 or
newer; AgentBase already pins Node.js 24. The production audit was clean at
acceptance time.

## Compatibility evidence

The exact client negotiated with the exact admitted Linux x64 provider. One
child served index plus six queries. The compatibility spike observed:

- connect `8858.80ms`;
- index `3833.69ms`;
- every subsequent query `13.98–18.76ms`;
- close `16.86ms`;
- total `13069.82ms`;
- unchanged fixture source digest;
- private cache only outside the checkout;
- zero stderr and no direct/descendant provider process after close.

Sanitized exact evidence is
`fixtures/codebase-memory-v0.10.1/session.json`.

## Promotion boundary

The compatibility spike authorizes implementation, not a new default. A scoped
session becomes the recommended/default real evidence transport only when three
alternating paired rounds on the same host and task all:

- retain the five accepted facts within three files;
- match normalized fact/source identity;
- leave source unchanged and zero process;
- produce a scoped-session median total no more than half the one-shot median.

A speed miss keeps one-shot as default and records the rejected reason. No
runtime silently changes itself from benchmark output.

The 2026-08-12 promotion run passed all gates across six alternating arms. The
one-shot median was `67073.047ms`; scoped-session median was `14405.099ms`
(`4.656x`). Normalized provider/source/fact/path identity matched, every arm
left source unchanged and cleanup was clean. Scoped-session is therefore the
default real evidence transport. One-shot remains explicitly selectable.

## Failure and rollback

Connection, protocol, tool, malformed output, timeout, output limit, premature
exit, mutation and cleanup failures reject the whole evidence round. Cleanup is
attempted in all cases. Operators choose one-shot explicitly for rollback;
automatic fallback is prohibited because it obscures lifecycle evidence and may
double work.

## Consequences

- Query startup is amortized within one source-validation boundary.
- One exact production dependency and its transitive supply chain are added.
- Session stderr, messages, requests and total lifetime require AgentBase caps.
- Automatic refresh, watcher ownership and session sharing remain later work.
