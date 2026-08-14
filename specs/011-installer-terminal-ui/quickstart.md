# Quickstart: Installer Terminal UI

```bash
node --test scripts/install.test.mjs
npm run verify
```

The focused suite must cover arrow sequences delivered together and split across
chunks, Space toggles, empty validation, cyan/no-color transcripts, 40-column and
dumb-terminal output, token masking/preservation, cursor/raw restoration,
completion results and non-interactive plain output. Tests use doubles and do not
register real clients.
