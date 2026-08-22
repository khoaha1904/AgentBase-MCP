# Data Model: Hub Freshness Report

## HubFreshnessReport

- `commit`: exact admitted Hub commit read.
- `publication_layer`: `published` or `local-draft`.
- `generated_at`: valid ISO timestamp used for every derived age.
- `summary`: total, observed and unknown Repository counts.
- `repositories`: bounded ordered `RepositoryFreshness` rows.

## RepositoryFreshness

- `repository_id`: canonical Repository ID, or absent when unavailable.
- `title`, `path`: human and canonical Hub location.
- `state`: `observed` or `unknown`.
- `observed_at`, `age_milliseconds`: present only for observed rows.
- `source_revision`: clean commit or dirty digest, present when known.

Unknown rows sort first. Observed rows sort by descending age, then path. The
report has no persisted lifecycle or state transition.

