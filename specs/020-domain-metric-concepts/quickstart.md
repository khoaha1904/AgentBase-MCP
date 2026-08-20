# Quickstart: Domain and Metric Concepts

1. Run focused catalog and MCP schema tests:

   ```sh
   node --test src/core/knowledge/schema-catalog.test.ts src/app/codebase-memory-mcp/okf-schema-tools.test.ts
   ```

2. Run the authoring-skill contract test selected by the task plan.

3. Run canonical verification:

   ```sh
   npm run verify
   ```

Expected result: both new types select and validate, prior specialization and
unknown-type behavior remains green, the skill states exact target/index rules,
and no real model, network or Hub publication action occurs.
