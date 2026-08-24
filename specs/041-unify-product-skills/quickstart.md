# Quickstart: Verify the Unified Skill Catalog

1. Run the isolated product-skill installer test. A clean Codex and Claude home
   must each receive the eight entries in [catalog.md](contracts/catalog.md).
2. Validate every released skill directory with the repository skill check.
3. Inspect tool listing: it remains 42.
4. Review the query skill against five prompts:
   - domain purpose or ownership → Hub-first;
   - exact caller/implementation → Code-first;
   - why plus current implementation → combined;
   - unavailable Hub/graph → truthful partial result;
   - conflicting Hub/source → two attributed positions, no mutation.
5. Run `npm run verify`.

No model benchmark, real client configuration or remote operation is required.
