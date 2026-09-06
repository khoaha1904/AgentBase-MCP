import assert from "node:assert/strict";
import test from "node:test";
import { callHubOkfTool } from "./mcp-tool-call.ts";
import { HUB_OKF_TOOLS, type HubToolActions } from "./mcp-tools.ts";
import { executeHubCli } from "../cli.ts";

test("[AB-PREPARED-PUBLISH-003..004] one MCP Publish routes modes and split outcomes; retired tools and CLI actions cannot execute", async () => {
  let calls = 0;
  for (const remote of ["published", "in-review", "unknown"] as const) {
    const actions = { publish: async (input) => {
      calls += 1;
      assert.equal(input.mode, "pr");
      return { proposalId: input.proposalId, commit: "c".repeat(40), remote, local: "pending" };
    } } as HubToolActions;
    const response = await callHubOkfTool("publish_hub_okf_proposal", {
      proposal_id: "a".repeat(24), proposal_digest: `sha256:${"b".repeat(64)}`, publication_mode: "pr",
    }, actions);
    assert.equal(Boolean(response.isError), remote !== "in-review");
  }
  assert.equal(calls, 3);
  for (const name of ["accept_hub_okf_proposal", "submit_hub_okf_proposals", "list_pending_hub_okf"]) {
    assert.equal(HUB_OKF_TOOLS.some((tool) => tool.name === name), false);
    const result = await callHubOkfTool(name, { proposal_id: "a".repeat(24) }, {} as HubToolActions);
    assert.equal(result.isError, true);
  }
  for (const command of ["accept", "pending", "submit"]) {
    assert.equal(await executeHubCli([command], {} as HubToolActions, () => {}, () => {}), 1);
  }
});
