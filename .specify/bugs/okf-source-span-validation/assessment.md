# Bug Assessment: Finalize accepts repository source spans beyond the file

- **Slug**: okf-source-span-validation
- **Created**: 2026-08-21
- **Source**: retained benchmark `2026-08-21T163552Z`
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

The benchmark completed Prepare, Validate, Finalize and Inspect with an otherwise
clean four-concept bundle. One source cited `handler.py#L1042-L1114`, but the
pinned file contains only 1065 lines. The offline scorer rejected the ingest;
MCP Finalize had accepted the impossible source span.

## Symptom

A normalized repository URI can enter a proposal even when its path does not
resolve to a regular file in the authorized source checkout or its end line is
beyond that file. This makes evidence look precise while being impossible to
retrieve.

## Reproduction

1. Prepare Initial Ingest for an authorized local repository.
2. Author a new concept citing that repository with a normalized line range
   whose end line exceeds the real file.
3. Finalize the session.
4. Observe Finalize accept the proposal and the benchmark reject it later.

## Suspected Code Paths

- `src/app/hub-okf/query/runtime-actions.ts` — receives the authorized source
  root but does not bind it to the private authoring session.
- `src/app/hub-okf/authoring/authoring-session.ts` — persists Hub checkout state
  but not the source checkout required for final evidence verification.
- `src/app/hub-okf/authoring/prepare.ts` — validates source URI shape and current
  repository attribution, but not real path or line bounds.
- `src/app/hub-okf/authoring/initial-ingest.test.ts` — lacks the impossible-span
  reproduction at the Finalize boundary.

## Root Cause Hypothesis

Confidence: high. Source validation stops at normalized URI syntax because the
authorized source checkout is discarded after Prepare. The benchmark owns a
duplicate real-file check, so the product and qualification boundary disagree.

## Proposed Remediation

Persist the absolute authorized source checkout only in private session state.
For newly authored concepts, Finalize must resolve every citation belonging to
that source repository beneath the authorized root, require a regular file and
reject a line range beyond its current content. Do not dereference citations to
other repositories and do not add a scanner, parser or completeness rule.

Update the existing Initial Ingest lifecycle test to fail one impossible span,
repair it in the same session and then Finalize successfully.

## Risks & Considerations

- The local source path must never enter the Hub bundle or proposal metadata.
- Encoded traversal and symlink escape must not cross the authorized root.
- Foreign-repository evidence can be legitimate but cannot be checked without
  a separately authorized checkout.
- Existing unfinished private sessions without the new field will be rejected;
  they are disposable local drafts, not published knowledge.

## Open Questions

None.
