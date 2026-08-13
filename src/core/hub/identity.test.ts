import assert from "node:assert/strict";
import test from "node:test";
import { assertHubRemote, createHubIdentity } from "./identity.ts";
test("[AB-HUB-001] derives one fixed GitHub remote and rejects overrides", () => {
  const hub = createHubIdentity("acme/agentbase-hub", "main");
  assert.equal(hub.canonicalHttpsUrl, "https://github.com/acme/agentbase-hub.git");
  assert.doesNotThrow(() => assertHubRemote(hub, hub.canonicalHttpsUrl));
  assert.throws(() => assertHubRemote(hub, "https://github.com/other/repo.git"));
  assert.throws(() => createHubIdentity("https://github.com/acme/hub", "main"));
});
