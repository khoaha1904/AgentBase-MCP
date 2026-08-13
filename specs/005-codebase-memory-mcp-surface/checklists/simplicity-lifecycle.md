# Simplicity and Lifecycle Checklist

- [x] Codebase Memory remains the only graph builder.
- [x] Gateway uses official SDK rather than custom MCP framing.
- [x] Provider starts lazily, not on idle server startup.
- [x] One connection binds one repository and one provider child.
- [x] No home/root allowlist, recursive scan or multi-session registry exists.
- [x] Unsafe provider mutations are absent, not merely discouraged by prose.
- [x] Source persistence is rejected before a provider call.
- [x] Disconnect/error cleanup is idempotent and bounded.
- [x] Skill is a shim, not an installer or duplicated manual.
- [x] Watcher, daemon, HTTP, universal client setup and OKF stay deferred.
