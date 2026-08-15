# Contract: Evidence-First Benchmark Readiness

## Assessment shape

```json
{
  "status": "reviewable",
  "hardFailures": [],
  "limitations": [
    "deterministic source-path validation does not prove semantic support"
  ]
}
```

`reviewable` requires:

- successful arm lifecycle and at least one authored concept;
- conformant OKF and valid AgentBase draft/schema policy;
- normalized sources bound to the pinned repository;
- every declared relationship resolves to an authored target and Markdown link;
- known-schema relationship guidance is followed;
- no curated known contradiction.

Missing reference concepts, metadata fields, source paths or relationships do
not change `reviewable` to `invalid`.

## Classification shape

```json
{
  "confirmedConcepts": ["aha-lambda-function"],
  "contradictedConcepts": [],
  "unjudgedConcepts": ["aws-health-aware-repository"],
  "missingReferenceConcepts": ["aws-health-alerting-flow"]
}
```

Fixture expectations are explicitly non-exhaustive. `unjudged` means the scorer
has no curated verdict. Reports must not call it unexpected, incorrect or a
false positive.

## Diagnostic contract

Reference recall, matched-schema agreement, metadata/provenance/relationship
coverage and review burden remain visible. They are not averaged and have no
automatic 80% gate.

## Report contract

Reports present:

1. authoring assessment and hard failures;
2. confirmed/contradicted/unjudged/missing classifications;
3. coverage diagnostics and limitations;
4. efficiency evidence;
5. no automatic overall winner or semantic-truth claim.

## Prompt contract

v2 prompts remain immutable and general. A prompt version changes only for a
general evidence-backed deficiency, never to reveal or imply a fixture answer.
