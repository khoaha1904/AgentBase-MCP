import path from "node:path";

import { fromJsonSchema, McpServer, type CallToolResult, type Transport } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

import {
  callHubOkfTool, createHubRuntimeActions, defaultHubRuntimeStateRoot, HUB_OKF_TOOLS,
  type HubOkfToolName, type HubToolActions,
} from "../hub-okf/index.ts";
import { DiscoverySession } from "./discovery-session.ts";
import { GatewaySession, type GatewaySessionOptions } from "./gateway-session.ts";
import { SAFE_TOOLS } from "./tool-manifest.ts";
import { callOkfSchemaTool, OKF_SCHEMA_TOOLS, type OkfSchemaToolName } from "./okf-schema-tools.ts";
import { AGENTBASE_MCP_SERVER_OPTIONS, modernToolInputSchema } from "./protocol-policy.ts";

export type AgentBaseMcpServer = Readonly<{
  server: McpServer;
  gateway: GatewaySession;
  discovery: DiscoverySession;
  connect(transport: Transport): Promise<void>;
  close(): Promise<void>;
}>;

export function createAgentBaseMcpServer(options: GatewaySessionOptions & Readonly<{
  hubActions?: HubToolActions;
  hubStateRoot?: string;
}>): AgentBaseMcpServer {
  const hubStateRoot = options.hubStateRoot ?? defaultHubRuntimeStateRoot();
  const discovery = options.discoverySession ?? new DiscoverySession(hubStateRoot);
  const gateway = new GatewaySession({ ...options, discoverySession: discovery });
  const hubActions = options.hubActions ?? createHubRuntimeActions(process.env, hubStateRoot, {
    onSourceSnapshot: (snapshot, mode, authority) => discovery.arm(snapshot, mode, authority),
    discoveryReceiptResolver: (id) => discovery.resolveReceipt(id),
    discoveryReceiptRebaser: (id, publishedBase) => discovery.rebaseReceipt(id, publishedBase),
  });
  const server = new McpServer({ name: "agentbase-codebase-memory", version: "0.0.0" }, AGENTBASE_MCP_SERVER_OPTIONS);
  for (const tool of HUB_OKF_TOOLS) {
    server.registerTool(tool.name, { description: tool.description, inputSchema: fromJsonSchema(modernToolInputSchema(tool.inputSchema)) },
      async (argumentsValue): Promise<CallToolResult> => {
        return callHubOkfTool(
          tool.name as HubOkfToolName,
          argumentsValue as Record<string, unknown>,
          hubActions,
        );
      });
  }
  for (const tool of OKF_SCHEMA_TOOLS) {
    server.registerTool(tool.name, { description: tool.description, inputSchema: fromJsonSchema(modernToolInputSchema(tool.inputSchema)) },
      async (argumentsValue): Promise<CallToolResult> => callOkfSchemaTool(
        tool.name as OkfSchemaToolName,
        argumentsValue as Record<string, unknown>,
        { discovery },
      ));
  }
  for (const tool of SAFE_TOOLS) {
    server.registerTool(tool.name, {
      ...(tool.title === undefined ? {} : { title: tool.title }),
      ...(tool.description === undefined ? {} : { description: tool.description }),
      inputSchema: fromJsonSchema(modernToolInputSchema(tool.inputSchema)),
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
    discovery,
    connect: (transport) => server.connect(transport),
    close() {
      closePromise ??= (async () => { await gateway.close(); await server.close(); })();
      return closePromise;
    },
  };
}

export async function serveCodebaseMemoryMcp(projectRoot = path.resolve(import.meta.dirname, "../../..")): Promise<AgentBaseMcpServer> {
  const current = createAgentBaseMcpServer({ projectRoot });
  await current.connect(new StdioServerTransport(process.stdin, process.stdout, { maxBufferSize: 4_000_000 }));
  return current;
}
