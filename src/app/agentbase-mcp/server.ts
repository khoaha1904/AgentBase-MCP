import { fromJsonSchema, McpServer, type CallToolResult, type Transport } from "@modelcontextprotocol/server";
import { serveStdio, StdioServerTransport, type StdioServerHandle } from "@modelcontextprotocol/server/stdio";

import { AGENTBASE_VERSION } from "../../product-version.ts";
import {
  callHubOkfTool, createHubRuntimeActions, defaultHubRuntimeStateRoot, HUB_OKF_TOOLS,
  type HubOkfToolName, type HubToolActions,
} from "../hub-okf/index.ts";
import { DiscoverySession } from "./discovery-session.ts";
import { DISCOVERY_TOOL, callDiscoveryTool } from "./discovery-tool.ts";
import { callOkfSchemaTool, OKF_SCHEMA_TOOLS, type OkfSchemaToolName } from "./okf-schema-tools.ts";
import { AGENTBASE_MCP_SERVER_OPTIONS, modernToolInputSchema } from "./protocol-policy.ts";
import {
  agentBaseToolAnnotations,
  TRUSTED_ENTERPRISE_CAPABILITY_POLICY,
  type AgentBaseCapabilityPolicy,
  type AgentBaseToolCapability,
} from "./capability-policy.ts";

export type AgentBaseMcpServer = Readonly<{
  server: McpServer;
  discovery: DiscoverySession;
  connect(transport: Transport): Promise<void>;
  close(): Promise<void>;
}>;

export function createAgentBaseMcpServer(options: Readonly<{
  discoverySession?: DiscoverySession;
  capabilityPolicy?: AgentBaseCapabilityPolicy;
  hubActions?: HubToolActions;
  hubStateRoot?: string;
}> = {}): AgentBaseMcpServer {
  const hubStateRoot = options.hubStateRoot ?? defaultHubRuntimeStateRoot();
  const discovery = options.discoverySession ?? new DiscoverySession(hubStateRoot);
  const hubActions = options.hubActions ?? createHubRuntimeActions(process.env, hubStateRoot, {
    onSourceSnapshot: (snapshot, mode, authority) => discovery.arm(snapshot, mode, authority),
    discoveryReceiptResolver: (id) => discovery.resolveReceipt(id),
    discoveryReceiptRebaser: (id, publishedBase) => discovery.rebaseReceipt(id, publishedBase),
  });
  const server = new McpServer({ name: "agentbase-mcp", version: AGENTBASE_VERSION }, AGENTBASE_MCP_SERVER_OPTIONS);
  const capabilityPolicy = options.capabilityPolicy ?? TRUSTED_ENTERPRISE_CAPABILITY_POLICY;
  const enabled = (name: string, capability: AgentBaseToolCapability) => capabilityPolicy.allows({ name, capability });
  for (const tool of HUB_OKF_TOOLS) {
    if (!enabled(tool.name, "hub")) continue;
    server.registerTool(tool.name, {
      description: tool.description,
      inputSchema: fromJsonSchema(modernToolInputSchema(tool.inputSchema)),
      annotations: agentBaseToolAnnotations({ name: tool.name, capability: "hub" }),
    },
      async (argumentsValue): Promise<CallToolResult> => {
        return callHubOkfTool(
          tool.name as HubOkfToolName,
          argumentsValue as Record<string, unknown>,
          hubActions,
        );
      });
  }
  for (const tool of OKF_SCHEMA_TOOLS) {
    if (!enabled(tool.name, "schema")) continue;
    server.registerTool(tool.name, {
      description: tool.description,
      inputSchema: fromJsonSchema(modernToolInputSchema(tool.inputSchema)),
      annotations: agentBaseToolAnnotations({ name: tool.name, capability: "schema" }),
    },
      async (argumentsValue): Promise<CallToolResult> => callOkfSchemaTool(
        tool.name as OkfSchemaToolName,
        argumentsValue as Record<string, unknown>,
        { discovery, validateAuthoringSession: (sessionId, references) => hubActions.validate(sessionId, references) },
      ));
  }
  if (enabled(DISCOVERY_TOOL.name, "discovery")) {
    const tool = DISCOVERY_TOOL;
    server.registerTool(tool.name, {
      description: tool.description,
      inputSchema: fromJsonSchema(modernToolInputSchema(tool.inputSchema)),
      annotations: agentBaseToolAnnotations({ name: tool.name, capability: "discovery" }),
    }, async (argumentsValue): Promise<CallToolResult> => callDiscoveryTool(discovery, argumentsValue as Record<string, unknown>));
  }
  let closePromise: Promise<void> | undefined;
  return {
    server,
    discovery,
    connect: (transport) => server.connect(transport),
    close() {
      closePromise ??= server.close();
      return closePromise;
    },
  };
}

export function serveAgentBaseMcp(
  transport: Transport = new StdioServerTransport(process.stdin, process.stdout, { maxBufferSize: 4_000_000 }),
): StdioServerHandle {
  return serveStdio(() => createAgentBaseMcpServer().server, { legacy: "serve", transport });
}
