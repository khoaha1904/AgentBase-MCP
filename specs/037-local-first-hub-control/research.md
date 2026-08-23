# Research: Local-first Hub Control

## Published boundary

**Decision**: Store last admitted remote state in a dedicated local Git ref;
remote fetch/status uses a separate candidate ref.

**Rationale**: Current production failure proves `origin/main` cannot be both
latest remote observation and accepted ancestry base.

**Alternatives considered**: Persist SHA only in JSON duplicates Git authority;
derive from current tracking ref reproduces the defect.

## Profile isolation

**Decision**: Normalize `HTTPS host + owner/repository + branch` into one stable
profile identity with its own checkout and credential; one pointer is active.

**Rationale**: Switching Hubs is selection, never reconciliation. Reusing an
inactive profile preserves drafts without cross-Hub behavior.

**Alternatives considered**: One checkout rewritten between remotes risks draft
mixing; simultaneous multi-Hub query is outside MVP.

## Enterprise transport

**Decision**: `github.com` uses `https://api.github.com`; another admitted HTTPS
GitHub host uses `https://<host>/api/v3`. Web/clone/API origins must agree.

**Rationale**: This is the standard GitHub Enterprise Server REST shape and
requires no second provider.

**Alternatives considered**: Generic forge abstraction is speculative; custom
API base and disabled TLS verification are excluded.

## Synchronization policy

**Decision**: Status checks remote best-effort but never fetches into authority;
sync happens only on explicit user intent.

**Rationale**: Hidden daily pull adds latency, mutation and conflict to ordinary
commands. A short actionable status preserves control.

**Alternatives considered**: First-command/day auto-sync is deferred; daemon and
periodic polling remain non-goals.
