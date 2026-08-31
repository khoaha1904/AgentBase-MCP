# Finalize MCP contract delta

`finalize_hub_okf_proposal` adds an optional `change_accounting` array. It is ignored only by non-Refresh/legacy sessions with no captured changed paths.

Each item contains exactly:

```json
{
  "path": "src/auth/forgot-password.ts",
  "outcome": "new",
  "reason": "Creates the standalone password-reset interface documented by the changed source."
}
```

Rules:

- maximum 128 items;
- `path` is 1..512 characters and must exactly match one returned path;
- `outcome` is `updated`, `new`, `embedded`, `question` or `ignored`;
- `reason` is 1..512 non-whitespace characters;
- missing, duplicate or extra paths fail Finalize before proposal creation;
- `updated`, `new` and `embedded` require exact changed concept evidence.

Prepare continues to return `sourceChanges` unchanged. Successful inspection adds `changeAccounting` with normalized outcomes, `partial`, `omitted` and `limitations`.
