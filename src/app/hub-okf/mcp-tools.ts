import type { CallToolResult } from "@modelcontextprotocol/server";
import { HUB_PROPOSAL_SUBJECT_PATTERN } from "../../core/hub/index.ts";
import { normalizeConfirmedDomain, type ConfirmedDomain,
  type HubSearchOptions, type HubTraversalOptions } from "../../core/knowledge/index.ts";
import type { BootstrapMode } from "./bootstrap.ts";
import { HUB_OKF_QUERY_TOOLS } from "./mcp-query-tools.ts";

export const HUB_OKF_TOOLS = [
  {
    name: "get_hub_status",
    description: "Report whether AgentBase-MCP has no Hub, a local-only Hub, or an attached remote Hub.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "configure_hub",
    description: "Attach an existing AgentBase-Hub or create a new local-only Hub when OKF is first requested.",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["existing", "new"] },
        repository_url: { type: "string", minLength: 1 },
      },
      required: ["mode"], additionalProperties: false,
    },
  },
  {
    name: "preview_hub_bootstrap",
    description: "Preview the exact base and knowledge commits for first publication to an empty GitHub repository.",
    inputSchema: {
      type: "object",
      properties: {
        repository_url: { type: "string", minLength: 1 },
        mode: { type: "string", enum: ["all-to-main", "base-to-main-knowledge-pr"] },
      },
      required: ["repository_url", "mode"], additionalProperties: false,
    },
  },
  {
    name: "bootstrap_hub",
    description: "Publish a local-only Hub to an explicitly supplied empty GitHub repository using the reviewed mode.",
    inputSchema: {
      type: "object",
      properties: {
        repository_url: { type: "string", minLength: 1 },
        mode: { type: "string", enum: ["all-to-main", "base-to-main-knowledge-pr"] },
      },
      required: ["repository_url", "mode"], additionalProperties: false,
    },
  },
  {
    name: "prepare_hub_okf",
    description: "Prepare a local new or refresh AgentBase Hub OKF proposal without publishing.",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["new", "refresh"] },
        source_repository: { type: "string", minLength: 1 },
        evidence_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        subject_directory: {
          type: "string",
          pattern: HUB_PROPOSAL_SUBJECT_PATTERN.source,
          description: "Logical proposal focus; source repository identity and changed concept paths remain independent.",
        },
        confirmed_domain: {
          type: "object",
          description: "Optional owner-confirmed business Domain; never inferred from the repository name.",
          properties: {
            identity: { type: "string", pattern: "^domains/[a-z0-9]+(?:-[a-z0-9]+)*$" },
            title: { type: "string", minLength: 1, maxLength: 120 },
          },
          required: ["identity", "title"], additionalProperties: false,
        },
        signals: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1, maxItems: 64 },
      },
      required: ["mode", "source_repository", "evidence_digest", "subject_directory", "signals"],
      additionalProperties: false,
    },
  },
  {
    name: "finalize_hub_okf_proposal",
    description: "Validate and lock an authored Hub workspace into one immutable local proposal.",
    inputSchema: {
      type: "object",
      properties: { session_id: { type: "string", pattern: "^hub-session-[a-f0-9]{24}$" } },
      required: ["session_id"], additionalProperties: false,
    },
  },
  {
    name: "inspect_hub_okf_proposal",
    description: "Inspect one immutable local Hub proposal and its bounded full diff.",
    inputSchema: {
      type: "object",
      properties: { transaction_id: { type: "string", minLength: 1 } },
      required: ["transaction_id"], additionalProperties: false,
    },
  },
  {
    name: "accept_hub_okf_proposal",
    description: "Accept exactly one reviewed proposal as a local AgentBase-Hub main commit without remote publication.",
    inputSchema: {
      type: "object",
      properties: {
        proposal_id: { type: "string", minLength: 1 },
        proposal_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      },
      required: ["proposal_id", "proposal_digest"], additionalProperties: false,
    },
  },
  ...HUB_OKF_QUERY_TOOLS,
  {
    name: "read_hub_okf_concept",
    description: "Read one exact Markdown path from accepted local AgentBase-Hub knowledge.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", minLength: 1, maxLength: 512 } },
      required: ["path"], additionalProperties: false,
    },
  },
  {
    name: "list_pending_hub_okf",
    description: "List ordered accepted local proposal commits not yet admitted in remote main.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "submit_hub_okf_proposals",
    description: "Publish one dependency-safe pending proposal prefix through one branch and pull request.",
    inputSchema: {
      type: "object",
      properties: {
        proposal_ids: {
          type: "array", items: { type: "string", minLength: 1 }, minItems: 1, maxItems: 100,
        },
      },
      required: ["proposal_ids"], additionalProperties: false,
    },
  },
  {
    name: "synchronize_hub_okf",
    description: "Fetch remote main and transactionally replay remaining accepted local proposals.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "recover_hub_okf",
    description: "Recover one exact interrupted Hub transaction without resetting accepted commits.",
    inputSchema: {
      type: "object",
      properties: { proposal_id: { type: "string", minLength: 1 } },
      required: ["proposal_id"], additionalProperties: false,
    },
  },
] as const;

export type HubOkfToolName = typeof HUB_OKF_TOOLS[number]["name"];
export type HubToolActions = Readonly<{
  status(): Promise<unknown>;
  configure(input: Readonly<{ mode: "existing" | "new"; repositoryUrl?: string }>): Promise<unknown>;
  previewBootstrap(repositoryUrl: string, mode: BootstrapMode): Promise<unknown>;
  bootstrap(repositoryUrl: string, mode: BootstrapMode): Promise<unknown>;
  prepare(input: Readonly<{
    mode: "new" | "refresh";
    sourceRepository: string;
    evidenceDigest: string;
    subjectDirectory: string;
    confirmedDomain?: ConfirmedDomain;
    signals: readonly string[];
  }>): Promise<unknown>;
  finalize(sessionId: string): Promise<unknown>;
  inspect(proposalId: string): Promise<unknown>;
  accept(proposalId: string, proposalDigest: string): Promise<unknown>;
  search(query: string, options?: HubSearchOptions): Promise<unknown>;
  traverse(start: string, options?: HubTraversalOptions): Promise<unknown>;
  read(relativePath: string): Promise<unknown>;
  listPending(): Promise<unknown>;
  submitMany(proposalIds: readonly string[]): Promise<unknown>;
  synchronize(): Promise<unknown>;
  recover(proposalId: string): Promise<unknown>;
}>;

function result(value: unknown, isError = false): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value) }], ...(isError ? { isError: true } : {}) };
}

function required(args: Readonly<Record<string, unknown>>, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || !value) throw new Error(`${key} is required`);
  return value;
}

function optionalStringList(args: Readonly<Record<string, unknown>>, key: string): readonly string[] | undefined {
  const value = args[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || !value.length || !value.every((item) => typeof item === "string" && item.length > 0)) {
    throw new Error(`${key} must be a non-empty string list`);
  }
  return value as string[];
}

export async function callHubOkfTool(
  name: HubOkfToolName,
  args: Readonly<Record<string, unknown>>,
  actions?: HubToolActions,
): Promise<CallToolResult> {
  try {
    if (!actions) throw new Error("AgentBase Hub runtime is not configured");
    if (name === "get_hub_status") return result(await actions.status());
    if (name === "configure_hub") {
      const mode = required(args, "mode");
      if (mode !== "existing" && mode !== "new") throw new Error("mode must be existing or new");
      const repositoryUrl = args.repository_url;
      if (mode === "existing" && (typeof repositoryUrl !== "string" || !repositoryUrl)) {
        throw new Error("repository_url is required when attaching an existing Hub");
      }
      if (mode === "new" && repositoryUrl !== undefined) throw new Error("repository_url is not accepted for a new local-only Hub");
      return result(await actions.configure({ mode, ...(typeof repositoryUrl === "string" ? { repositoryUrl } : {}) }));
    }
    if (name === "preview_hub_bootstrap" || name === "bootstrap_hub") {
      const mode = required(args, "mode");
      if (mode !== "all-to-main" && mode !== "base-to-main-knowledge-pr") throw new Error("bootstrap mode is invalid");
      const repositoryUrl = required(args, "repository_url");
      return result(name === "preview_hub_bootstrap"
        ? await actions.previewBootstrap(repositoryUrl, mode)
        : await actions.bootstrap(repositoryUrl, mode));
    }
    if (name === "prepare_hub_okf") {
      const mode = required(args, "mode");
      if (mode !== "new" && mode !== "refresh") throw new Error("mode must be new or refresh");
      const confirmedDomain = args.confirmed_domain === undefined
        ? undefined : normalizeConfirmedDomain(args.confirmed_domain);
      return result(await actions.prepare({
        mode,
        sourceRepository: required(args, "source_repository"),
        evidenceDigest: required(args, "evidence_digest"),
        subjectDirectory: required(args, "subject_directory"),
        ...(confirmedDomain ? { confirmedDomain } : {}),
        signals: Array.isArray(args.signals) && args.signals.every((signal) => typeof signal === "string")
          ? args.signals as string[]
          : (() => { throw new Error("signals must be a string list"); })(),
      }));
    }
    if (name === "finalize_hub_okf_proposal") return result(await actions.finalize(required(args, "session_id")));
    if (name === "search_hub_okf") {
      const limit = args.limit;
      if (limit !== undefined && (!Number.isInteger(limit) || Number(limit) < 1 || Number(limit) > 100)) {
        throw new Error("limit must be an integer from 1 to 100");
      }
      if (args.global !== undefined && typeof args.global !== "boolean") throw new Error("global must be a boolean");
      const types = optionalStringList(args, "types");
      return result(await actions.search(required(args, "query"), {
        ...(typeof args.domain === "string" ? { domain: args.domain } : {}),
        ...(types ? { types } : {}),
        ...(typeof args.global === "boolean" ? { global: args.global } : {}),
        ...(limit === undefined ? {} : { limit: limit as number }),
      }));
    }
    if (name === "traverse_hub_okf") {
      const direction = args.direction;
      if (direction !== undefined && direction !== "outbound" && direction !== "inbound" && direction !== "both") {
        throw new Error("direction must be outbound, inbound or both");
      }
      const maxDepth = args.max_depth, limit = args.limit;
      if (maxDepth !== undefined && (!Number.isInteger(maxDepth) || Number(maxDepth) < 1 || Number(maxDepth) > 3)) {
        throw new Error("max_depth must be an integer from 1 to 3");
      }
      if (limit !== undefined && (!Number.isInteger(limit) || Number(limit) < 1 || Number(limit) > 100)) {
        throw new Error("limit must be an integer from 1 to 100");
      }
      const kinds = optionalStringList(args, "kinds");
      return result(await actions.traverse(required(args, "start"), {
        ...(typeof direction === "string" ? { direction } : {}),
        ...(kinds ? { kinds } : {}),
        ...(maxDepth === undefined ? {} : { maxDepth: maxDepth as number }),
        ...(limit === undefined ? {} : { limit: limit as number }),
      }));
    }
    if (name === "read_hub_okf_concept") return result(await actions.read(required(args, "path")));
    if (name === "list_pending_hub_okf") return result(await actions.listPending());
    if (name === "submit_hub_okf_proposals") {
      if (!Array.isArray(args.proposal_ids)
        || !args.proposal_ids.length
        || !args.proposal_ids.every((value) => typeof value === "string" && value.length > 0)) {
        throw new Error("proposal_ids must be a non-empty string list");
      }
      return result(await actions.submitMany(args.proposal_ids as string[]));
    }
    if (name === "synchronize_hub_okf") return result(await actions.synchronize());
    if (name === "recover_hub_okf") return result(await actions.recover(required(args, "proposal_id")));
    const proposalId = required(args, "proposal_id");
    if (name === "inspect_hub_okf_proposal") return result(await actions.inspect(proposalId));
    if (name === "accept_hub_okf_proposal") {
      return result(await actions.accept(proposalId, required(args, "proposal_digest")));
    }
    throw new Error(`unsupported Hub action: ${name}`);
  } catch (error) {
    return result({ error: error instanceof Error ? error.message : "Hub action failed" }, true);
  }
}
