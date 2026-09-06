# Codebase Memory contracts

This directory contains the provider tool manifest that AgentBase explicitly
accepts and pins.

- `v0.10.8/` defines the accepted repository-owned provider surface.

Runtime admission checks this exact private provider surface. The AgentBase MCP
application selects its approved graph tools from the same manifest, replaces
the indexing schema with its narrower public contract, removes provider-only
diagnostics, preserves required coverage selection and adds explicit read/write
annotations. This file is an AgentBase contract, not test data and not part of
the immutable upstream source under `vendor/codebase-memory/`.

Regenerate a manifest only through the provider qualification workflow and
review schema changes before replacing an accepted version.
