# 01.04 — Reading boundaries and failures

> Status: Baseline, Capability 046 remote-default Init isolation and bounded
> discovery census are implemented.

## Reading authority

- One Git monorepo binds one graph at its Git root; a child project is a
  scope/path inside that graph.
- A parent directory containing independent Git repositories is a routing scope,
  not a repository root or graph identity.
- One evidence round binds exactly one admitted source root and exact revision.
- Ordinary query/source work uses the selected local repository. Hub Init binds
  the remote default commit during Preflight; it reuses the current checkout
  only when clean and exactly matching, otherwise it uses a detached temporary
  worktree/cache without checking out or stashing the user's workspace.
- Source reads must remain inside the admitted root and must not follow an
  escaping path/symlink.
- Do not auto-clone a remote repository or expand one repository into the entire
  workspace.
- Do not recursively scan the machine/workspace for repositories outside the
  user-opened or explicitly selected scope.
- Explicit `agentbase-scan` may inventory bounded Git roots within exactly the
  user-selected workspace. It stops at each Git root, does not deeply read
  source and does not index a Code Graph; this is not a background/arbitrary
  scan.
- A multi-repository command passes an explicit root list and handles each root
  as a separate unit; section 09 owns batch orchestration.

## Bounded discovery census

Capability 046 Discover inventories the root README, primary manifests, API
specifications, Terraform/Terragrunt, Docker/deploy, CI/runtime configuration and
graph-derived entry-point, route/event/trigger, boundary and
integration/data/channel groups. For `docs/`, it first inspects indexes,
filenames and headings, then reads only related documents deeply; generated,
vendor and build output are excluded, and lockfiles are hints only. Seed retains
compact groups, counts and bounded source samples instead of raw graph/source
inventory.

## Partial fallback

Graph is a discovery accelerator, not the only way exact source becomes
evidence:

- when graph coverage is missing for one area, the Agent uses bounded source
  search/read in that area;
- an unsupported file or language may use docs/config/source directly;
- every fallback claim still needs an exact source reference;
- the proposal records the coverage limitation and creates a Question when the
  missing portion may change important knowledge.

A partial result must not be described as complete repository coverage. A
missing graph row does not prove that a concept/relation does not exist.

## Failure outcomes

### Continue with a partial Draft

- a graph query is truncated or one area is unsupported;
- one candidate cannot resolve while another has exact evidence;
- source-search fallback supplies bounded evidence;
- the failure reduces completeness without breaking source integrity.

### Stop the repository run

- repository/source authority is invalid;
- Hub Init cannot resolve/access the exact remote default branch;
- source changes during the evidence round;
- provider cleanup is uncertain;
- no reliable exact evidence remains for a useful Draft;
- evidence/proposal state cannot be validated or recovered safely.

A batch run does not roll back a completed Draft from another repository. A
failed repository gets its own failure report and can be retried; section 09
decides checkpointing/idempotency.

## Baseline impact

The current boundary, mutation detection and cleanup remain. A graph round
returns a partial result with limitations when the evidence provider supports
only part of the source; integrity, source mutation and runtime/cleanup failures
still stop the run. No provider rewrite or separate recovery framework is
needed.
