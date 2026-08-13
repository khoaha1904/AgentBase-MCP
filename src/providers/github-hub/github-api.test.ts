import assert from "node:assert/strict";
import { test } from "node:test";

import { createHubIdentity } from "../../core/hub/index.ts";
import { GitHubApiError, GitHubHubApi, type GitHubHttp } from "./index.ts";

function response(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
}

test("[AB-HUB-001][AB-HUB-013] GitHub adapter admits exact repository, ref and PR identities", async () => {
  const calls: string[] = [];
  const http: GitHubHttp = async (input, init) => {
    const url = String(input); calls.push(url);
    if (url.endsWith("/repos/agentbase/hub")) return response({ full_name: "agentbase/hub", default_branch: "main" });
    if (url.includes("/git/ref/heads/main")) return response({ object: { sha: "a".repeat(40) } });
    return response([{
      number: 7,
      html_url: "https://github.com/agentbase/hub/pull/7",
      head: { ref: "agentbase/okf-1", sha: "b".repeat(40), repo: { full_name: "agentbase/hub" } },
      base: { ref: "main" },
    }]);
  };
  const api = new GitHubHubApi(createHubIdentity("agentbase/hub", "main"), "canary", http);
  assert.equal((await api.getRepository()).fullName, "agentbase/hub");
  assert.equal((await api.getBranchRef("main")).commit, "a".repeat(40));
  assert.equal((await api.listOpenPullRequests("agentbase/okf-1"))[0]?.number, 7);
  assert.ok(calls.every((url) => url.startsWith("https://api.github.com/repos/agentbase/hub")));
});

test("[AB-HUB-002] permission failures and malformed responses redact the token", async () => {
  const token = "token-canary-never-return";
  const denied = new GitHubHubApi(createHubIdentity("agentbase/hub", "main"), token, async () => response({ message: token }, 403));
  await assert.rejects(denied.getRepository(), (error: GitHubApiError) => error.code === "PERMISSION" && !error.message.includes(token));
  const mismatch = new GitHubHubApi(createHubIdentity("agentbase/hub", "main"), token, async () => response({ full_name: "evil/hub", default_branch: "main" }));
  await assert.rejects(mismatch.getRepository(), (error: Error) => !error.message.includes(token) && /mismatch/.test(error.message));
});

test("[AB-HUB-013] PR creation admits exact head commit, base and canonical URL", async () => {
  const http: GitHubHttp = async (_input, init) => {
    const request = JSON.parse(String(init?.body)) as { head: string; base: string };
    return response({
      number: 8,
      html_url: "https://github.com/agentbase/hub/pull/8",
      head: { ref: request.head, sha: "c".repeat(40), repo: { full_name: "agentbase/hub" } },
      base: { ref: request.base },
    }, 201);
  };
  const api = new GitHubHubApi(createHubIdentity("agentbase/hub", "main"), "canary", http);
  const pull = await api.createPullRequest("agentbase/okf-2", "c".repeat(40), "OKF", "Reviewed proposal");
  assert.equal(pull.number, 8);
});

test("[AB-HUB-013] PR response from another head repository fails closed", async () => {
  const http: GitHubHttp = async () => response([{
    number: 10,
    html_url: "https://github.com/agentbase/hub/pull/10",
    head: { ref: "agentbase/okf-3", sha: "d".repeat(40), repo: { full_name: "fork/hub" } },
    base: { ref: "main" },
  }]);
  const api = new GitHubHubApi(createHubIdentity("agentbase/hub", "main"), "canary", http);
  await assert.rejects(api.listOpenPullRequests("agentbase/okf-3"), /identity mismatch/);
});
