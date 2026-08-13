import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { acquireHubMutationLock, releaseHubMutationLock } from "./proposal-state.ts";

test("[AB-LOCAL-HUB-011] concurrent local Hub mutation fails under one owner lock", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-lock-"));
  try {
    const first = acquireHubMutationLock(root, "accept:11111111");
    assert.throws(() => acquireHubMutationLock(root, "publish:22222222"), /another.*lock/);
    releaseHubMutationLock(first);
    const second = acquireHubMutationLock(root, "publish:22222222");
    assert.equal(second.ownerId, "publish:22222222");
    releaseHubMutationLock(second);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
