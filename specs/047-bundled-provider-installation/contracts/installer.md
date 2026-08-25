# Installer contract

## Ordinary user command

```text
./install.sh
```

The command requires approved Node.js and an internal npm registry. It does not
require or invoke a compiler, Make, zlib development package, provider download
or provider source build.

Order:

1. validate Node and internal npm authority;
2. install exact npm dependencies from that registry;
3. select, verify and activate the bundled provider for the current target;
4. in an interactive terminal, install selected product skills and register the
   `agentbase` MCP entry transactionally.

Provider failure occurs before step 4 and names the unavailable/invalid release
target without modifying selected clients.

## Maintainer command

```text
npm run package:codebase-memory
```

This explicit command may require compiler, Make and platform-native development
libraries. It builds and verifies the pinned patched provider, then replaces
only `vendor/codebase-memory/artifacts/<current-target>/` atomically.

It is not run by ordinary installation, MCP startup or update checks.
