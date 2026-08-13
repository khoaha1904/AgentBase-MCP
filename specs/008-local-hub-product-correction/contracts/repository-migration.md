# Contract: Official Repository Migration

## Target identities

- Application: `AgentBase-MCP`
- OKF data repository: `AgentBase-Hub`
- Canonical workspace roots:
  - `/home/khoa/workspace/AgentBase/AgentBase-MCP`
  - `/home/khoa/workspace/AgentBase/AgentBase-Hub`

## Preflight report

Before mutation, record for each source and destination:

- existence and resolved non-symlink path;
- Git HEAD, branch, worktree dirty summary and remotes with credentials redacted;
- remote default branch and repository identity;
- current MCP launcher/registration path without exposing secrets;
- destination collision and free-space checks;
- exact rollback source.

## Additive migration

- Never clean, reset, overwrite, move or delete the source worktree.
- Create canonical application history from a stabilized source commit without
  sharing mutable Git control/object state.
- Create canonical Hub as a fresh clone of the admitted remote, not from the
  dirty legacy Hub worktree.
- Verify canonical repositories independently before switching configuration.

## Separately approved external steps

- create or rename the GitHub application repository;
- rename `knowledger-hub` to `AgentBase-Hub`;
- change remote URLs;
- replace installed MCP configuration;
- archive/delete legacy directories.

Each step records old/new values and an exact reversal. No cleanup occurs in the
same transaction as the first successful cutover.
