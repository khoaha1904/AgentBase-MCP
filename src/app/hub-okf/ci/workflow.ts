import { createHash } from "node:crypto";

export const HUB_CI_WORKFLOW_PATH = ".github/workflows/agentbase-hub.yml" as const;
export const HUB_CI_FORMAT_VERSION = 1 as const;
export const HUB_CI_AGENTBASE_RELEASE = "v0.1.0-rc.1" as const;

const CHECKOUT_COMMIT = "11d5960a326750d5838078e36cf38b85af677262";
const SETUP_NODE_COMMIT = "49933ea5288caeca8642d1e84afbd3f7d6820020";

export function renderHubCiWorkflow(): string {
  return `name: AgentBase Hub CI

on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: "17 3 * * 1"
  workflow_dispatch:

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Hub
        uses: actions/checkout@${CHECKOUT_COMMIT}
        with:
          path: hub
          persist-credentials: false
      - name: Checkout AgentBase-MCP
        uses: actions/checkout@${CHECKOUT_COMMIT}
        with:
          repository: khoaha1904/AgentBase-MCP
          ref: ${HUB_CI_AGENTBASE_RELEASE}
          path: agentbase-mcp
          persist-credentials: false
      - name: Use Node.js 24
        uses: actions/setup-node@${SETUP_NODE_COMMIT}
        with:
          node-version: "24.12.0"
          cache: npm
          cache-dependency-path: agentbase-mcp/package-lock.json
      - name: Install pinned validator dependencies
        run: npm ci --ignore-scripts --prefix agentbase-mcp
      - name: Validate Hub and report freshness
        run: node agentbase-mcp/src/cli.ts okf hub-ci --root hub --format github >> "$GITHUB_STEP_SUMMARY"
`;
}

export function hubCiWorkflowDigest(): string {
  return `sha256:${createHash("sha256").update(renderHubCiWorkflow()).digest("hex")}`;
}

