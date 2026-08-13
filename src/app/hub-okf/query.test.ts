import assert from "node:assert/strict";
import test from "node:test";

import { createHubIdentity, createLocalHubState } from "../../core/hub/index.ts";
import type { GitRequest } from "../../providers/github-hub/index.ts";
import { readActiveHubConcept, searchActiveHub } from "./query.ts";

test("[AB-LOCAL-HUB-004][AB-QUERY-001] query reads the accepted commit, never workspace bytes", async () => {
  const head = "a".repeat(40);
  const localHub = createLocalHubState({
    root: "/private/AgentBase-Hub",
    hub: createHubIdentity("acme/AgentBase-Hub", "main"),
    remoteBase: "b".repeat(40), activeHead: head, catalogVersion: "2.0.0",
  });
  const calls: GitRequest[] = [];
  const git = async (request: GitRequest) => {
    calls.push(request);
    return request.args[0] === "ls-tree"
      ? { stdout: "repositories/orders/service.md\0", stderr: "" }
      : { stdout: "# Orders service\nAccepted pending business knowledge.\n", stderr: "" };
  };
  assert.equal((await searchActiveHub(localHub, "business", {}, git))[0]?.commit, head);
  assert.match((await readActiveHubConcept(localHub, "repositories/orders/service.md", git)).excerpt, /Accepted/);
  assert.ok(calls.every((call) => call.args.some((argument) => argument.includes(head))));
  assert.ok(calls.every((call) => !call.args.includes("--work-tree")));
});
