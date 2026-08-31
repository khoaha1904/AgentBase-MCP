# Bug Assessment: Repository card label overflow

- **Slug**: repository-card-label-overflow
- **Created**: 2026-08-31
- **Source**: pasted text and screenshot
- **Verdict**: valid
- **Severity**: low

## Report

The long `serverless-data-pipelines-demo` Repository title extends beyond its compact Repository card in the generated Domain site.

## Symptom

Repository cards use a fixed compact width, but long labels wrap or render outside that width. The card should keep its compact size, truncate the visible label, and preserve the complete title in the selectable details view.

## Reproduction

1. Generate a Domain site containing a Repository title longer than the 132-pixel card.
2. Open the generated site.
3. Observe the Repository label extending beyond the card boundary.

## Suspected Code Paths

- `src/app/hub-okf/visualization/domain-site-assets/app.js:234` — Repository cards override size but inherit the general node `text-wrap: wrap` and 150-pixel text width.
- `src/app/hub-okf/visualization/visualization.test.ts` — generated-asset contract coverage for the static Domain site.

## Root Cause Hypothesis

High confidence: the Repository card is 132 pixels wide while its inherited label width is 150 pixels and its inherited wrapping mode permits multi-line text. The compact card style does not constrain long labels.

## Proposed Remediation

**Preferred**: Set the Repository-specific Cytoscape label to ellipsis with a maximum width smaller than the card. Keep the complete projection title unchanged so selection details and filters continue to expose the full name.

**Files likely to change**:

- `src/app/hub-okf/visualization/domain-site-assets/app.js`
- `src/app/hub-okf/visualization/visualization.test.ts`

**Tests to add or update**:

- Assert that generated Repository styles use ellipsis and a card-bounded text width.

## Risks & Considerations

- Cytoscape must support its documented `text-wrap: ellipsis` style mode.
- The full Repository title must remain available through the normal selection details.

## Open Questions

- None.
