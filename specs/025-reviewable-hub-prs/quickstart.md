# Quickstart: Reviewable Hub Pull Requests

## Offline canonical scenario

1. Create a disposable Hub Git repository with remote `main`.
2. Accept one Init and one same-Repository Refresh locally.
3. Call publication with both proposal IDs through fake GitHub.
4. Assert Init PR base is `main`; Refresh PR base is the Init branch.
5. Assert both PR bodies contain all six sections and exact proposal/commit
   identity without token or local root.
6. Retry and assert exact branches/PRs are recovered without another push/PR.
7. Introduce one conflicting remote branch and assert publication stops while
   remote `main` remains byte-exact.

Run focused and canonical gates:

```bash
node --test src/app/hub-okf/publication/publish.test.ts
npm run verify
```

Real GitHub publication is not part of this validation.
