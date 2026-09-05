import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  clientEntriesEqual,
  createReleaseClientAdapter,
  isRecognizedCheckoutClientEntry,
  stableClientEntry,
} from "./client-registration.mjs";

const clientDouble = `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const client = path.basename(process.argv[1]);
const codex = client === "codex";
const file = codex ? path.join(process.env.CODEX_HOME, "config.toml") : path.join(process.env.HOME, ".claude.json");
const args = process.argv.slice(2);
const read = () => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
const entry = () => codex ? read().agentbase : read().mcpServers?.agentbase;
const writeEntry = (value) => {
  const state = read();
  if (codex) value ? state.agentbase = value : delete state.agentbase;
  else { state.mcpServers ??= {}; value ? state.mcpServers.agentbase = value : delete state.mcpServers.agentbase; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state));
};
if (args.length === 1 && args[0] === "--version") process.stdout.write(client + " 1.0.0\\n");
else if (args.join(" ") === "mcp add --help") process.stdout.write(codex ? "Usage: codex mcp add\\n" : "Usage: claude mcp add --scope user\\n");
else if (codex && args.join(" ") === "mcp list --json") {
  const value = entry();
  process.stdout.write(JSON.stringify(value ? [{ name: "agentbase", transport: { type: "stdio", command: value.command, args: value.args, env: {}, env_vars: [] } }] : []));
} else if (!codex && args.join(" ") === "mcp get agentbase") {
  if (!entry()) process.exitCode = 1; else process.stdout.write("agentbase\\n");
} else if (args[0] === "mcp" && args[1] === "add") {
  const separator = args.indexOf("--");
  writeEntry({ type: "stdio", command: args[separator + 1], args: args.slice(separator + 2), env: {} });
} else if (args[0] === "mcp" && args[1] === "remove") writeEntry(undefined);
else process.exitCode = 2;
`;

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-client-registration-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const bin = path.join(root, "bin");
  fs.mkdirSync(bin, { recursive: true });
  for (const name of ["codex", "claude"]) fs.writeFileSync(path.join(bin, name), clientDouble, { mode: 0o700 });
  const environment = {
    ...process.env,
    HOME: path.join(root, "home"),
    CODEX_HOME: path.join(root, "codex-home"),
    PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}`,
  };
  fs.mkdirSync(environment.HOME, { recursive: true });
  return { root, environment };
}

test("[AB-INTEGRATION-002..006][AB-INTEGRATION-014] manages exact stable entries through supported client commands", async (t) => {
  const value = fixture(t), adapter = createReleaseClientAdapter(value.environment);
  const expected = stableClientEntry(path.join(value.root, "agentbase", "bin", "abs"));
  for (const client of ["codex", "claude-code"]) {
    assert.equal(await adapter.inspect(client), undefined);
    await adapter.transition(client, undefined, expected);
    assert.equal(clientEntriesEqual(await adapter.inspect(client), expected), true);
  }
  for (const client of ["codex", "claude-code"]) {
    await adapter.transition(client, expected, undefined);
    assert.equal(await adapter.inspect(client), undefined);
  }
});

test("[AB-INTEGRATION-004][AB-INTEGRATION-014] recognizes only a complete checkout registration identity", (t) => {
  const value = fixture(t), checkout = path.join(value.root, "checkout");
  const entrypoint = path.join(checkout, "src", "cli.ts");
  fs.mkdirSync(path.dirname(entrypoint), { recursive: true });
  fs.writeFileSync(entrypoint, "// AgentBase checkout\n");
  fs.writeFileSync(path.join(checkout, "package.json"), `${JSON.stringify({
    name: "agentbase-mcp", type: "module", bin: { abs: "./src/cli.ts" },
  })}\n`);
  const legacy = {
    transport: "stdio",
    command: fs.realpathSync(process.execPath),
    args: [entrypoint, "mcp"],
    env: {},
    envVars: [],
  };
  assert.equal(isRecognizedCheckoutClientEntry(legacy), true);
  assert.equal(isRecognizedCheckoutClientEntry({ ...legacy, env: { TOKEN: "value" } }), false);
  assert.equal(isRecognizedCheckoutClientEntry({ ...legacy, args: [entrypoint, "other"] }), false);
  fs.writeFileSync(path.join(checkout, "package.json"), `${JSON.stringify({ name: "other-product", type: "module",
    bin: { abs: "./src/cli.ts" } })}\n`);
  assert.equal(isRecognizedCheckoutClientEntry(legacy), false);
});
