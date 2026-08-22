# Data Model: Observed Value Snapshots

Current normative field rules live in
[`docs/design/08-live-references/01-reference-format.md`](../../docs/design/08-live-references/01-reference-format.md).

- **ObservedValue** belongs to one Concept and binds one RepositorySource.
- **RepositorySourceState** is clean commit, dirty HEAD+digest or unborn+digest,
  always with observation time.
- **ObservedValueView** derives a Markdown row and a query result from the same
  structured value; neither creates independent state.
- **QuestionEvidence** references stable ObservedValue IDs and never depends on a
  semantic symbol target.
- **ObservationReference** is authoring-only `subject + property + role +
  source_id`; Finalize resolves it after deterministic normalization.

ProviderObservation is intentionally absent from this runtime slice.
