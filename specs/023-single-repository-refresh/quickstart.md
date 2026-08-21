# Quickstart Validation: Single-Repository Refresh

## Canonical offline gate

```sh
npm run verify
```

Expected: specification, TypeScript, dependency, focused lifecycle, Knip,
Gitleaks and diff checks pass without network, credentials or model calls.

## Required scenarios

1. Change one evidenced path: one reviewable Local Draft with only the current
   Repository's evidence-backed additions/updates.
2. Make no useful change: `no_change` and no proposal directory.
3. Leave a known gap unresolved: valid partial coverage or governed Question.
4. Delete/replace an evidenced contribution: explicit grouped lifecycle intent;
   foreign evidence remains.
5. Omit a concept without intent: preservation, not deletion.
6. Use an invalid changed source span: Finalize rejects and keeps safe repair state.
7. Exhaust repair or mutate source: Incomplete and no acceptable proposal.

## Optional model qualification

Run only after owner authorization. Use one Terraform fixture probe and one
sequential identical replica only after an unblocked result. Report OKF findings
separately from benchmark defects. Do not Accept, Publish, use provider CLI or
create a Hub PR.
