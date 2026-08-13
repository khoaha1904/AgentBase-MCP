# Quickstart: Validate the Corrected Product Model

## 1. Offline local acceptance

Use a fixture source repository and disposable local/bare Hub. Prepare and
finalize a concrete-schema proposal, inspect its digest, then accept it locally.

Expected:

- local Hub `main` advances by one proposal commit;
- remote bare `main` does not change;
- pending list contains the proposal;
- Hub search/read returns the new knowledge.

## 2. Concrete schema selection

Use fixture observations for two Lambdas, one SQS queue, one server and their
relationships.

Expected:

- concrete schemas are selected;
- repeated Lambda schema produces two canonical concepts;
- unused catalog types produce no placeholders;
- absent fields become limitations/questions rather than invented facts.

## 3. Batch publication

Accept four local proposals from at least three source identities. Submit the
first three as one publication.

Expected:

- exactly one non-target branch and one PR receipt;
- branch head contains exact proposal commits in order;
- fourth proposal remains pending and locally queryable;
- remote `main` remains unchanged until the simulated merge.

## 4. Synchronization and recovery

Simulate remote merge and a separate contributor change, then synchronize.
Repeat with an intentional conflict and an interrupted transaction.

Expected:

- merged proposals are recognized;
- remaining proposal rebases without loss in the clean case;
- conflict keeps original local `main` and exact recovery state;
- recovery completes deterministically after interruption.

## 5. Naming and migration rehearsal

Run migration preflight against disposable copies and destination collisions.

Expected:

- target names are exactly AgentBase-MCP and AgentBase-Hub;
- existing source/dirty worktrees remain byte- and ref-unchanged;
- canonical targets pass independent Git and product checks;
- remote rename and launcher cutover are reported as unexecuted without separate
owner authorization.

Run the real read-only preflight:

```bash
node scripts/migrate-product-repositories.mjs report
```

Do not run `create-mcp` until the source worktree is stabilized as one reviewed
commit. Do not run `create-hub` until the exact official GitHub repository
identity is admitted; the command derives the same canonical HTTPS remote used
by runtime admission. Before installed-MCP cutover, record the old launcher executable,
arguments and environment-key names (never token values); rollback restores
those exact values. Before any remote rewrite, record both fetch and push URLs;
rollback restores them with `git remote set-url` and `--push` respectively.

## 6. Canonical gate

Run:

```bash
npm run verify
```

Expected: specification, types, architecture, all offline tests and diff checks
pass with no unreviewed exception, no metric-driven file fragmentation and no
real GitHub mutation. A cohesive hotspot above a threshold may remain as a
visible warning only when it has one exact owner-approved, non-growing baseline
mark with a reason and review condition.
