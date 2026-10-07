import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-stdio-smoke-")));
const client = new Client({ name: "source-stdio-smoke", version: "0.0.0" });
try {
  const transport = new StdioClientTransport({ command: process.execPath,
    args: [path.resolve(import.meta.dirname, "../../src/cli.ts"), "mcp"],
    env: { ...process.env, HOME: home, USERPROFILE: home, AGENTBASE_HOME: path.join(home, "data") }, stderr: "pipe" });
  transport.stderr?.on("data", () => {});
  await client.connect(transport);
  const tools = await client.listTools();
  if (tools.tools.length !== 36 || !tools.tools.some((tool) => tool.name === "search_hub_okf")) throw new Error("Tool surface mismatch");
  console.log(`MCP stdio ready: ${tools.tools.length} tools`);
} finally {
  await client.close();
  fs.rmSync(home, { recursive: true, force: true });
}
