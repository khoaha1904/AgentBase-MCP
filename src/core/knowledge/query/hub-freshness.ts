import { parseConceptDocument } from "../documents/okf-document.ts";
import {
  readRepositoryIdentityRecord,
  readRepositoryObservedSource,
} from "../governance/repository-identity.ts";
import { listHubConcepts } from "./hub-query.ts";
import type { HubQueryReader } from "./hub-query-graph.ts";

export type RepositoryFreshness = Readonly<{
  path: string;
  title: string;
  repository_id?: string;
  state: "observed" | "unknown";
  observed_at?: string;
  age_milliseconds?: number;
  source_revision?: string;
}>;

export type HubFreshnessProjection = Readonly<{
  commit: string;
  generated_at: string;
  summary: Readonly<{ total: number; observed: number; unknown: number }>;
  repositories: readonly RepositoryFreshness[];
}>;

export async function readHubFreshness(
  reader: HubQueryReader,
  now: () => Date = () => new Date(),
): Promise<HubFreshnessProjection> {
  const generatedAt = now(), generatedAtMilliseconds = generatedAt.getTime();
  if (!Number.isFinite(generatedAtMilliseconds)) throw new Error("freshness report time is invalid");
  const summaries = await listHubConcepts(reader, { types: ["Repository"], limit: 512 });
  const repositories = await Promise.all(summaries.map(async (summary): Promise<RepositoryFreshness> => {
    const concept = parseConceptDocument(summary.path, await reader.readMarkdown(summary.path));
    const identity = readRepositoryIdentityRecord(concept);
    const observed = readRepositoryObservedSource(concept);
    if (!observed) return {
      path: summary.path,
      title: summary.title,
      ...(identity ? { repository_id: identity.id } : {}),
      state: "unknown",
    };
    const sourceRevision = observed.dirty ? observed.dirtyDigest : observed.commit;
    return {
      path: summary.path,
      title: summary.title,
      ...(identity ? { repository_id: identity.id } : {}),
      state: "observed",
      observed_at: observed.observedAt,
      age_milliseconds: Math.max(0, generatedAtMilliseconds - Date.parse(observed.observedAt)),
      ...(sourceRevision ? { source_revision: sourceRevision } : {}),
    };
  }));
  repositories.sort((left, right) => {
    if (left.state !== right.state) return left.state === "unknown" ? -1 : 1;
    if (left.state === "observed" && right.state === "observed"
      && left.age_milliseconds !== right.age_milliseconds) {
      return right.age_milliseconds! - left.age_milliseconds!;
    }
    return left.path.localeCompare(right.path);
  });
  const observed = repositories.filter((repository) => repository.state === "observed").length;
  return {
    commit: reader.commit,
    generated_at: generatedAt.toISOString(),
    summary: { total: repositories.length, observed, unknown: repositories.length - observed },
    repositories,
  };
}

