import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { lifecyclePaths, runApplicationLifecycle } from "./release-lifecycle.mjs";

const sourceControl = import.meta.dirname;

function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-lifecycle-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = { ...process.env, HOME: path.join(root, "home"), AGENTBASE_HOME: path.join(root, "agentbase") };
  fs.mkdirSync(environment.HOME, { recursive: true });
  const releases = path.join(root, "candidates");
  const createRelease = (version) => {
    const id = `agentbase-mcp-${version}-${process.platform}-${process.arch}`;
    const releaseRoot = path.join(releases, id);
    fs.mkdirSync(path.join(releaseRoot, "src"), { recursive: true });
    fs.mkdirSync(path.join(releaseRoot, "scripts", "installation"), { recursive: true });
    fs.writeFileSync(path.join(releaseRoot, "fixture.json"), `${JSON.stringify({ release_id: id })}\n`);
    fs.writeFileSync(path.join(releaseRoot, "src", "cli.ts"), `process.stdout.write(${JSON.stringify(`${id}\n`)});\n`);
    for (const name of [
      "client-registration.mjs",
      "product-skills.mjs",
      "release-bundle.mjs",
      "release-control.mjs",
      "release-integration.mjs",
      "release-lifecycle.mjs",
    ]) {
      fs.copyFileSync(path.join(sourceControl, name), path.join(releaseRoot, "scripts", "installation", name));
    }
    return releaseRoot;
  };
  const verifyRelease = async (releaseRoot, expected = {}) => {
    const manifest = JSON.parse(fs.readFileSync(path.join(releaseRoot, "fixture.json"), "utf8"));
    if (expected.releaseId && expected.releaseId !== manifest.release_id) throw new Error("fixture release identity changed");
    return { ...manifest, runtime: { lifecycle_api: 1 } };
  };
  return { root, environment, paths: lifecyclePaths(environment), createRelease, verifyRelease };
}

function pointer(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").trim() : null;
}

test("[AB-LIFECYCLE-001..008][AB-LIFECYCLE-010..012] installs, upgrades, rolls back and uninstalls immutable application releases", async (t) => {
  const value = fixture(t), firstRoot = value.createRelease("0.1.0"), secondRoot = value.createRelease("0.2.0");
  const firstId = path.basename(firstRoot), secondId = path.basename(secondRoot);
  const options = { environment: value.environment, verifyRelease: value.verifyRelease, integration: false };

  assert.deepEqual(await runApplicationLifecycle("install", { ...options, releaseRoot: firstRoot }), {
    status: "installed", current: firstId, previous: null,
  });
  assert.equal(pointer(value.paths.current), firstId);
  assert.equal(fs.readlinkSync(value.paths.commandLink), value.paths.launcher);
  const launched = spawnSync(value.paths.launcher, [], { encoding: "utf8", env: value.environment });
  assert.equal(launched.status, 0);
  assert.equal(launched.stdout, `${firstId}\n`);
  assert.equal((await runApplicationLifecycle("install", { ...options, releaseRoot: firstRoot })).status, "already-installed");

  assert.deepEqual(await runApplicationLifecycle("upgrade", { ...options, releaseRoot: secondRoot }), {
    status: "upgraded", current: secondId, previous: firstId,
  });
  assert.deepEqual(fs.readdirSync(value.paths.releases).sort(), [firstId, secondId].sort());
  assert.deepEqual(await runApplicationLifecycle("rollback", options), {
    status: "rolled-back", current: firstId, previous: secondId,
  });
  assert.equal(pointer(value.paths.current), firstId);

  for (const durable of ["config", "hubs", "state"]) {
    fs.mkdirSync(path.join(value.paths.root, durable), { recursive: true });
    fs.writeFileSync(path.join(value.paths.root, durable, "preserved"), "owner data\n");
  }
  assert.equal((await runApplicationLifecycle("uninstall", options)).status, "uninstalled");
  assert.equal(fs.existsSync(value.paths.launcher), false);
  assert.equal(fs.existsSync(value.paths.commandLink), false);
  assert.equal(fs.existsSync(value.paths.control), false);
  assert.equal(fs.existsSync(value.paths.releases), false);
  for (const durable of ["config", "hubs", "state"]) {
    assert.equal(fs.readFileSync(path.join(value.paths.root, durable, "preserved"), "utf8"), "owner data\n");
  }
});

test("[AB-LIFECYCLE-003..004][AB-LIFECYCLE-009][AB-LIFECYCLE-012] restores pre-commit state and resumes committed uninstall", async (t) => {
  const value = fixture(t), firstRoot = value.createRelease("0.1.0"), secondRoot = value.createRelease("0.2.0");
  const firstId = path.basename(firstRoot), secondId = path.basename(secondRoot);
  const options = { environment: value.environment, verifyRelease: value.verifyRelease, integration: false };
  await runApplicationLifecycle("install", { ...options, releaseRoot: firstRoot });

  await assert.rejects(runApplicationLifecycle("upgrade", {
    ...options,
    releaseRoot: secondRoot,
    afterPhase(phase) { if (phase === "cutover") throw new Error("injected interruption"); },
  }), /injected interruption/);
  assert.equal(pointer(value.paths.current), firstId);
  assert.equal(pointer(value.paths.previous), null);
  assert.equal(fs.existsSync(path.join(value.paths.releases, secondId)), false);
  assert.equal(fs.existsSync(value.paths.receipt), false);

  await assert.rejects(runApplicationLifecycle("uninstall", {
    ...options,
    afterPhase(phase) { if (phase === "committed") throw new Error("committed interruption"); },
  }), /committed interruption/);
  assert.equal(fs.existsSync(value.paths.receipt), true);
  const resumed = await runApplicationLifecycle("uninstall", options);
  assert.equal(resumed.status, "already-uninstalled");
  assert.equal(fs.existsSync(value.paths.receipt), false);
});

test("[AB-LIFECYCLE-002..003][AB-LIFECYCLE-008][AB-LIFECYCLE-012] rejects live locks and managed-path drift", async (t) => {
  const value = fixture(t), firstRoot = value.createRelease("0.1.0");
  const options = { environment: value.environment, verifyRelease: value.verifyRelease, integration: false };
  await runApplicationLifecycle("install", { ...options, releaseRoot: firstRoot });
  fs.writeFileSync(value.paths.lock, `${JSON.stringify({ schema: 1, pid: process.pid, token: "live", operation: "upgrade" })}\n`, { mode: 0o600 });
  await assert.rejects(runApplicationLifecycle("rollback", options), /already running/);
  fs.rmSync(value.paths.lock);

  fs.writeFileSync(value.paths.lock, `${JSON.stringify({ schema: 1, pid: 2_147_483_647, token: "stale", operation: "upgrade" })}\n`, { mode: 0o600 });
  await assert.rejects(runApplicationLifecycle("rollback", options), /requires current and previous/);
  assert.equal(fs.existsSync(value.paths.lock), false);

  fs.rmSync(value.paths.commandLink);
  fs.writeFileSync(value.paths.commandLink, "unmanaged\n");
  await assert.rejects(runApplicationLifecycle("uninstall", options), /unmanaged path/);
  assert.equal(fs.existsSync(value.paths.releases), true);
});
