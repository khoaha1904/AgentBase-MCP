import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseRepositorySourceResource, readRepositoryIdentityRecord, repositorySourceResources, type HubGraph } from "../../../core/knowledge/index.ts";
import { normalizeSourceName, type NameMatchResult, type NameRepository } from "../../repository-source/index.ts";

export function comparePublishedNameLinks(repositories: readonly NameRepository[], result: NameMatchResult, graph?: HubGraph) {
  const repositoryIds = new Map(repositories.map((repo) => [repo.id, repo.repositoryId]));
  const concepts = [...graph?.concepts.values() ?? []].map(({ document }) => ({ document,
    identity: readRepositoryIdentityRecord(document)?.id,
    sources: repositorySourceResources(document).flatMap((item) => {
      const source = parseRepositorySourceResource(item); return source ? [source] : [];
    }),
  }));
  const links = result.links.map((link) => {
    const definingId = repositoryIds.get(link.defining_repo), usingId = repositoryIds.get(link.using_repo);
    const sources = concepts.filter((item) => usingId && (item.identity === usingId || item.sources.some((source) => source.repositoryId === usingId)));
    const targets = concepts.filter((item) => definingId && item.sources.some((source) => source.repositoryId === definingId)
      && (normalizeSourceName(String(item.document.frontmatter.title ?? "")) === link.name
        || link.evidence.definition.some((reference) => item.sources.some((source) => source.repositoryId === definingId
          && source.relativePath === reference.path && source.startLine !== undefined
          && reference.line >= source.startLine && reference.line <= source.endLine!))));
    // Broad source spans can match several Resources. Suppress only an exact,
    // unambiguous Published endpoint and predicate, never merely a shared path.
    const published = targets.length === 1 && sources.some((source) => graph?.edges.some((edge) => edge.source === source.document.conceptId
      && edge.target === targets[0]!.document.conceptId && edge.kind === link.kind));
    return { ...link, published };
  });
  return { ...result, ...(graph ? { publishedCommit: graph.commit } : {}), links };
}

export function retainNameSuggestions(directory: string, result: ReturnType<typeof comparePublishedNameLinks>) {
  if (fs.existsSync(directory) && fs.lstatSync(directory).isSymbolicLink()) throw new Error("Name report cannot cross a symlink");
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  directory = fs.realpathSync(directory);
  const bytes = JSON.stringify(result), digest = createHash("sha256").update(bytes).digest("hex");
  const file = path.join(directory, `source-names-${digest.slice(0, 24)}.json`);
  if (fs.existsSync(file)) {
    if (fs.lstatSync(file).isSymbolicLink() || fs.readFileSync(file, "utf8") !== bytes) throw new Error("Name report identity changed");
  } else fs.writeFileSync(file, bytes, { flag: "wx", mode: 0o600 });
  const suggestions = result.links.filter((link) => !link.published);
  return {
    links: suggestions.slice(0, 50), questions: result.questions.slice(0, 50),
    referencedNotDefined: result.referencedNotDefined.slice(0, 50), moduleVersionDrift: result.moduleVersionDrift,
    counts: { links: result.links.length, published: result.links.length - suggestions.length,
      new: suggestions.length, questions: result.questions.length, referencedNotDefined: result.referencedNotDefined.length },
    omitted: { links: Math.max(0, suggestions.length - 50), questions: Math.max(0, result.questions.length - 50),
      referencedNotDefined: Math.max(0, result.referencedNotDefined.length - 50) },
    truncated: suggestions.length > 50 || result.questions.length > 50 || result.referencedNotDefined.length > 50,
    limitations: result.limitations, fullReport: file,
    ...(result.publishedCommit ? { publishedCommit: result.publishedCommit } : {}),
  };
}
