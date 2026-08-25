import {
  buildHubContinuity,
  buildPublishedVisualizationProjection,
  listHubConcepts,
  loadHubGraph,
  parseConceptDocument,
  readRepositoryIdentityRecord,
  readRepositoryObservedSource,
  resolveRepositoryIdentity,
  readHubConcept,
  searchHubConcepts,
  type HubQueryMatch,
  type HubConceptSummary,
  type HubQueryReader,
  type HubContinuityManifest,
  type HubContinuityOptions,
  type HubSearchOptions,
  type HubSearchResult,
  type RepositoryIdentityHints,
  type RepositoryIdentityRecord,
  type RepositoryIdentityResolution,
  type RepositoryObservedSource,
  type PublishedVisualizationProjection,
} from "../../../core/knowledge/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";
import type { AdmittedLocalHubState } from "../../../core/hub/index.ts";

export type HubQueryGit = (request: GitRequest) => Promise<GitOutput>;

export type InitialIngestHubContext = Readonly<{
  commit: string;
  repository: RepositoryIdentityResolution;
  domains: readonly HubConceptSummary[];
}>;

export type PublishedRepositoryInventoryItem = Readonly<{
  summary: HubConceptSummary;
  identity: RepositoryIdentityRecord;
  observedSource?: RepositoryObservedSource;
}>;

function reader(localHub: AdmittedLocalHubState, commit: string, git: HubQueryGit): HubQueryReader {
  return {
    commit,
    async listMarkdownPaths() {
      const output = await git({
        args: ["ls-tree", "-r", "--name-only", "-z", commit],
        cwd: localHub.root,
        operation: "list local Hub concepts",
        maximumOutputBytes: 4 * 1024 * 1024,
      });
      return output.stdout.split("\0").filter((value) => value.endsWith(".md"));
    },
    async readMarkdown(relativePath) {
      const output = await git({
        args: ["show", `${commit}:${relativePath}`],
        cwd: localHub.root,
        operation: "read local Hub concept",
        maximumOutputBytes: 256 * 1024,
      });
      return output.stdout;
    },
  };
}

function activeReader(localHub: AdmittedLocalHubState, git: HubQueryGit): HubQueryReader {
  return reader(localHub, localHub.activeHead, git);
}

function publishedReader(localHub: AdmittedLocalHubState, git: HubQueryGit): HubQueryReader {
  if (localHub.kind === "local-only") {
    throw new Error("Published Hub knowledge is unavailable until a remote Hub is attached and synchronized");
  }
  return reader(localHub, localHub.remoteBase, git);
}

export function searchPublishedHub(
  localHub: AdmittedLocalHubState,
  query: string,
  options: HubSearchOptions = {},
  git: HubQueryGit = runGit,
): Promise<HubSearchResult> {
  return searchHubConcepts(publishedReader(localHub, git), query, options);
}

export async function inspectInitialIngestHubContext(
  localHub: AdmittedLocalHubState,
  hints: RepositoryIdentityHints,
  options: Readonly<{ boundary?: "published" | "active" }> = {},
  git: HubQueryGit = runGit,
): Promise<InitialIngestHubContext> {
  const boundary = options.boundary ?? "published";
  const commit = boundary === "active" ? localHub.activeHead : localHub.remoteBase;
  const currentReader = boundary === "active" ? activeReader(localHub, git) : publishedReader(localHub, git);
  const summaries = await listHubConcepts(currentReader, { types: ["Repository", "Domain"], limit: 512 });
  const repositoryDocuments = await Promise.all(summaries.filter((item) => item.type === "Repository").map(async (item) => (
    parseConceptDocument(item.path, await currentReader.readMarkdown(item.path))
  )));
  const records = repositoryDocuments.flatMap((concept) => {
    const record = readRepositoryIdentityRecord(concept);
    return record ? [record] : [];
  });
  return {
    commit,
    repository: resolveRepositoryIdentity(hints, records),
    domains: summaries.filter((item) => item.type === "Domain"),
  };
}

export async function readPublishedRepositoryInventory(
  localHub: AdmittedLocalHubState,
  git: HubQueryGit = runGit,
): Promise<readonly PublishedRepositoryInventoryItem[]> {
  const currentReader = publishedReader(localHub, git);
  const summaries = await listHubConcepts(currentReader, { types: ["Repository"], limit: 512 });
  const items = await Promise.all(summaries.map(async (summary) => {
    const concept = parseConceptDocument(summary.path, await currentReader.readMarkdown(summary.path));
    const identity = readRepositoryIdentityRecord(concept);
    if (!identity) return undefined;
    const observedSource = readRepositoryObservedSource(concept);
    return { summary, identity, ...(observedSource ? { observedSource } : {}) };
  }));
  return items.filter((item): item is PublishedRepositoryInventoryItem => item !== undefined);
}

export function buildActiveHubContinuity(
  localHub: AdmittedLocalHubState,
  sourceRepositoryId: string,
  subjectDirectory: string,
  options: HubContinuityOptions = {},
  git: HubQueryGit = runGit,
): Promise<HubContinuityManifest> {
  return buildHubContinuity(activeReader(localHub, git), sourceRepositoryId, subjectDirectory, options);
}

export function readPublishedHubConcept(
  localHub: AdmittedLocalHubState,
  relativePath: string,
  git: HubQueryGit = runGit,
): Promise<HubQueryMatch> {
  return readHubConcept(publishedReader(localHub, git), relativePath);
}

export async function projectPublishedHubDomain(
  localHub: AdmittedLocalHubState,
  domain: string,
  git: HubQueryGit = runGit,
): Promise<PublishedVisualizationProjection> {
  if (localHub.kind === "local-only") {
    throw new Error("Published Hub visualization is unavailable until a remote Hub is attached and synchronized");
  }
  const graph = await loadHubGraph(publishedReader(localHub, git), 256 * 1024);
  return buildPublishedVisualizationProjection(graph, {
    hub: `${localHub.hub.host}/${localHub.hub.repository}#${localHub.hub.targetBranch}`,
    domain,
  });
}
