import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { loadGlobalHubToken, writeGlobalHubToken } from "./credential-file.ts";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-credential-test-"));
  const environment = { XDG_CONFIG_HOME: path.join(root, "config") } as NodeJS.ProcessEnv;
  const file = path.join(environment.XDG_CONFIG_HOME!, "agentbase-mcp", "env");
  return { root, environment, file, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test("[AB-INSTALL-004][AB-INSTALL-005] global credential is atomic, private, preserved and replaceable", () => {
  const current = fixture();
  try {
    assert.equal(writeGlobalHubToken("first-token", current.environment), "created");
    assert.equal(fs.statSync(path.dirname(current.file)).mode & 0o777, 0o700);
    assert.equal(fs.statSync(current.file).mode & 0o777, 0o600);
    assert.equal(loadGlobalHubToken(current.environment), "first-token");
    assert.equal(writeGlobalHubToken("ignored-token", current.environment), "preserved");
    assert.equal(loadGlobalHubToken(current.environment), "first-token");
    assert.equal(writeGlobalHubToken("second-token", current.environment, { replace: true }), "replaced");
    assert.equal(loadGlobalHubToken(current.environment), "second-token");
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-004][AB-INSTALL-006] unsafe credential state fails closed without secret disclosure", () => {
  const current = fixture();
  try {
    writeGlobalHubToken("token-canary-unsafe", current.environment);
    fs.chmodSync(current.file, 0o644);
    assert.throws(
      () => loadGlobalHubToken(current.environment),
      (error: unknown) => error instanceof Error && /permissions/.test(error.message) && !error.message.includes("canary"),
    );
    fs.chmodSync(current.file, 0o600);
    fs.chmodSync(path.dirname(current.file), 0o755);
    assert.throws(() => loadGlobalHubToken(current.environment), /directory has unsafe permissions/);
    fs.chmodSync(path.dirname(current.file), 0o700);
    fs.writeFileSync(current.file, "UNKNOWN=value\n", { mode: 0o600 });
    assert.throws(
      () => loadGlobalHubToken(current.environment),
      (error: unknown) => error instanceof Error && /format/.test(error.message) && !error.message.includes("value"),
    );
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-004] credential path falls back to the user config directory", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-credential-home-test-"));
  try {
    const environment = { HOME: root } as NodeJS.ProcessEnv;
    writeGlobalHubToken("home-token", environment);
    assert.equal(
      fs.readFileSync(path.join(root, ".config", "agentbase-mcp", "env"), "utf8"),
      "AGENTBASE_HUB_GITHUB_TOKEN=home-token\n",
    );
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-INSTALL-005] failed explicit replacement preserves prior credential bytes", () => {
  const current = fixture();
  try {
    writeGlobalHubToken("stable-token", current.environment);
    const before = fs.readFileSync(current.file);
    assert.throws(() => writeGlobalHubToken("bad\ntoken", current.environment, { replace: true }), /single-line/);
    assert.deepEqual(fs.readFileSync(current.file), before);
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-006] environment token takes precedence over the global credential", () => {
  const current = fixture();
  try {
    writeGlobalHubToken("file-token", current.environment);
    assert.equal(loadGlobalHubToken({ ...current.environment, AGENTBASE_HUB_GITHUB_TOKEN: "environment-token" }), "environment-token");
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-004][AB-INSTALL-006] symlinked credential paths are rejected", () => {
  const current = fixture();
  try {
    fs.mkdirSync(path.dirname(current.file), { recursive: true, mode: 0o700 });
    const outside = path.join(current.root, "outside");
    fs.writeFileSync(outside, "AGENTBASE_HUB_GITHUB_TOKEN=outside\n", { mode: 0o600 });
    fs.symlinkSync(outside, current.file);
    assert.throws(() => loadGlobalHubToken(current.environment), /symlink/);
    assert.throws(() => writeGlobalHubToken("replacement", current.environment, { replace: true }), /symlink/);
    fs.rmSync(current.file);
    fs.symlinkSync(path.join(current.root, "missing"), current.file);
    assert.throws(() => loadGlobalHubToken(current.environment), /symlink/);
    assert.throws(() => writeGlobalHubToken("replacement", current.environment), /symlink/);
  } finally { current.cleanup(); }
});
