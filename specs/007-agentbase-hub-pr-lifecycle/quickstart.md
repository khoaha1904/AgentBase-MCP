# Quickstart: AgentBase Hub PR Lifecycle

This guide describes the implemented offline workflow. Real GitHub qualification remains separate.

1. Configure a fixed disposable GitHub Hub identity, target branch and dedicated token in the MCP runtime.
2. Collect or select an exact evidence digest.
3. Prepare `new`; verify it returns a private bundle workspace and the remote is unchanged.
4. Let the coding agent author selected-schema Markdown there from Codebase Memory observations, then finalize and inspect the locked diff.
5. Submit the exact proposal ID/digest; verify one branch and one PR exist and target bytes are unchanged.
6. Prepare, author and finalize `refresh`; verify protected bytes and unknown fields survive.
7. Simulate PR API failure after push, then recover; verify the same remote commit gains exactly one PR.

Offline gate:

```bash
npm run verify
```

Real GitHub qualification remains separately authorized and must use a disposable test Hub or an explicitly approved configured repository.
