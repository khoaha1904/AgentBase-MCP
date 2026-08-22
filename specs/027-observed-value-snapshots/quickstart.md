# Quickstart: Observed Value Snapshots

1. Run the focused governance and Hub lifecycle tests through `npm test`.
2. Validate a concept containing one clean observed value and its derived table.
3. Query it through `read_hub_observed_values`; expect exact snapshot provenance
   and `source_access: not-checked` without a repository source call.
4. Refresh the same entry and confirm its ID remains; omission is rejected or
   preserves the accepted entry according to the existing Refresh contract.
5. Run `npm run verify`; expect the complete 50-test offline gate to pass.
