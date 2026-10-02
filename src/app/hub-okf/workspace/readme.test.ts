import assert from "node:assert/strict";
import test from "node:test";

import { renderHubReadme } from "./readme.ts";

test("[AB-HUB-SETUP-006][AB-HOME-001] bootstrap README omits uninstalled CI paths and claims", () => {
  const readme = renderHubReadme(false);
  assert.doesNotMatch(readme, /\.agentbase\/ci|\.github\/workflows|Hub CI/);
  assert.match(readme, /shared\/index\.md/);
  assert.match(readme, /shared\/agentbase-profile\.md/);
});

test("[AB-HUB-CI-005] reviewed initialization README retains CI guidance by default", () => {
  assert.equal(renderHubReadme(), renderHubReadme(true));
  assert.match(renderHubReadme(), /\.github\/workflows/);
  assert.match(renderHubReadme(), /Hub CI checks structure/);
});
