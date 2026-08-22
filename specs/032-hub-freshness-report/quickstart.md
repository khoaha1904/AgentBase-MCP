# Quickstart: Hub Freshness Report

1. Configure or attach a local Hub and ensure it contains Repository concepts.
2. Run `node src/cli.ts okf hub freshness`.
3. Confirm the output identifies one exact Hub commit/layer and orders unknown
   Repository observations before the oldest observed entries.
4. Repeat through MCP `read_hub_freshness`; compare the report shape.
5. Confirm no source repository, provider, network or Hub file changed.
6. Run `npm run verify`.

