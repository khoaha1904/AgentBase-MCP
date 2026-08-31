# Research: AIT useful visual context

## Decision: keep two P0 diagrams and one conditional view

The Discovery Impact Map directly supports Phase 1 scope/unknown discovery.
The Implementation Impact Map directly supports Phase 2 exact task boundaries.
Flow is conditional because it adds value only when journey order matters.

Alternatives considered: a catalog of Architecture, Dependency, Sequence,
infrastructure, organization and Task diagrams. Rejected because diagram type
coverage does not demonstrate AIT value and duplicates impact-map lenses.

## Decision: Phase 1 is ready; Phase 2 needs a packet boundary

The Published projection already supplies nodes, relations, Questions and
commit provenance for the Crawler Discovery map. Code Graph tools can retrieve
Phase 2 facts, but Published visualization cannot truthfully represent exact
file/symbol evidence.

Alternatives considered: reuse Hub relations for file-level edges. Rejected
because Hub context scopes source work but does not prove exact implementation.

## Decision: fake only the AWS CLI process

Reuse `createMockAwsSqsRunner`, the real `AwsCliAdapter` and the complete current
Enrichment/Question/proposal path. No downstream code may branch on mock state.

Alternatives considered: mock Enrichment results or mark OKF as synthetic.
Rejected because the user's intended fixture simulates a real CLI environment,
and AgentBase must process it as ordinary observed truth.

## Decision: publish only provider-answerable knowledge

The Crawler queue identity Question can be resolved by an exact verified ARN.
The operational-ownership Question asks for maintainer intent and cannot be
answered by AWS observation, so it remains open.

Alternatives considered: answer every open Question to maximize diagram
coverage. Rejected because it would create unsupported governance claims and
does not improve the current impact map safely.
