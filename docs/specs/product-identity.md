# Living Requirements: Product Identity

- **Status:** Active
- **Established by:** Capability `008-local-hub-product-correction`
- **Last updated:** 2026-08-12

### AB-PRODUCT-001 — Two official repository identities

The local MCP application is **AgentBase-MCP**. The Git repository that stores
and shares Google OKF data is **AgentBase-Hub**. Active product documentation,
configuration examples and generated defaults use these names.

### AB-PRODUCT-002 — Temporary names are not product identity

`agentbase-next` identifies the current rebuild worktree only. Legacy names and
historical repository names may remain in explicitly historical evidence, but
must not become application identity, Hub identity or a generated OKF subject.

An explicitly admitted source repository may retain its real name even when it
matches a historical string; naming checks distinguish source data from product
defaults.

### AB-PRODUCT-003 — Responsibility split

AgentBase-MCP owns Code Graph access, evidence investigation, the OKF concept
schema catalog, local Hub lifecycle, query, publication and synchronization.
AgentBase-Hub contains OKF Markdown and ordinary Git history. It contains no
MCP runtime, graph engine or hidden operational database.

### AB-PRODUCT-004 — Additive canonical migration

Canonical working directories are `AgentBase-MCP` and `AgentBase-Hub`.
Migration is report-first and additive: sources are admitted exactly, Git
history is preserved, canonical Git state is independent, and dirty legacy or
development worktrees remain untouched.

### AB-PRODUCT-005 — External cutover is separate

Creating or renaming GitHub repositories, changing remotes, repointing an
installed MCP, deleting old directories and rewriting shared history each need
separate owner authorization and an exact rollback point.

### AB-MIGRATION-001 — Report-first additive directories

Migration preflight records exact source HEAD/branch/dirty state, redacted
remotes, destination collisions and rollback sources. Canonical
`AgentBase-MCP` is an independent history-preserving clone of a stabilized
source commit; canonical `AgentBase-Hub` is a fresh clone of the admitted
remote. Neither operation modifies a source worktree.

### AB-MIGRATION-002 — Cutover and cleanup are independent approvals

GitHub create/rename, remote rewrites, installed MCP launcher replacement and
old-directory archive/deletion are separate operations. Each records exact old
and new values and proves rollback before the next external step.
