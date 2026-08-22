export const HUB_README_PATH = "README.md" as const;

export function renderHubReadme(): string {
  return "# AgentBase-Hub\n\n"
    + "This is an OKF knowledge repository created and managed locally by AgentBase-MCP.\n\n"
    + "Accepted knowledge is stored once per entity as a linked canonical OKF graph. "
    + "The root `index.md` is the progressive-disclosure entrypoint.\n";
}
