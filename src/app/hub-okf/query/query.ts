import {
  buildHubContinuity,
  normalizeHubConceptPath,
  listHubConcepts,
  parseConceptDocument,
  readRepositoryIdentityRecord,
  resolveRepositoryIdentity,
  readHubConcept,
  readObservedValuesForQuery,
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
  type ObservedValue,
  type RepositoryIdentityHints,
  type RepositoryIdentityResolution,
} from "../../../core/knowledge/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";
import type { AdmittedLocalHubState } from "../../../core/hub/index.ts";
import { listPendingHubProposals } from "../review/pending.ts";

export type HubQueryGit = (request: GitRequest) => Promise<GitOutput>;

export type HubObservedValue = ObservedValue & Readonly<{
  age_milliseconds: number;
  source_access: "not-checked";
  sensitivity_warning?: "obvious-sensitive-value-redacted";
}>;

export type HubObservedValues = Readonly<{
  commit: string;
  path: string;
  conceptId: string;
  publication_layer: "published" | "local-draft";
  proposal_id?: string;
  values: readonly HubObservedValue[];
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

export async function readActiveHubObservedValues(
  localHub: AdmittedLocalHubState,
  relativePath: string,
  git: HubQueryGit = runGit,
  now: () => Date = () => new Date(),
): Promise<HubObservedValues> {
  const normalized = normalizeHubConceptPath(relativePath);
  const currentReader = reader(localHub, git);
  const concept = parseConceptDocument(normalized, await currentReader.readMarkdown(normalized));
  const observedAt = now().getTime();
  if (!Number.isFinite(observedAt)) throw new Error("observed-value query time is invalid");
  const values = readObservedValuesForQuery(concept).map((value): HubObservedValue => {
    const { sensitivityWarning, ...snapshot } = value;
    return {
      ...snapshot,
      age_milliseconds: observedAt - Date.parse(value.observed.at),
      source_access: "not-checked",
      ...(sensitivityWarning ? { sensitivity_warning: sensitivityWarning } : {}),
    };
  });
  if (localHub.activeHead === localHub.remoteBase) return {
    commit: localHub.activeHead,
    path: normalized,
    conceptId: concept.conceptId,
    publication_layer: "published",
    values,
  };
  const pending = await listPendingHubProposals(localHub, git);
  const proposal = pending.at(-1);
  if (!proposal || proposal.commit !== localHub.activeHead) throw new Error("active Local Draft has no attributable pending proposal");
  return {
    commit: localHub.activeHead,
    path: normalized,
    conceptId: concept.conceptId,
    publication_layer: "local-draft",
    proposal_id: proposal.id,
    values,
  };
}
