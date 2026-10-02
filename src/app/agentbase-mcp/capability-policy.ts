export type AgentBaseToolCapability = "hub" | "schema" | "discovery";

export type AgentBaseToolReference = Readonly<{
  name: string;
  capability: AgentBaseToolCapability;
}>;

export type AgentBaseCapabilityPolicy = Readonly<{
  allows(tool: AgentBaseToolReference): boolean;
}>;

export const TRUSTED_ENTERPRISE_CAPABILITY_POLICY: AgentBaseCapabilityPolicy = Object.freeze({
  allows: () => true,
});

export type AgentBaseToolAnnotations = Readonly<{
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
}>;

const READ_ONLY_HUB_TOOLS = new Set([
  "get_hub_status",
  "scan_workspace_repositories",
  "inspect_hub_okf_proposal",
  "search_hub_okf",
  "read_hub_okf_concept",
  "preview_hub_initialization",
  "list_hub_questions",
]);

const IDEMPOTENT_HUB_TOOLS = new Set([
  ...READ_ONLY_HUB_TOOLS,
  "configure_hub",
  "preview_hub_bootstrap",
  "bootstrap_hub",
  "preflight_hub_ingest",
  "prepare_hub_profile_migration",
  "initialize_hub",
  "publish_hub_okf_proposal",
  "synchronize_hub_okf",
  "recover_hub_okf",
]);

const OPEN_WORLD_HUB_TOOLS = new Set([
  "get_hub_status",
  "configure_hub",
  "preview_hub_bootstrap",
  "bootstrap_hub",
  "preflight_hub_ingest",
  "prepare_hub_okf",
  "prepare_batch_hub_ingest",
  "run_domain_enrichment",
  "preview_hub_initialization",
  "initialize_hub",
  "publish_hub_okf_proposal",
  "synchronize_hub_okf",
  "recover_hub_okf",
]);

export function agentBaseToolAnnotations(tool: AgentBaseToolReference): AgentBaseToolAnnotations {
  if (tool.capability === "discovery") {
    const readOnly = false;
    return { readOnlyHint: readOnly, destructiveHint: false, idempotentHint: true, openWorldHint: false };
  }
  if (tool.capability === "schema") {
    return {
      readOnlyHint: tool.name !== "get_okf_authoring_schemas",
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    };
  }
  return {
    readOnlyHint: READ_ONLY_HUB_TOOLS.has(tool.name),
    destructiveHint: tool.name === "publish_hub_okf_proposal",
    idempotentHint: IDEMPOTENT_HUB_TOOLS.has(tool.name),
    openWorldHint: OPEN_WORLD_HUB_TOOLS.has(tool.name),
  };
}
