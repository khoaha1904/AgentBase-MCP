# 03.03 — Evidence roles and provenance

> Status: Evidence ownership/provenance validation is implemented.

## Principles

Evidence has no shared confidence score. Each source role supports a bounded
claim type; claim wording must not be stronger than what the source proves.

| Source role | Claim ceiling |
|---|---|
| implementation code | source shows the stated behavior/integration |
| IaC/config declaration | repository declares the desired resource/configuration |
| README/ADR/docs | documented purpose, contract, decision or future intent |
| provider observation | resource/value observed in account/region/time |
| maintainer guidance | owner-provided classification/answer at attribution |

## Rules

- One exact source may be sufficient; do not impose a minimum source count.
- Code using a provider client does not prove a deployed resource exists.
- A Terraform/IaC declaration does not prove an apply succeeded or runtime state.
- A provider CLI observation does not prove source ownership or design intent.
- README/ADR may be primary evidence for purpose/decision, but future or
  ambiguous wording is not implemented behavior.
- Maintainer guidance coexists with source claims; it does not erase them or
  become objective runtime truth.

## Provenance

Every attributed claim/relation keeps source ID, exact reference and observed
source revision. Refresh must not stamp a new revision onto retained evidence
without rereading/reconfirming that source. A provider observation also binds
provider/account/region, observed time and resource identity. Observed snapshots
follow sections 01/08 and are not presented as current truth.

## Uncertainty

Do not use `72% confidence`. Record a concrete limitation:

- implementation found, deployment not verified;
- declaration found, runtime state unknown;
- documentation describes future intent;
- identity match remains ambiguous.

Ambiguity affecting query value or canonical identity creates a Question; a
non-critical missing detail remains a limitation.
