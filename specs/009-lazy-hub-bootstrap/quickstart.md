# Quickstart: Validate Lazy Hub Configuration and Bootstrap

## 1. No-Hub independence

Use a disposable config/data home with only a fake global token. Start the MCP,
list Hub status and exercise the captured Code Graph fixture.

Expected: status is `unconfigured`; all graph actions work; no Hub local root,
config, Git ref or network call is created.

## 2. Existing Hub attach

Use an admitted disposable GitHub-shaped remote fixture. Configure mode
`existing` with its exact URL, then query and prepare local OKF.

Expected: one private local clone and atomic active configuration; invalid URL,
content, permission or interrupted clone leaves no active configuration.

## 3. Local-only Hub growth

Configure mode `new`, inspect the root commit/tree, then accept two fixture OKF
proposals.

Expected: no remote; one classified base plus two classified proposal commits;
both knowledge changes are queryable and pending.

## 4. Bootstrap all history

Supply an empty disposable remote and choose `all-to-main`.

Expected: remote `main` equals local active head, no PR call, remote config is
admitted, pending becomes empty and retry is idempotent.

## 5. Bootstrap base with knowledge PR

Repeat from the same three-commit shape with a fresh empty remote and choose
`base-to-main-knowledge-pr`.

Expected: remote `main` equals base; one deterministic branch/PR has both
knowledge commits in order; local active head stays queryable. Exercise each
receipt checkpoint and prove exact recovery without another changed-main push.

## 6. Safety cases

Exercise populated remotes, a ref race, wrong URL/host, symlink config/root,
ordinary commits above base, insufficient read/contents/PR access and token
canaries.

Expected: every case fails before unauthorized mutation, retains local history
and exposes no token bytes.

## 7. Canonical gate

Run:

```bash
npm run verify
```

Expected: specification, type, architecture, offline tests and diff checks pass
without real GitHub mutation or metric-driven file fragmentation.
