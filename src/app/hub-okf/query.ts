import {
  readHubConcept,
  searchHubConcepts,
  traverseHubConcepts,
  type HubQueryMatch,
  type HubQueryReader,
  type HubSearchOptions,
  type HubSearchResult,
  type HubTraversalOptions,
  type HubTraversalResult,
} from "../../core/knowledge/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../providers/github-hub/index.ts";
import type { AdmittedLocalHubState } from "../../core/hub/index.ts";

export type HubQueryGit = (request: GitRequest) => Promise<GitOutput>;

function reader(localHub: AdmittedLocalHubState, git: HubQueryGit): HubQueryReader {
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
  localHub: AdmittedLocalHubState,
  query: string,
  options: HubSearchOptions = {},
  git: HubQueryGit = runGit,
): Promise<HubSearchResult> {
  return searchHubConcepts(reader(localHub, git), query, options);
}

export function traverseActiveHub(
  localHub: AdmittedLocalHubState,
  start: string,
  options: HubTraversalOptions = {},
  git: HubQueryGit = runGit,
): Promise<HubTraversalResult> {
  return traverseHubConcepts(reader(localHub, git), start, options);
}

export function readActiveHubConcept(
  localHub: AdmittedLocalHubState,
  relativePath: string,
  git: HubQueryGit = runGit,
): Promise<HubQueryMatch> {
  return readHubConcept(reader(localHub, git), relativePath);
}
