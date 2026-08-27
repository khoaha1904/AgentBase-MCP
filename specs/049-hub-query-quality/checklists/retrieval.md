# Requirements Checklist: Markdown Retrieval and Dependency

**Purpose**: Validate the retrieval, cache and dependency requirements before
implementation.

**Created**: 2026-08-26

## Corpus and authority

- [x] CHK001 Is OKF distinguished from the query engine and is Published Markdown retained as the sole durable authority? [Consistency, Owner Decisions]
- [x] CHK002 Are the searchable OKF fields and excluded arbitrary metadata explicitly enumerated? [Completeness, FR-003]
- [x] CHK003 Is `description` identified as the existing summary authority without requiring a duplicate persisted field? [Consistency, FR-011]
- [x] CHK004 Are transient sections clearly distinguished from concepts, files and durable chunks? [Clarity, Key Entities]

## Retrieval behavior

- [x] CHK005 Are exact lookup precedence, established lexical relevance and deterministic tie-breaking separately specified? [Clarity, FR-001..002]
- [x] CHK006 Are heading paths, excerpt provenance and one-result-per-concept collapse measurable? [Acceptance Criteria, FR-004]
- [x] CHK007 Are Domain membership, Repository association and one-hop boundary inclusion mutually distinguishable without rewriting topology? [Consistency, FR-005..006]
- [x] CHK008 Are portable untyped links separated from AgentBase canonical relationships and Flow direction authority? [Clarity, FR-007..008]

## Cache and failure

- [x] CHK009 Is the cache key exactly one synchronized Published commit with no Local Draft or remote-candidate input? [Authority, FR-009/013]
- [x] CHK010 Are lazy build, same-commit reuse, commit-change invalidation and restart recovery all defined? [Scenario Coverage, FR-013]
- [x] CHK011 Is failed replacement behavior explicit and does it prohibit stale-index fallback for a newer commit? [Exception/Recovery, Edge Cases]
- [x] CHK012 Are document, result, section and relationship bounds measurable and independent of cache reuse? [Non-Functional, SC-004..005]

## Dependency and deferrals

- [x] CHK013 Is the exact full-text dependency version, license, runtime-dependency shape and owner approval gate documented? [Dependency, Plan]
- [x] CHK014 Are fuzzy, prefix, semantic, vector, durable-index and Pagefind work explicitly deferred behind evidence or a later capability? [Scope, Assumptions]
- [x] CHK015 Does qualification cover relevance, commit isolation, cache lifecycle and performance rather than only happy-path matching? [Coverage, SC-001..007]
