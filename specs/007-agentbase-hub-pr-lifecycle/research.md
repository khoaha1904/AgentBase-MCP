# Research: AgentBase Hub PR Lifecycle

## Decision 1: Fixed configuration, no per-command remote

**Decision**: The MCP operator supplies one repository owner/name and target branch. Commands supply only source/proposal intent.

**Rationale**: A fixed identity prevents a dedicated token from being redirected to another host or repository and makes receipts auditable.

**Alternatives considered**: Arbitrary HTTPS/SSH URL input was rejected as credential exfiltration and authority expansion risk.

## Decision 2: Memory-only token with bounded askpass

**Decision**: Pass the token into bounded Git/GitHub operations only. Git authentication uses an owner-private temporary askpass helper and sanitized environment; REST uses an in-memory Authorization header. Neither is persisted.

**Rationale**: Credentials in remote URLs, CLI arguments or Git config leak through process lists, errors and repository files.

**Alternatives considered**: Credential store/helper persistence and authenticated URL storage were rejected. SSH was deferred because the owner selected an MCP-owned GitHub token.

## Decision 3: Local clone plus isolated proposal worktrees

**Decision**: Maintain one admitted private clone and create one isolated worktree/state directory per proposal.

**Rationale**: It reuses fetched objects while preventing concurrent proposals from changing each other's base or authored tree.

**Alternatives considered**: Fresh clone per proposal is simpler but wasteful; one mutable checkout makes concurrency and recovery ambiguous.

## Decision 4: Deterministic publication state machine

**Decision**: Use `prepared → committed → pushed → pr-opened` with exact identities at every phase. Once pushed, the branch commit is immutable.

**Rationale**: This makes push-success/PR-failure recoverable without force push, duplicate commits or uncertain side effects.

**Alternatives considered**: Treating submit as one opaque operation was rejected because network failure cannot reveal which external side effect completed.

## Decision 5: Offline qualification first

**Decision**: Canonical tests use disposable local Git remotes and a fake GitHub API. A real private repository run requires separate owner authorization.

**Rationale**: Tests must not require credentials or mutate a real Hub, while exact remote lifecycle still needs a later bounded qualification.

**Alternatives considered**: Mocking every Git command alone was rejected because it would not prove branch/ref/hook/worktree behavior.
