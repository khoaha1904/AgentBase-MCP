---
name: agentbase-domain-site
description: Explicit-only AgentBase Domain-site export. Use only when the user names $agentbase-domain-site for one deliberate static Published Domain snapshot; never trigger from ordinary questions or focused diagram requests.
---

# Build a static AgentBase Domain site

This is a heavy explicit export, not a query response.

1. Resolve one exact Published Domain with `search_hub_okf` and
   `read_hub_okf_concept`. Never read Local Draft.
2. Tell the user that the generated directory copies Published knowledge and
   references into static files. Its repository and Pages visibility must be at
   least as restricted as the Hub. Obtain explicit acknowledgment and an
   absolute new or empty output directory before continuing.
3. Call `prepare_hub_visualization` once with `mode: domain-site`, the Domain,
   output directory and `visibility_acknowledged: true`. Pass the stable
   `domains/<slug>` selector; the generated Profile snapshot exposes the actual
   Domain concept and separate home/participation/boundary labels.
4. Report the exact commit, output directory, `agentbase-build.json` receipt and
   the warning that this is a fixed snapshot which must be regenerated to
   update.

Do not create a Domain-Hub repository, push, configure Pages, overwrite a
non-empty directory, start a watcher/server, or automatically rebuild. Local
preview is optional and remains the user's explicit follow-up action.
