# Quickstart Validation: ECS Full-stack Qualification

1. `npm run verify`.
2. Confirm the fixture commit and clean status.
3. Run and finalize the Sol Initial Ingest suite once.
4. Review its OKF and exact backend health-contract source before accepting it as a benchmark baseline.
5. If accepted, pin that result in the Terra Refresh manifest.
6. Run one Refresh probe; stop on a hard or clear quality blocker.
7. Only after a valid probe, run and finalize one sequential replica.
8. Compare changed concept bytes separately from Repository observation metadata.
9. Record OKF/MCP and benchmark findings separately; run `npm run verify` again.
