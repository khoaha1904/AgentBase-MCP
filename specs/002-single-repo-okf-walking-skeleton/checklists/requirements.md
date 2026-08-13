# Requirements Quality Checklist: Single-Repository OKF Walking Skeleton

**Purpose:** Test whether the corrected MVP requirements are complete, clear,
measurable and faithful to Open Knowledge Format `v0.2`
**Created:** 2026-08-12
**Audience:** Owner-approved implementation and delta-review record
**Feature:** [spec.md](../spec.md)

## Source and terminology

- [x] CHK001 Is the normative OKF version and pinned source identified rather
  than relying on remembered terminology? [Traceability, Spec §Source correction]
- [x] CHK002 Is an OKF bundle distinguished from Code Intelligence evidence, a
  single report, a Hub, a model and a review workflow? [Clarity, Spec §Outcome]
- [x] CHK003 Are Google base fields separated from AgentBase concept types and
  extension fields? [Consistency, Spec §AB-MVP-010–017]

## Provider and evidence completeness

- [x] CHK004 Are managed-package selection, checksum/identity compatibility,
  lifecycle and prohibition of user-path/`PATH` fallback specified?
  [Completeness, Spec §AB-MVP-001–005]
- [x] CHK005 Are source state, bounded evidence, limitations and digest fields
  required without exposing machine-local roots? [Completeness, Spec §AB-MVP-006]
- [x] CHK006 Are managed bootstrap/real-provider execution and mandatory offline
  verification paths independent? [Consistency, Spec §AB-MVP-007 and
  SC-MVP-002]

## OKF conformance

- [x] CHK007 Are bundle directory, concept file, YAML frontmatter and required
  `type` semantics explicit? [Completeness, Spec §AB-MVP-009–010]
- [x] CHK008 Are concept identity, root version, progressive index, reserved log
  and standard Markdown links specified? [Completeness, Spec §AB-MVP-011–013]
- [x] CHK009 Are unknown types/keys, missing optional fields and broken links
  handled according to permissive OKF consumption? [Edge case, Spec §AB-MVP-013]
- [x] CHK010 Are generated drafts required to state draft status, producer/time,
  provenance and absence of unearned verification? [Clarity, Spec §AB-MVP-012]
- [x] CHK011 Is the minimum linked concept set objectively measurable without
  defining a universal ontology? [Measurability, Spec §User Story 2]

## Continuity and human knowledge

- [x] CHK012 Is previous AI output explicitly excluded from independent
  provenance or trust accumulation? [Consistency, Spec §AB-MVP-014]
- [x] CHK013 Are human correction and defer represented as conformant concepts
  rather than a custom protected section? [Clarity, Spec §AB-MVP-016–017]
- [x] CHK014 Is mutability limited to explicit AgentBase-generated drafts, with
  all ambiguous/non-AgentBase/human-verified concepts protected by default and
  mutable unknown values preserved? [Coverage, Spec §AB-MVP-018]
- [x] CHK015 Is conflict with reviewed knowledge required to remain a separate
  visible draft? [Recovery, Spec §User Story 3]

## Proposal and recovery

- [x] CHK016 Are complete proposal, base/evidence digests and bundle-level diff
  defined before shared mutation? [Completeness, Spec §AB-MVP-009 and 015]
- [x] CHK017 Can an explicitly diffed AgentBase draft be deleted for convergence
  while protected deletion, rename and merge remain excluded? [Scope, Spec
  §AB-MVP-019]
- [x] CHK018 Does recovery acknowledge the two directory renames instead of
  claiming single-file atomicity? [Clarity, Spec §AB-MVP-020]
- [x] CHK019 Are single-writer locking, declared injected interruption
  checkpoints and exact manifest-driven recovery specified without claiming
  unimplemented power-loss durability? [Coverage, Spec §AB-MVP-020 and
  SC-MVP-005]

## Acceptance and scope

- [x] CHK020 Are graph evidence coverage, OKF conformance, linked concepts,
  protected bytes and optional benchmark dimensions measurable? [Acceptance
  Criteria, Spec §SC-MVP-001–006]
- [x] CHK021 Are missing/non-conformant bundles, dirty worktrees, malformed
  provider output and provider repository mutation addressed? [Edge cases]
- [x] CHK022 Are custom downloader, native install/config, daemon, cloud,
  cross-repository, Hub, ontology, attested computation and protected-deletion
  workflows explicitly deferred? [Scope, Spec §Out of scope]
- [x] CHK023 Is the YAML dependency need visible as an implementation and
  round-trip safety decision? [Dependency, Spec §Constraints]
- [x] CHK024 Does the specification allow semantically incomplete drafts while
  retaining structural/provenance safety? [Product intent, Spec §Outcome]
- [x] CHK025 Are prepare/generated proposal states, host-agent write authority
  and generated-tree invalidation defined? [Consistency, Spec §AB-MVP-015]
- [x] CHK026 Is source-code provenance normalized without machine-local roots?
  [Interoperability, Spec §AB-MVP-012]
- [x] CHK027 Is defer durable until explicit reopen rather than coupled to a
  noisy global evidence digest? [UX, Spec §AB-MVP-017]
- [x] CHK028 Are base OKF conformance and AgentBase producer-policy failures
  distinguished? [Terminology, Spec §Edge cases]

## Result

All 28 corrected requirement-quality checks pass. The single-file preview has
been superseded; this checklist applies only to the owner-approved OKF `v0.2`
bundle design after focused product, technical and knowledge-loop delta review.
