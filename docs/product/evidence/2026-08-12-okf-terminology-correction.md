# Evidence: Open Knowledge Format Terminology Correction

- **Captured:** 2026-08-12
- **Status:** Accepted source correction; active Capability 002 must conform
- **Cause:** “OKF” was previously inferred from repository context without
  checking the Google specification

## Finding

The previous Capability 002 preview treated OKF as one generated `OKF.md` file
with a JSON metadata comment, a replaceable region and a protected maintainer
region. That design can be a custom review document, but it is not the Open
Knowledge Format defined by Google.

The official current specification is OKF `v0.2`. It defines a knowledge bundle
as a directory of concept Markdown files with YAML frontmatter. Concept identity
comes from the bundle-relative path. Every concept requires a non-empty `type`.
Standard Markdown links form relationships, and `index.md`/`log.md` have
reserved navigation/history structures.

OKF `v0.2` also provides optional provenance, generation, verification and
lifecycle fields. Agent-generated first drafts naturally map to `status: draft`
with `generated`, no `verified` entry, and source-backed claims in `sources`.

## Product correction

AgentBase Part 2 produces and maintains an OKF bundle, not one aggregate file:

```text
bounded repository evidence
  -> proposed linked concept files
  -> bundle-level diff and review
  -> explicit bundle apply
  -> later concept enrichment and cross-repository links
```

Human correction is represented through human-authored or human-verified
concepts and preserved unknown fields. A small `Maintainer Guidance` concept is
an acceptable AgentBase type. An AgentBase defer mechanism may use documented
extension frontmatter, but it is not part of the Google base specification.

## Impact on previous evidence

- The owner product direction remains valid and becomes more concrete: shared
  Markdown data means a portable bundle of linked concepts.
- The expert recommendation for a small graph-to-draft-to-correction loop
  remains valid, but its single-file examples are superseded.
- Legacy proposal-before-apply and recovery lessons still apply at the outcome
  level; single-file atomic rename does not transfer to a multi-file bundle.
- Capability 002's previous Implementation Preview is withdrawn and must be
  revised before implementation approval.

## Source authority

See `docs/references/open-knowledge-format.md` for pinned primary sources and the
reusable AgentStack pattern record.
