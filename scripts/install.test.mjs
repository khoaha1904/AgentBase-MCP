import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";

import { runInstaller } from "./install.mjs";

class TestInput extends PassThrough {
  isTTY = true;
  rawModes = [];
  setRawMode(value) { this.rawModes.push(value); }
}

function output() {
  let value = "";
  const stream = new Writable({ write(chunk, _encoding, callback) { value += chunk.toString(); callback(); } });
  stream.isTTY = true;
  return { stream, read: () => value };
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-installer-test-"));
  const home = path.join(root, "home"), xdg = path.join(root, "config");
  fs.mkdirSync(path.join(home, ".codex"), { recursive: true });
  fs.mkdirSync(path.join(home, ".claude"), { recursive: true });
  fs.writeFileSync(path.join(home, ".codex", "config.toml"), "codex-before\n");
  fs.writeFileSync(path.join(home, ".claude", "settings.json"), "claude-before\n");
  const environment = { HOME: home, XDG_CONFIG_HOME: xdg };
  return { root, home, environment, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test("[AB-INSTALL-001..004][SC-008] multi-select and masked paste prepare a credential without client mutation", async () => {
  const current = fixture(), input = new TestInput(), captured = output();
  try {
    const codexBefore = fs.readFileSync(path.join(current.home, ".codex", "config.toml"));
    const claudeBefore = fs.readFileSync(path.join(current.home, ".claude", "settings.json"));
    const pending = runInstaller({
      args: [], input, output: captured.stream, environment: current.environment,
      runDependencyInstall: async () => undefined,
    });
    input.end("12\nabc\n");
    const result = await pending;
    assert.deepEqual(result.clients, ["codex", "claude-code"]);
    assert.equal(result.credential, "created");
    assert.match(captured.read(), /\*\*\*/);
    assert.equal(captured.read().includes("abc"), false);
    assert.match(captured.read(), /registration: deferred/);
    assert.deepEqual(fs.readFileSync(path.join(current.home, ".codex", "config.toml")), codexBefore);
    assert.deepEqual(fs.readFileSync(path.join(current.home, ".claude", "settings.json")), claudeBefore);
    assert.deepEqual(input.rawModes, [true, false]);
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-002][AB-INSTALL-003] Backspace updates the mask and empty input stays local-only", async () => {
  const current = fixture(), input = new TestInput(), captured = output();
  try {
    const pending = runInstaller({ args: [], input, output: captured.stream, environment: current.environment, runDependencyInstall: async () => undefined });
    input.end("1\nabc\u007fd\n");
    const result = await pending;
    assert.equal(result.credential, "created");
    assert.equal(fs.readFileSync(path.join(current.environment.XDG_CONFIG_HOME, "agentbase-mcp", "env"), "utf8"), "AGENTBASE_HUB_GITHUB_TOKEN=abd\n");

    fs.rmSync(path.join(current.environment.XDG_CONFIG_HOME, "agentbase-mcp"), { recursive: true });
    const emptyInput = new TestInput(), emptyOutput = output();
    const empty = runInstaller({ args: [], input: emptyInput, output: emptyOutput.stream, environment: current.environment, runDependencyInstall: async () => undefined });
    emptyInput.end("2\n\n");
    assert.equal((await empty).credential, "skipped");
    assert.equal(fs.existsSync(path.join(current.environment.XDG_CONFIG_HOME, "agentbase-mcp", "env")), false);
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-002][AB-INSTALL-005] interruption restores terminal and preserves an existing credential", async () => {
  const current = fixture(), input = new TestInput(), captured = output();
  try {
    const credential = path.join(current.environment.XDG_CONFIG_HOME, "agentbase-mcp", "env");
    fs.mkdirSync(path.dirname(credential), { recursive: true, mode: 0o700 });
    fs.writeFileSync(credential, "AGENTBASE_HUB_GITHUB_TOKEN=stable\n", { mode: 0o600 });
    const pending = runInstaller({ args: ["--replace-token"], input, output: captured.stream, environment: current.environment, runDependencyInstall: async () => undefined });
    input.end("1\nnew\u0003");
    await assert.rejects(pending, /cancelled/);
    assert.equal(fs.readFileSync(credential, "utf8"), "AGENTBASE_HUB_GITHUB_TOKEN=stable\n");
    assert.deepEqual(input.rawModes, [true, false]);
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-002] EOF restores terminal state and writes no partial credential", async () => {
  const current = fixture(), input = new TestInput(), captured = output();
  try {
    const pending = runInstaller({ args: [], input, output: captured.stream, environment: current.environment, runDependencyInstall: async () => undefined });
    input.end("1\npartial");
    await assert.rejects(pending, /cancelled/);
    assert.deepEqual(input.rawModes, [true, false]);
    assert.equal(fs.existsSync(path.join(current.environment.XDG_CONFIG_HOME, "agentbase-mcp", "env")), false);
    assert.equal(captured.read().includes("partial"), false);
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-004][AB-INSTALL-006] installer rejects an unsafe existing credential instead of reporting preservation", async () => {
  const current = fixture(), input = new TestInput(), captured = output();
  try {
    const credential = path.join(current.environment.XDG_CONFIG_HOME, "agentbase-mcp", "env");
    fs.mkdirSync(path.dirname(credential), { recursive: true, mode: 0o700 });
    fs.writeFileSync(credential, "AGENTBASE_HUB_GITHUB_TOKEN=unsafe\n", { mode: 0o644 });
    const pending = runInstaller({ args: [], input, output: captured.stream, environment: current.environment, runDependencyInstall: async () => undefined });
    input.end("1\n");
    await assert.rejects(pending, /unsafe permissions/);
    assert.equal(captured.read().includes("preserved"), false);
    assert.equal(captured.read().includes("unsafe"), false);
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-003][AB-INSTALL-005] non-interactive mode never prompts or persists ambient token", async () => {
  const current = fixture(), input = new PassThrough(), captured = output();
  try {
    captured.stream.isTTY = false;
    let installs = 0;
    const result = await runInstaller({
      args: [], input, output: captured.stream,
      environment: { ...current.environment, AGENTBASE_HUB_GITHUB_TOKEN: "ambient-canary" },
      runDependencyInstall: async () => { installs += 1; },
    });
    assert.deepEqual(result.clients, []);
    assert.equal(result.credential, "skipped");
    assert.equal(installs, 1);
    assert.equal(captured.read().includes("ambient-canary"), false);
    assert.equal(fs.existsSync(path.join(current.environment.XDG_CONFIG_HOME, "agentbase-mcp", "env")), false);
  } finally { current.cleanup(); }
});
