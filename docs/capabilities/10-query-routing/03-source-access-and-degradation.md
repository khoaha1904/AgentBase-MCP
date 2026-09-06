# 10.03 — Source access and degradation

> Status: The local degradation contract is accepted; the remote reader is the first
> post-phase query capability and is outside MVP only.

## Outcome

Hub knowledge and snapshots are always read independently of source availability.
Source is resolved only for an explicit current-value/code request or
when implementation/debugging/impact work genuinely requires code. If source
cannot be read, the answer degrades to the Hub/snapshot instead of failing
entirely or guessing.

## Separate trust boundaries

- **Hub access**: Hub access permits reading the entire Hub; there is no separate
  Domain, concept or field ACL.
- **Local source access**: the trusted-enterprise profile resolves the selected
  readable local/workspace path to one exact Git repository for the current
  connection.
- **Remote source access**: a post-MVP bounded MCP action uses the active
  credential provider for GitHub.com/GitHub Enterprise; the calling Agent does
  not receive the credential.
- **Provider access**: does not belong to the normal query route; provider CLI
  observations run only in an explicit Domain Enrichment workflow.

A Hub relation or `repository://` reference identifies source identity/path but
does not grant source access automatically.

## Snapshot-default access flow

For a value question:

1. read the Hub observed snapshot and retain the exact layer/source/time/age;
2. if the snapshot sufficiently answers user intent, stop at the snapshot;
3. if the user asks for the current value, check the current repository binding;
4. use normal graph/file tools only when the repository ID matches;
5. present the current result separately from the snapshot; do not write back.

An old snapshot, an existing conflict/Question or available local source does
not trigger step 3 automatically. This is an Agent semantic stopping rule, not a
quota or source-read counter in MCP.

The absence of a suitable snapshot does not forbid an explicit source
read, but query does not create a snapshot or proposal automatically.

## Access and resolution states

Source access and value resolution are separate:

| State | Meaning |
|---|---|
| `not-checked` | Snapshot-only query; source/credentials were not probed. |
| `available` | The exact repository binding/path is readable for this workflow. |
| `unavailable` | Repository is not local, the binding mismatches, the path is missing or graph/file reading is unavailable. |
| `unauthorized` | A future remote action tried an MCP credential and the provider denied permission. |

When access is `available`, current resolution can still be `resolved`,
`ambiguous`, `missing` or `redacted`. Permission to read a file does not prove
that the Agent mapped the property to the correct value.

The response retains a bounded reason such as `repository-not-local`,
`binding-mismatch`, `path-missing`, `graph-unavailable`, `permission-denied` or
`unsafe-value` so the user knows why current verification did not complete. It
does not expose a local absolute path, token or provider response body.

## Local and workspace repositories

- One connection binds exactly one explicit repository root.
- A referenced Repository ID must match the binding's resolved identity before
  using the relative path.
- A relative path must remain inside the root; do not follow a symlink/path escape.
- Another repository in the workspace is read after the workflow identifies its
  exact root and switches the connection cleanly. Do not build a
  cross-repository graph.
- A missing referenced path degrades to `path-missing`; do not run broad
  moved-symbol recovery or guess a replacement file.

A graph with insufficient coverage can use a bounded direct-source fallback in
the same resolved root. If freshness is genuinely needed for the current
question, the Agent can explicitly reindex; ordinary Hub/snapshot query does not index.

## Remote references

Remote file reading is deferred from the MVP but prioritized immediately after
this phase. Until that action exists:

- another non-local repository → `unavailable/repository-not-local`;
- return Hub knowledge and a snapshot when available;
- retain the remote/file reference for the user to investigate or authorize
  another workflow;
- do not clone a repository, call GitHub directly or repurpose publication
  transport as a hidden reader.

The remote-reader capability uses an exact canonical Repository identity,
bounded file/revision reference and the configured enterprise credential provider.
The credential remains only inside its provider adapter and is not given to the Agent;
GitHub.com and GitHub Enterprise have different base APIs but use the same
product contract. It does not clone a repository, use `gh`, scan a repository
or turn a local path into shared authority.

The remote default branch/head is suitable for an explicit current-source request;
an exact historical revision is suitable for checking provenance. Transport,
branch resolution and response bounds will be defined in that capability, not
packed into the MVP query implementation.

## Integrity and safety failures

- Source changes between current reads: return indeterminate/unavailable; do not
  combine bytes from two revisions.
- Unsafe value: redact the current candidate and retain safe Hub knowledge/siblings.
- Secret-bearing path: do not read it to resolve a value.
- An invalid Hub layer cannot be replaced with a source result labeled Hub knowledge.
- Source failure does not create a Question, Refresh, Enrichment or publication automatically.

## Minimal implementation impact

The local flow is primarily host-skill wiring over current tools. Runtime change
is needed only when the response requires structured degradation metadata. Remote
source access is a broad separate capability; no dependency, cache or reader
abstraction is added before the owner approves that capability.
