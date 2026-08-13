# CLI Contract: AgentBase Hub

The root CLI may present the same explicit workflow for local/operator use:

```text
node src/cli.ts okf hub prepare --mode new|refresh --repo <absolute-root> --evidence <digest>
node src/cli.ts okf hub finalize --session <id>
node src/cli.ts okf hub inspect --proposal <id>
node src/cli.ts okf hub submit --proposal <id> --digest <proposal-digest>
node src/cli.ts okf hub recover --proposal <id>
```

Hub identity, target and token are never command arguments. Prepare/inspect produce no remote writes. Submit/recover follow the MCP contract and return no secret-bearing output.
