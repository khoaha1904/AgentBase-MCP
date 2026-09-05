import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { qualifyRelease, resolveCiReleaseIdentity } from "./qualify-release.mjs";

function git(root, args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}

function repository(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-ci-release-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  git(root, ["init", "--quiet"]);
  fs.writeFileSync(path.join(root, "tracked.txt"), "release\n");
  git(root, ["add", "tracked.txt"]);
  git(root, ["-c", "user.name=AgentBase Test", "-c", "user.email=test@agentbase.invalid", "commit", "--quiet", "-m", "release"]);
  git(root, ["tag", "v0.1.0"]);
  const commit = git(root, ["rev-parse", "HEAD"]);
  return {
    root,
    environment: {
      ...process.env,
      GITHUB_ACTIONS: "true",
      GITHUB_REF: "refs/tags/v0.1.0",
      GITHUB_REF_NAME: "v0.1.0",
      GITHUB_REF_TYPE: "tag",
      GITHUB_SHA: commit,
    },
  };
}

test("[AB-RELEASE-CI-005..006][AB-RELEASE-CI-008][AB-RELEASE-CI-011..012] admits one exact CI tag and verifies before qualified build", async (t) => {
  const fixture = repository(t), calls = [];
  assert.equal(resolveCiReleaseIdentity(fixture.root, fixture.environment).tag, "v0.1.0");
  const result = await qualifyRelease({
    projectRoot: fixture.root,
    outputDirectory: path.join(fixture.root, "ignored"),
    target: "linux-x64",
    environment: fixture.environment,
    runVerification: () => { calls.push("verify"); },
    buildArtifact: (options) => {
      calls.push("build");
      assert.equal(options.qualified, true);
      assert.equal(options.target, "linux-x64");
      return { archive: "archive", outerChecksum: "checksum" };
    },
  });
  assert.deepEqual(calls, ["verify", "build"]);
  assert.deepEqual(result, { archive: "archive", outerChecksum: "checksum" });

  assert.throws(() => resolveCiReleaseIdentity(fixture.root, {
    ...fixture.environment,
    GITHUB_REF: "refs/heads/company-transfer",
    GITHUB_REF_NAME: "company-transfer",
    GITHUB_REF_TYPE: "branch",
  }), /exact GitHub Actions tag/);
});

test("[AB-RELEASE-CI-005][AB-RELEASE-CI-011..012] rejects source drift before publishing output", async (t) => {
  const fixture = repository(t);
  await assert.rejects(qualifyRelease({
    projectRoot: fixture.root,
    outputDirectory: path.join(fixture.root, "ignored"),
    target: "linux-x64",
    environment: fixture.environment,
    runVerification: () => fs.appendFileSync(path.join(fixture.root, "tracked.txt"), "drift\n"),
    buildArtifact: () => assert.fail("builder must not run after verification drift"),
  }), /clean Git worktree/);
});
