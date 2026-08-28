# Plan

1. Add one storage resolver with fixed `config`, `hubs`, `state`, `cache` and
   `tmp` children and an explicit `AGENTBASE_HOME` isolation override.
2. Rewire existing Hub, provider and query defaults to the resolver without
   changing their public workflows or persisted Git model.
3. Preserve legacy XDG directories as untouched compatibility input and record
   migration as an explicit later action.
4. Update high/low-level design and run focused plus repository verification.
