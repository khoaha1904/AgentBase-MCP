# Installer Security Checklist: Local-First AgentBase Product Correction

**Purpose**: Validate installer and credential requirements before implementation
**Created**: 2026-08-13
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 Are Codex-only, Claude-Code-only and combined selections all specified? [Completeness, Spec FR-020]
- [x] CHK002 Is deferred client registration distinguished from successful code preparation? [Clarity, Spec US6/FR-020]
- [x] CHK003 Are first write, empty skip, preservation and explicit replacement credential paths specified? [Completeness, Spec FR-022..FR-024]
- [x] CHK004 Is runtime precedence between process environment and global credential explicit? [Consistency, Spec FR-025]

## Security and Privacy Clarity

- [x] CHK005 Is the intentional token-length disclosure through `*` feedback recorded as an owner decision? [Clarity, Spec Assumptions]
- [x] CHK006 Are token contents prohibited from summaries, errors, arguments and client configurations? [Coverage, Spec FR-021/FR-025]
- [x] CHK007 Are exact directory/file modes, symlink rejection and atomic writes specified? [Completeness, Spec FR-023..FR-025]
- [x] CHK008 Is implicit legacy `.env` migration explicitly excluded? [Scope, Spec Non-goals]

## Exception and Recovery Coverage

- [x] CHK009 Are paste, backspace, empty input, EOF and interruption scenarios identified? [Coverage, Spec Edge Cases]
- [x] CHK010 Is terminal-state restoration required for every completion and failure path? [Recovery, Spec FR-021]
- [x] CHK011 Is prior credential preservation required after failed explicit replacement? [Recovery, Spec FR-024]
- [x] CHK012 Is non-interactive behavior defined to avoid hangs and implicit secret persistence? [Coverage, Spec FR-022]

## Acceptance Quality

- [x] CHK013 Can client-config non-mutation be measured against disposable client homes? [Measurability, SC-008]
- [x] CHK014 Can masking be proven without placing a real token in logs or fixtures? [Measurability, SC-008]
- [x] CHK015 Can unsafe file type, mode, key and syntax rejection be proven offline? [Measurability, Spec FR-025]
