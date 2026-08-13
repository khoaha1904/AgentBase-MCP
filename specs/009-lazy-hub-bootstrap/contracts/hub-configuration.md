# Contract: Lazy Hub Configuration

## Status

Status is always available and returns exactly one kind:

- `unconfigured`: no active Hub; includes setup choices `existing` and `new`;
- `local-only`: exact local ID/root/base/active head and pending count, no remote;
- `remote`: the same local fields plus exact GitHub repository and `main`.

No status result contains the token or credential-file content.

## Configure existing

Input:

- mode `existing`
- exact GitHub HTTPS repository URL

Outcome:

- clone into owned private staging;
- validate canonical origin, clean `main`, conformant Hub root and exact base;
- atomically admit local directory and global configuration;
- leave no admitted config on failure.

## Configure new

Input:

- mode `new`

Outcome:

- create one owned local Git repository with no remote;
- commit explanatory `README.md` and OKF v0.2 `index.md` as one classified base;
- atomically admit global configuration;
- perform no network request.

## Guards

- Existing active configuration rejects configure calls.
- URL credentials, query, fragment, wrong scheme/host or extra components fail.
- Tool/CLI inputs never accept token, local-root override, target override,
  force, switching or repository-creation options.
