# Data model: Refresh change accounting

## Refresh source-change set

- `paths`: sorted unique normalized paths already safe to expose, maximum 128.
- `omitted`: count of additional safe changed paths outside the bound.
- `limitations`: bounded reasons the exact diff could not be fully derived.

The set is captured at Prepare and immutable for the session.

## Refresh change outcome

- `path`: exact member of the captured returned paths.
- `outcome`: `updated`, `new`, `embedded`, `question` or `ignored`.
- `reason`: trimmed reviewer-readable explanation, 1..512 characters.

There is exactly one outcome per returned path. Materialized outcomes additionally resolve to a changed concept with exact current-Repository evidence for `path`.

## Inspection accounting

- `outcomes`: normalized outcomes ordered by path.
- `partial`: true when `omitted > 0` or source-diff limitations are non-empty.
- `omitted`: copied exact count.
- `limitations`: copied exact bounded limitations.

The inspection value is immutable with the proposal and has no independent lifecycle. It never becomes canonical concept data.
