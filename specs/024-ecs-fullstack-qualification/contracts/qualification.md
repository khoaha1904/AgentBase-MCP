# Qualification Contract

1. Verify the clean pinned fixture before each run.
2. Run Initial Ingest with Sol using the existing exact lifecycle and stop before Accept.
3. Review the OKF tree, exact health-contract evidence and scorer separately.
4. Only a reviewable baseline containing the backend health contract may seed Refresh.
5. Apply every exact source mutation in one temporary commit; never mutate the fixture.
6. Run Terra Refresh once. Require `/health` health-contract knowledge and reject retained `/status` health-contract knowledge.
7. Run one identical Terra replica only after an unblocked valid probe.
8. Never deploy, call AWS/provider CLI, publish, Accept or create a Hub PR.
