# Feature Specification: Install Product Skills

**Feature Branch**: `039-install-product-skills`

**Created**: 2026-08-24

**Status**: Complete

**Input**: Interactive installation must make AgentBase product workflows
available in each selected coding client without shipping repository-development
Spec Kit skills.

## User Scenarios & Testing

### User Story 1 - Install usable AgentBase workflows (Priority: P1)

As a user selecting Codex, Claude Code or both, I receive the seven released
AgentBase workflow skills together with the MCP registration.

**Acceptance Scenarios**:

1. A fresh selected client receives exactly the seven named product skills.
2. An exact rerun keeps identical installed skills without rewriting them.
3. An unselected client receives no skill or configuration change.

### User Story 2 - Exclude development workflows safely (Priority: P1)

As a product user, I never receive the repository's `speckit-*` development
skills, and an existing different same-name skill is preserved rather than
overwritten.

**Acceptance Scenarios**:

1. Installation copies from an explicit product allowlist, not directory
   discovery.
2. Any conflicting destination fails before skill mutation.
3. If later MCP registration fails, skills newly created by this run are
   removed while pre-existing skills remain.

## Requirements

- **FR-001**: Interactive installation MUST install exactly the seven released
  product skills listed in `.agents/skills/README.md` for every selected client.
- **FR-002**: Installation MUST NOT install any `speckit-*` or other
  development-only skill.
- **FR-003**: Codex and Claude Code MUST receive product skills at their
  supported user-scope skill locations.
- **FR-004**: An identical existing skill MUST be a no-op; a different,
  non-directory or symbolic-link same-name target MUST fail before mutation and
  MUST NOT be overwritten.
- **FR-005**: Multi-client skill installation MUST preflight all selected
  destinations before copying the first skill.
- **FR-006**: A later MCP registration failure MUST remove only identical skill
  directories newly created by that installer run.
- **FR-007**: Non-interactive installation MUST continue preparing dependencies
  only and MUST NOT install skills or register clients.

## Non-goals

- No marketplace, plugin package, network download or new dependency.
- No automatic replacement or migration of a modified installed skill.
- No change to the 49 MCP tools or product skill content in this capability.

## Success Criteria

- **SC-001**: Isolated Codex and Claude Code homes each contain exactly seven
  copied product skill directories and zero `speckit-*` directories.
- **SC-002**: Deterministic tests prove fresh install, exact rerun, conflict
  preflight, client isolation and rollback behavior.
- **SC-003**: The canonical offline verification gate passes with no new
  production dependency.
