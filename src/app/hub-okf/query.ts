import {
  readHubConcept,
  searchHubConcepts,
  type HubQueryMatch,
  type HubQueryReader,
  type HubSearchOptions,
} from "../../core/knowledge/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../providers/github-hub/index.ts";
import type { LocalHubState } from "../../core/hub/index.ts";

export type HubQueryGit = (request: GitRequest) => Promise<GitOutput>;

function reader(localHub: LocalHubState, git: HubQueryGit): HubQueryReader {
  return {
    commit: localHub.activeHead,
    async listMarkdownPaths() {
      const output = await git({
        args: ["ls-tree", "-r", "--name-only", "-z", localHub.activeHead],
        cwd: localHub.root,
        operation: "list local Hub concepts",
        maximumOutputBytes: 4 * 1024 * 1024,
      });
      return output.stdout.split("\0").filter((value) => value.endsWith(".md"));
    },
    async readMarkdown(relativePath) {
      const output = await git({
        args: ["show", `${localHub.activeHead}:${relativePath}`],
        cwd: localHub.root,
        operation: "read local Hub concept",
        maximumOutputBytes: 256 * 1024,
      });
      return output.stdout;
    },
  };
}

export function searchActiveHub(
  localHub: LocalHubState,
  query: string,
  options: HubSearchOptions = {},
  git: HubQueryGit = runGit,
): Promise<readonly HubQueryMatch[]> {
  return searchHubConcepts(reader(localHub, git), query, options);
}

export function readActiveHubConcept(
  localHub: LocalHubState,
  relativePath: string,
  git: HubQueryGit = runGit,
): Promise<HubQueryMatch> {
  return readHubConcept(reader(localHub, git), relativePath);
}
