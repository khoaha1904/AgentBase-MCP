# Data Model: Install Product Skills

- **Product skill**: one allowlisted name and its repository source directory.
- **Client destination**: selected client ID and user-scope skills directory.
- **Installation result**: per-client installed/already-installed state plus the
  exact paths created by the current run for bounded rollback.

No durable manifest or new application state is introduced.
