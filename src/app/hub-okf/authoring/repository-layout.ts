import fs from "node:fs";
import path from "node:path";

import {
  conceptReferencesRepository, isMutableAgentBaseDraft, loadOkfBundle,
  readRepositoryIdentityRecord, renderConceptDocument, repositorySourceResources,
} from "../../../core/knowledge/index.ts";
import type { InitialIngestSkeleton } from "./initial-ingest-skeleton.ts";

function embeddedSection(body: string): string | undefined {
  return body.match(/^# Embedded Knowledge[ \t]*\r?\n[\s\S]*?(?=^# |(?![\s\S]))/m)?.[0];
}

function rows(section: string): readonly string[] {
  return section.split(/\r?\n/).filter((line) => /^\|/.test(line)
    && !/^\|\s*(?:Name\s*\||-)/i.test(line));
}

function normalized(row: string): string {
  return row.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeRefreshRepositoryLayout(bundleRoot: string, repositoryId: string): readonly InitialIngestSkeleton[] {
  const bundle = loadOkfBundle(bundleRoot);
  const repository = [...bundle.concepts.values()].find((concept) => readRepositoryIdentityRecord(concept)?.id === repositoryId);
  if (!repository || !isMutableAgentBaseDraft(repository)) return [];
  const section = embeddedSection(repository.body);
  if (!section) return [];
  const sources = repositorySourceResources(repository);
  if (sources.some((resource) => !resource.startsWith(`repository://${repositoryId}/`))) return [];
  const children = [...bundle.concepts.values()].filter((concept) => concept.conceptId !== repository.conceptId
    && concept.type !== "Repository" && conceptReferencesRepository(concept, repositoryId)
    && repositorySourceResources(concept).some((resource) => sources.includes(resource)));
  const childRows = new Map(children.map((child) => [child, rows(embeddedSection(child.body) ?? "").map(normalized)]));
  const duplicated = rows(section).filter((row) => [...childRows.values()].some((values) => values.includes(normalized(row))));
  if (!duplicated.length) return [];
  const duplicatedRows = new Set(duplicated);
  const remaining = rows(section).filter((row) => !duplicatedRows.has(row));
  // Remove only recognizable copied table content; retain unrelated Repository prose and provenance.
  const evidence = new Set(children.flatMap((child) => (embeddedSection(child.body) ?? "").split(/\r?\n/)
    .filter((line) => /^\* `[^`]+` - `[^`]+`\s*$/.test(line)).map(normalized)));
  const outside = repository.body.replace(section, "");
  const retained = section.split(/\r?\n/).filter((line) => {
    if (duplicatedRows.has(line)) return false;
    if (!remaining.length && /^\|/.test(line)) return false;
    const sourceId = /^\* `([^`]+)` - /.exec(line)?.[1];
    return !sourceId || !evidence.has(normalized(line))
      || [...remaining, outside].some((text) => text.includes(`\x60${sourceId}\x60`));
  });
  const meaningful = retained.some((line) => line.trim() && !/^# Embedded Knowledge|^## Exact Evidence/.test(line));
  const replacement = meaningful ? retained.join("\n") : "";
  let body = repository.body.replace(section, replacement).trimEnd();
  const links = children.filter((child) => childRows.get(child)!.some((row) => duplicated.some((copy) => normalized(copy) === row)))
    .flatMap((child) => {
      const target = path.posix.relative(path.posix.dirname(repository.path), child.path);
      return body.includes(`](${target})`) ? []
        : [`* [${String(child.frontmatter.title ?? child.conceptId)}](${target}) - ${child.type}`];
    });
  if (links.length) body += `\n\n# Independently promoted knowledge\n\n${links.join("\n")}`;
  fs.writeFileSync(path.join(bundleRoot, repository.path), renderConceptDocument({ ...repository, body: `${body}\n` }));
  return [{ identity: repository.conceptId, path: repository.path, type: repository.type }];
}
