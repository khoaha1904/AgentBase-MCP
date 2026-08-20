import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { expectedClientEntry, registerClients, RegistrationError } from "./client-registration.mjs";

const fakeSource = (client) => `#!/usr/bin/env node
const fs = require("node:fs"), path = require("node:path");
const client = ${JSON.stringify(client)}, args = process.argv.slice(2), home = process.env.HOME;
const file = client === "codex" ? path.join(process.env.CODEX_HOME || path.join(home, ".codex"), "config.toml") : path.join(home, ".claude.json");
const fail = process.env.FAKE_FAIL === client + ":" + (args.includes("remove") ? "remove" : args.includes("add") && !args.includes("--help") ? "add" : "none");
const read = () => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return client === "codex" ? { mcpServers: {}, unrelated: "stable" } : { mcpServers: {}, unrelated: "stable" }; } };
const write = value => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value)); };
if (args.includes("--help")) { console.log(client === "claude-code" ? "Usage: claude mcp add --scope" : "Usage: codex mcp add"); process.exit(0); }
if (args.includes("--version")) { console.log(client + " 1.0.0"); process.exit(0); }
const action = args[1];
if (action === "list" && client === "codex") { const entry = read().mcpServers.agentbase; console.log(JSON.stringify(entry ? [{ name: "agentbase", transport: entry }] : [])); process.exit(0); }
if (action === "get") { const entry = read().mcpServers.agentbase; if (!entry) process.exit(1); console.log("agentbase: configured"); process.exit(0); }
if (action === "add") { if (fail) process.exit(2); const marker = args.indexOf("--"), command = args[marker + 1], rest = args.slice(marker + 2), value = read(); value.mcpServers.agentbase = { type: process.env.FAKE_MISMATCH === client ? "http" : "stdio", command, args: rest, env: {} }; write(value); process.exit(0); }
if (action === "remove") { if (fail) { if (process.env.FAKE_REMOVE_NO_CHANGE !== client) { const value = read(); value.concurrent = "preserve"; write(value); } process.exit(2); } const value = read(); delete value.mcpServers.agentbase; write(value); process.exit(0); }
process.exit(3);
`;

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-registration-test-"));
  const home = path.join(root, "home"), bin = path.join(root, "bin"), checkout = path.join(root, "AgentBase-MCP");
  fs.mkdirSync(path.join(checkout, "src"), { recursive: true });
  fs.writeFileSync(path.join(checkout, "src", "cli.ts"), "// fixture\n");
  fs.mkdirSync(bin); fs.mkdirSync(home);
  fs.symlinkSync(process.execPath, path.join(bin, "node"));
  for (const [name, client] of [["codex", "codex"], ["claude", "claude-code"]]) fs.writeFileSync(path.join(bin, name), fakeSource(client), { mode: 0o755 });
  const environment = { HOME: home, XDG_CONFIG_HOME: path.join(root, "config"), CODEX_HOME: path.join(home, ".codex"), PATH: bin };
  return { root, home, checkout, environment, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function config(current, client) {
  const file = client === "codex" ? path.join(current.home, ".codex", "config.toml") : path.join(current.home, ".claude.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

test("[AB-INSTALL-007..011] registers each selected client with one exact absolute entry", async () => {
  for (const clients of [["codex"], ["claude-code"], ["codex", "claude-code"]]) {
    const current = fixture();
    try {
      const result = await registerClients({ clients, repositoryRoot: current.checkout, nodeExecutable: process.execPath, environment: current.environment });
      assert.equal(result.status, "registered");
      const expected = expectedClientEntry(current.checkout);
      for (const client of clients) {
        const entry = config(current, client).mcpServers.agentbase;
        assert.equal(entry.command, expected.command); assert.deepEqual(entry.args, expected.args); assert.equal(entry.type, "stdio");
      }
      assert.equal(fs.existsSync(path.join(current.environment.XDG_CONFIG_HOME, "agentbase-mcp", "registration")), false);
    } finally { current.cleanup(); }
  }
});

test("[AB-INSTALL-009..011] exact rerun is unchanged and conflict fails before another client mutation", async () => {
  const current = fixture();
  try {
    await registerClients({ clients: ["codex"], repositoryRoot: current.checkout, environment: current.environment });
    const before = fs.readFileSync(path.join(current.home, ".codex", "config.toml"));
    const rerun = await registerClients({ clients: ["codex"], repositoryRoot: current.checkout, environment: current.environment });
    assert.equal(rerun.clients.codex, "already-registered");
    assert.deepEqual(fs.readFileSync(path.join(current.home, ".codex", "config.toml")), before);
    const value = config(current, "codex"); value.mcpServers.agentbase.command = "/different/node";
    fs.writeFileSync(path.join(current.home, ".codex", "config.toml"), JSON.stringify(value));
    await assert.rejects(registerClients({ clients: ["codex", "claude-code"], repositoryRoot: current.checkout, environment: current.environment }), (error) => error instanceof RegistrationError && error.code === "ENTRY_CONFLICT");
    assert.equal(fs.existsSync(path.join(current.home, ".claude.json")), false);
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-008][AB-INSTALL-010] moved checkout and inherited environment are conflicts", async () => {
  const current = fixture();
  try {
    await registerClients({ clients: ["codex"], repositoryRoot: current.checkout, environment: current.environment });
    const moved = path.join(current.root, "moved-AgentBase-MCP");
    fs.cpSync(current.checkout, moved, { recursive: true });
    await assert.rejects(registerClients({ clients: ["codex"], repositoryRoot: moved, environment: current.environment }), (error) => error.code === "ENTRY_CONFLICT");
    const file = path.join(current.home, ".codex", "config.toml"), value = config(current, "codex");
    value.mcpServers.agentbase.env_vars = ["SECRET_SOURCE"];
    fs.writeFileSync(file, JSON.stringify(value));
    await assert.rejects(registerClients({ clients: ["codex"], repositoryRoot: current.checkout, environment: current.environment }), (error) => error.code === "ENTRY_CONFLICT");
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-012][AB-INSTALL-015] second-client failure rolls back the first addition", async () => {
  const current = fixture();
  try {
    await assert.rejects(registerClients({ clients: ["codex", "claude-code"], repositoryRoot: current.checkout, environment: { ...current.environment, FAKE_FAIL: "claude-code:add" } }), /MCP command failed/);
    assert.equal(config(current, "codex").mcpServers.agentbase, undefined);
    assert.equal(fs.existsSync(path.join(current.home, ".claude.json")), false);
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-012..014] verification failure rolls back and preserves unrelated values", async () => {
  const current = fixture();
  try {
    await assert.rejects(registerClients({ clients: ["codex"], repositoryRoot: current.checkout, environment: { ...current.environment, FAKE_MISMATCH: "codex" } }), /verification failed/);
    const value = config(current, "codex");
    assert.equal(value.mcpServers.agentbase, undefined); assert.equal(value.unrelated, "stable");
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-013..015] rollback failure preserves concurrent bytes and a private recovery receipt", async () => {
  const current = fixture();
  try {
    await assert.rejects(registerClients({ clients: ["codex", "claude-code"], repositoryRoot: current.checkout, environment: { ...current.environment, FAKE_FAIL: "codex:remove", FAKE_MISMATCH: "claude-code" } }), (error) => error.code === "ROLLBACK_FAILED");
    assert.equal(config(current, "codex").concurrent, "preserve");
    const receipt = path.join(current.environment.XDG_CONFIG_HOME, "agentbase-mcp", "registration", "install-registration.json");
    assert.equal(fs.statSync(receipt).mode & 0o777, 0o600);
    assert.equal(fs.readFileSync(receipt, "utf8").includes("TOKEN"), false);
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-009][AB-INSTALL-014] preflight is mutation-free and next run recovers before a different selection", async () => {
  const current = fixture();
  try {
    fs.rmSync(path.join(current.root, "bin", "claude"));
    await assert.rejects(registerClients({ clients: ["codex", "claude-code"], repositoryRoot: current.checkout, environment: current.environment }), (error) => error.code === "CLIENT_UNAVAILABLE");
    assert.equal(fs.existsSync(path.join(current.home, ".codex", "config.toml")), false);
    fs.writeFileSync(path.join(current.root, "bin", "claude"), fakeSource("claude-code"), { mode: 0o755 });
    await assert.rejects(registerClients({ clients: ["codex", "claude-code"], repositoryRoot: current.checkout, environment: { ...current.environment, FAKE_FAIL: "codex:remove", FAKE_MISMATCH: "claude-code" } }), (error) => error.code === "ROLLBACK_FAILED");
    const recovered = await registerClients({ clients: ["claude-code"], repositoryRoot: current.checkout, environment: current.environment });
    assert.equal(recovered.clients["claude-code"], "registered");
    assert.equal(config(current, "codex").mcpServers.agentbase, undefined);
  } finally { current.cleanup(); }
});

test("[AB-INSTALL-013][AB-INSTALL-014] guarded snapshot restore is exact and unsafe receipts fail closed", async () => {
  const current = fixture();
  try {
    const configFile = path.join(current.home, ".codex", "config.toml");
    fs.mkdirSync(path.dirname(configFile), { recursive: true });
    const original = JSON.stringify({ mcpServers: {}, unrelated: "exact-original" });
    fs.writeFileSync(configFile, original);
    await assert.rejects(registerClients({
      clients: ["codex"], repositoryRoot: current.checkout,
      environment: { ...current.environment, FAKE_FAIL: "codex:remove", FAKE_REMOVE_NO_CHANGE: "codex", FAKE_MISMATCH: "codex" },
    }), /verification failed/);
    assert.equal(fs.readFileSync(configFile, "utf8"), original);

    const directory = path.join(current.environment.XDG_CONFIG_HOME, "agentbase-mcp", "registration");
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    fs.writeFileSync(path.join(directory, "install-registration.json"), "{}\n", { mode: 0o644 });
    await assert.rejects(registerClients({ clients: ["codex"], repositoryRoot: current.checkout, environment: current.environment }), (error) => error.code === "RECOVERY_STATE_UNSAFE");
    assert.equal(fs.readFileSync(configFile, "utf8"), original);
  } finally { current.cleanup(); }
});
