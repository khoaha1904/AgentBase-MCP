# Quickstart: AgentBase-Hub CI

1. Run the offline CI command on valid, malformed and secret-like fixtures.
2. Create a new local Hub and inspect `.github/workflows/agentbase-hub.yml` in its base commit.
3. Attach a disposable existing Hub, preview CI upgrade and submit with fake GitHub/Git.
4. Confirm the PR changes exactly one workflow file and remote `main` is unchanged.
5. Confirm old/unknown freshness changes summary only, never exit status.
6. Run `npm run verify`.
7. During release, create `v0.1.0-rc.1` before a real Hub workflow run.

