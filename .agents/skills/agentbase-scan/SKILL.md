---
name: agentbase-scan
description: Inventory repositories under one explicit workspace and suggest AgentBase Ingest or Refresh work. Use when the user wants to see which local repositories are absent, current, changed, drafted, or already in review.
---

# AgentBase workspace scan

Ask for one explicit absolute workspace root if it is not already clear, then
call `scan_workspace_repositories` once. The scan is read-only: it does not read
source deeply, build Code Graphs, create proposals, synchronize, or publish.

Present the bounded repository inventory, its Published Hub classification and
the suggested next action. If no remote Hub is configured, explain that only
local Git roots were inventoried and Hub classification is unavailable.

Stop for user selection. Do not run Ingest or Refresh automatically. Route
selected new repositories to `agentbase-ingest` or `agentbase-batch-ingest`;
route selected published repositories to `agentbase-refresh` sequentially.
Never create a mixed Init/Refresh batch or Batch Refresh.
