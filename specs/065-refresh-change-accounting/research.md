# Research: Refresh change accounting

## Decision: account returned paths, not every repository file

**Rationale**: Refresh already derives one bounded, secret-filtered exact Git delta. Reusing it closes the silent-drop gap without adding a full scan or a candidate database.

**Alternatives considered**: full discovery on every Refresh would materially increase latency/cost and still need outcome accounting; commit-level feature entities would pollute sparse Hub knowledge.

## Decision: bind materialized claims to changed concept bytes and exact sources

**Rationale**: A declaration alone cannot prove the Hub learned anything. The existing normalized `repository://` parser and base/proposed bundles can verify that the claimed path supports an actually changed concept.

**Alternatives considered**: trusting free-form reasons would be cheap but allow false success; requiring a concept per path would over-model tests, config and internal implementation files.

## Decision: retain accounting in proposal inspection

**Rationale**: Reviewers need the explanation before Accept, while ordinary Hub query should remain sparse and concept-oriented. Existing `inspection.json` is already the proposal-review authority.

**Alternatives considered**: an OKF Change concept or separate ledger adds a schema/store and long-term noise; ephemeral tool output would disappear before review and would not solve the audit gap.
