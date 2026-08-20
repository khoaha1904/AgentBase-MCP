import {
  buildHubContinuity,
  normalizeHubConceptPath,
  listHubConcepts,
  parseConceptDocument,
  readRepositoryIdentityRecord,
  resolveRepositoryIdentity,
  readHubConcept,
  readLiveClaims,
  searchHubConcepts,
  traverseHubConcepts,
  type HubQueryMatch,
  type HubConceptSummary,
  type HubQueryReader,
  type HubContinuityManifest,
  type HubContinuityOptions,
  type HubSearchOptions,
  type HubSearchResult,
  type HubTraversalOptions,
  type HubTraversalResult,
  type LiveClaim,
  type RepositoryIdentityHints,
  type RepositoryIdentityResolution,
} from "../../../core/knowledge/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";
import type { AdmittedLocalHubState } from "../../../core/hub/index.ts";

export type HubQueryGit = (request: GitRequest) => Promise<GitOutput>;

export type LiveSourceBinding = Readonly<{
  repositoryId: string;
  commit: string | null;
  dirty: boolean;
  dirtyDigest: string | null;
  limitations: readonly string[];
}>;

export type BoundLiveClaim = LiveClaim & Readonly<{
  status: "ready" | "unavailable" | "repository-mismatch";
  currentSource?: LiveSourceBinding;
  limitations: readonly string[];
}>;

export type HubLiveEvidence = Readonly<{
  commit: string;
  path: string;
  conceptId: string;
  claims: readonly BoundLiveClaim[];
}>;

export type InitialIngestHubContext = Readonly<{
  commit: string;
  repository: RepositoryIdentityResolution;
  domains: readonly HubConceptSummary[];
}>;

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

export async function inspectInitialIngestHubContext(
  localHub: AdmittedLocalHubState,
  hints: RepositoryIdentityHints,
  git: HubQueryGit = runGit,
): Promise<InitialIngestHubContext> {
  const currentReader = reader(localHub, git);
  const summaries = await listHubConcepts(currentReader, { types: ["Repository", "Domain"], limit: 512 });
  const repositoryDocuments = await Promise.all(summaries.filter((item) => item.type === "Repository").map(async (item) => (
    parseConceptDocument(item.path, await currentReader.readMarkdown(item.path))
  )));
  const records = repositoryDocuments.flatMap((concept) => {
    const record = readRepositoryIdentityRecord(concept);
    return record ? [record] : [];
  });
  return {
    commit: localHub.activeHead,
    repository: resolveRepositoryIdentity(hints, records),
    domains: summaries.filter((item) => item.type === "Domain"),
  };
}

export function traverseActiveHub(
  localHub: AdmittedLocalHubState,
  start: string,
  options: HubTraversalOptions = {},
  git: HubQueryGit = runGit,
): Promise<HubTraversalResult> {
  return traverseHubConcepts(reader(localHub, git), start, options);
}

export function buildActiveHubContinuity(
  localHub: AdmittedLocalHubState,
  sourceRepositoryId: string,
  subjectDirectory: string,
  options: HubContinuityOptions = {},
  git: HubQueryGit = runGit,
): Promise<HubContinuityManifest> {
  return buildHubContinuity(reader(localHub, git), sourceRepositoryId, subjectDirectory, options);
}

export function readActiveHubConcept(
  localHub: AdmittedLocalHubState,
  relativePath: string,
  git: HubQueryGit = runGit,
): Promise<HubQueryMatch> {
  return readHubConcept(reader(localHub, git), relativePath);
}

export async function readActiveHubLiveEvidence(
  localHub: AdmittedLocalHubState,
  relativePath: string,
  source: LiveSourceBinding | undefined,
  git: HubQueryGit = runGit,
): Promise<HubLiveEvidence> {
  const normalized = normalizeHubConceptPath(relativePath);
  const currentReader = reader(localHub, git);
  const concept = parseConceptDocument(normalized, await currentReader.readMarkdown(normalized));
  const claims = readLiveClaims(concept).map((claim): BoundLiveClaim => {
    const repositoryId = claim.source.resource.match(/^repository:\/\/(repository-[a-z0-9-]+-[a-f0-9]{12})\//)?.[1];
    if (!source) return { ...claim, status: "unavailable", limitations: ["no authorized repository is bound"] };
    if (source.repositoryId !== repositoryId) return {
      ...claim, status: "repository-mismatch", currentSource: source,
      limitations: [`authorized repository ${source.repositoryId} does not match ${repositoryId ?? "the claim source"}`],
    };
    return {
      ...claim, status: "ready", currentSource: source,
      limitations: [...source.limitations, ...(source.dirty ? ["current source is dirty; observation is not accepted knowledge"] : [])],
    };
  });
  return { commit: localHub.activeHead, path: normalized, conceptId: concept.conceptId, claims };
}
