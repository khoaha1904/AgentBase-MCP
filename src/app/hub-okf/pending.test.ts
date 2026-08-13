import assert from "node:assert/strict";
import test from "node:test";

import { createHubIdentity, createLocalHubState } from "../../core/hub/index.ts";
import type { GitRequest } from "../../providers/github-hub/index.ts";
import { listPendingHubProposals, selectPendingPrefix } from "./pending.ts";

function message(id: string, subject: string, source: string): string {
  return [
    `AgentBase-Proposal-ID: ${id}`,
    `AgentBase-Subject: ${subject}`,
    `AgentBase-Source-ID: ${source}`,
    `AgentBase-Evidence-Digest: sha256:${"d".repeat(64)}`,
    `AgentBase-Diff-Digest: sha256:${"e".repeat(64)}`,
    "AgentBase-Schema-Catalog: 2.0.0",
    "",
  ].join("\n");
}

test("[AB-LOCAL-HUB-005][AB-LOCAL-HUB-006] pending inventory follows ancestry and safe prefix order", async () => {
  const base = "a".repeat(40), first = "b".repeat(40), second = "c".repeat(40);
  const localHub = createLocalHubState({
    root: "/private/AgentBase-Hub",
    hub: createHubIdentity("acme/AgentBase-Hub", "main"),
    remoteBase: base, activeHead: second, catalogVersion: "2.0.0",
  });
  const messages = new Map([
    [first, message("1".repeat(24), "repositories/a", "repository-a-aaaaaaaaaaaa")],
    [second, message("2".repeat(24), "repositories/b", "repository-b-bbbbbbbbbbbb")],
  ]);
  const git = async (request: GitRequest) => {
    if (request.args[0] === "rev-list") return { stdout: `${first}\n${second}\n`, stderr: "" };
    if (request.args[0] === "show") return { stdout: messages.get(String(request.args[3])) ?? "", stderr: "" };
    if (request.args[0] === "rev-parse") return { stdout: `${String(request.args[2]).startsWith(second) ? first : base}\n`, stderr: "" };
    return { stdout: " 1 file changed, 1 insertion(+)\n", stderr: "" };
  };
  const pending = await listPendingHubProposals(localHub, git);
  assert.deepEqual(pending.map((item) => item.subject), ["repositories/a", "repositories/b"]);
  assert.deepEqual(selectPendingPrefix(pending, [pending[0]!.id]), [pending[0]]);
  assert.throws(() => selectPendingPrefix(pending, [pending[1]!.id]), /contiguous/);
});
