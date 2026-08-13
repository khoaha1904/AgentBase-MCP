# Research: Codebase Memory MCP Surface

## Decision 1: thin filtered gateway

**Decision:** Use the official MCP server SDK for a small stdio gateway that
forwards an approved Codebase Memory surface.

**Why:** Directly publishing the exact upstream server is smaller in code but
also exposes source persistence, project deletion, ADR mutation and trace
ingestion. Skill guidance alone is not an enforceable safety boundary.

**Rejected:** reimplement MCP framing; expose all 15 tools; build an AgentBase
graph API with renamed tools.

## Decision 2: lazy one-repository connection binding

**Decision:** The gateway lists its captured safe manifest without starting a
provider. The first successful `index_repository` validates an absolute source
root, derives its private cache, starts one exact-root scoped provider session
and binds the MCP connection to that root. A different root requires reconnect.

**Why:** This meets cwd-independent explicit selection while preserving the
existing exact `CBM_ALLOWED_ROOT` boundary. It avoids a broad home allow-root,
multi-repository session registry and one native process per tool call.

**Rejected:** bind to server startup cwd; use `/` or home as provider allow-root;
maintain a persistent repo-to-session registry; recursively discover repos.

## Decision 3: exact safe manifest

**Decision:** Capture the exact `0.10.1` schemas for the 11 upstream `analysis`
tools plus `index_repository`. At provider admission, compare names/schemas and
fail on drift. Forward successful/error result blocks without normalization.

For `index_repository`, accept the compatible upstream fields but reject
cross-repo modes and any request for source persistence, then force
`persistence:false` before forwarding.

**Why:** The agent sees familiar tools while AgentBase enforces its read-only
source contract. A pinned manifest is appropriate because the binary itself is
already exact-version and digest pinned.

## Decision 4: skill shim, not installer delegation

**Decision:** Create `.agents/skills/use-codebase-memory/SKILL.md` plus normal UI
metadata. Keep it concise and cite the exact upstream package/source in a small
reference file only if validation shows the provenance text would distract from
the workflow.

**Why:** Upstream synthesizes client-specific instructions at install time; it
does not provide one stable skill artifact to import. Its installer has broad
global side effects and its watcher assumption is false for AgentBase.

**Rejected:** invoke upstream installer; copy every upstream hook/profile; embed
tool schemas in the skill; mix graph use with OKF authoring.

## Decision 5: offline gate plus isolated real qualification

**Decision:** Unit/contract tests use a fake provider connection and captured
schemas/results. An opt-in test launches a fresh official MCP client and the
AgentBase server from an unrelated temporary cwd against a disposable fixture.

**Why:** Mandatory verification stays fast and deterministic, while the actual
stdio/process boundary is still proven before promotion.

## Dependency decision

Add exact `@modelcontextprotocol/server@2.0.0`, paired with the existing exact
client package. This is a new production dependency and remains blocked on the
owner approval checkpoint.

Supporting evidence: `docs/product/evidence/2026-08-12-codebase-memory-mcp-surface.md`.
