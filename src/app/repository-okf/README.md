# Repository OKF

This application capability turns one repository revision into reviewable OKF
evidence. Its public API is [`index.ts`](index.ts); [`cli.ts`](cli.ts) is the
command-line adapter.

## Areas

- `graph/` — graph rounds, freshness and benchmark measurements.
- `evidence/` — repository identity, source state and normalized evidence.
- `provider/` — isolated provider workspace preparation.
- `workflow/` — repository authoring orchestration and recovery.

Repository OKF does not own shared Hub publication or review state. Those
workflows belong to `app/hub-okf`.
