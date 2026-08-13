# Contract: Private Graph Freshness Receipt

## Ownership

The receipt is AgentBase-owned disposable local state. It is stored outside the
repository and outside Codebase Memory's provider-owned cache data. It is never
committed, shared as OKF, or accepted as business knowledge.

## Read and decision

1. Capture the existing repository source identity.
2. Admit the exact managed provider and derive an opaque namespace identity.
3. Read at most one bounded receipt file without following a symlink.
4. Validate the complete versioned value.
5. Select reuse only for an exact source/engine/namespace match and no forced
   refresh; otherwise select one bounded refresh reason.

Unknown or malformed data does not crash into reuse. It behaves as a missing
receipt and remains untouched until a complete successful round replaces it.

## Commit

Receipt commit occurs only after:

1. index was skipped or completed as decided;
2. all normalized evidence queries completed;
3. source/control integrity matched from pre-admission through post-cleanup;
4. provider cleanup was established clean;
5. a complete normalized evidence digest exists.

Write a bounded temporary file in the same private metadata directory with mode
`0600`, flush/close it, then atomically rename over the receipt. A failed write
must not truncate the prior receipt. Temporary-file cleanup is best effort and
may not turn an incomplete commit into accepted success.

## Recovery

- Reuse query failure: fail with `--refresh` guidance; do not index or alter the
  receipt automatically.
- Refresh failure: fail and retain the prior receipt.
- Malformed receipt: refresh; replace it only after success.
- Deleted provider cache with matching receipt: same as reuse query failure.

No receipt listing, repair, generation or garbage-collection API is added.
