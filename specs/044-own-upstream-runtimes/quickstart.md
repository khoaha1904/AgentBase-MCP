# Quickstart: Implement and Qualify the Migration

## Before implementation

1. Obtain explicit approval for capability 044.
2. Keep the existing pinned fixture checkouts read-only as import sources.
3. Confirm the current dirty tree before every phase; do not mix unrelated work.

## Implementation sequence

1. Qualify pristine Codebase Memory `v0.10.8` against the current `v0.10.1`
   behavior baseline and stop on unexplained material drift.
2. Add provenance/inventory/import ownership and import both pinned snapshots.
3. Add and verify the 12-language overlay in disposable staging.
4. Add native build plus atomic platform artifact admission.
5. Compare the owned build with the accepted pristine `v0.10.8` baseline.
6. Replace npm-package admission and remove external recovery.
7. Put provider preparation before skill/client mutation in installation.
8. Prove public tool compatibility, evidence behavior and failure recovery.
9. Reconcile living high/low-level requirements before closure.

## Verification

```sh
npm run verify
```

Then run the explicit Linux x64 native qualification. Run the same qualification
on the company macOS arm64 host with approved Node 24 and registry. Do not close
the migration until both evidence records identify the same source/profile and
pass.

No model benchmark, Hub PR, Graph UI server or diagram rendering belongs to this
capability.
