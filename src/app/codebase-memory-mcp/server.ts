import path from "node:path";

import { fromJsonSchema, McpServer, type CallToolResult, type Transport } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

import { callHubOkfTool, HUB_OKF_TOOLS, tryCreateHubRuntimeActions, type HubOkfToolName, type HubToolActions } from "../hub-okf/index.ts";
import { GatewaySession, type GatewaySessionOptions } from "./gateway-session.ts";
import { SAFE_TOOLS } from "./tool-manifest.ts";
import { callOkfSchemaTool, OKF_SCHEMA_TOOLS, type OkfSchemaToolName } from "./okf-schema-tools.ts";

export type AgentBaseMcpServer = Readonly<{
  server: McpServer;
  gateway: GatewaySession;
  connect(transport: Transport): Promise<void>;
  close(): Promise<void>;
}>;

export function createAgentBaseMcpServer(options: GatewaySessionOptions & Readonly<{ hubActions?: HubToolActions }>): AgentBaseMcpServer {
  const gateway = new GatewaySession(options);
  const server = new McpServer({ name: "agentbase-codebase-memory", version: "0.0.0" });
  for (const tool of HUB_OKF_TOOLS) {
    server.registerTool(tool.name, { description: tool.description, inputSchema: fromJsonSchema(tool.inputSchema) },
      async (argumentsValue): Promise<CallToolResult> => callHubOkfTool(
        tool.name as HubOkfToolName,
        argumentsValue as Record<string, unknown>,
        options.hubActions,
      ));
  }
  for (const tool of OKF_SCHEMA_TOOLS) {
    server.registerTool(tool.name, { description: tool.description, inputSchema: fromJsonSchema(tool.inputSchema) },
      async (argumentsValue): Promise<CallToolResult> => callOkfSchemaTool(tool.name as OkfSchemaToolName, argumentsValue as Record<string, unknown>));
  }
  for (const tool of SAFE_TOOLS) {
    server.registerTool(tool.name, {
      ...(tool.title === undefined ? {} : { title: tool.title }),
      ...(tool.description === undefined ? {} : { description: tool.description }),
      inputSchema: fromJsonSchema(tool.inputSchema),
      ...(tool.annotations === undefined ? {} : { annotations: tool.annotations }),
    }, async (argumentsValue): Promise<CallToolResult> => gateway.call(tool.name, argumentsValue as Record<string, unknown>));
  }
  const priorClose = server.server.onclose;
  server.server.onclose = () => {
    priorClose?.();
    void gateway.close();
  };
  let closePromise: Promise<void> | undefined;
  return {
    server,
    gateway,
    connect: (transport) => server.connect(transport),
    close() {
      closePromise ??= (async () => { await gateway.close(); await server.close(); })();
      return closePromise;
    },
  };
}

export async function serveCodebaseMemoryMcp(projectRoot = path.resolve(import.meta.dirname, "../../..")): Promise<AgentBaseMcpServer> {
  const hubActions = tryCreateHubRuntimeActions();
  const current = createAgentBaseMcpServer({ projectRoot, ...(hubActions ? { hubActions } : {}) });
  await current.connect(new StdioServerTransport(process.stdin, process.stdout, { maxBufferSize: 4_000_000 }));
  return current;
}
