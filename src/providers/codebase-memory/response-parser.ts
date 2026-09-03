import path from "node:path";

import type { RepositoryOverview, SourceReference } from "../../core/code-intelligence/index.ts";
import { CodebaseMemoryError } from "./errors.ts";

type JsonObject = Record<string, unknown>;

export type SearchHit = Readonly<{
  qualifiedName: string;
  label: string;
  source: SourceReference;
}>;

export type TraceCall = Readonly<{
  qualifiedName: string;
  name: string;
  hop: number;
}>;

export type TraceResult = Readonly<{
  functionName: string;
  direction: "inbound" | "outbound" | "both";
  calls: readonly TraceCall[];
}>;

export type SourceSnippet = Readonly<{
  qualifiedName: string;
  name: string;
  label: string;
  source: SourceReference;
  text: string;
}>;

export type IndexDiagnostic = Readonly<{
  project: string;
  nodes: number;
  edges: number;
  status: "ready" | "empty";
  parsePartialCount: number;
  skippedCount: number;
  notIndexedCount: number;
  truncated: boolean;
}>;

export type CoverageEntry = Readonly<{
  path: string;
  kind: string;
  detail?: string;
}>;

export type CoveragePage = Readonly<{
  project: string;
  recordingStatus: string;
  generationMatches: boolean;
  hashRecordsComplete: boolean;
  status: "coverage_unavailable" | "known_gaps" | "no_recorded_issue";
  total: number;
  hasMore: boolean;
  nextOffset?: number;
  entries: readonly CoverageEntry[];
}>;

export type ArchitectureCapture = Readonly<{
  project: string;
  nodeCount: number;
  edgeCount: number;
  sections: Readonly<Record<string, readonly string[]>>;
}>;

function malformed(operation: string, message: string): never {
  throw new CodebaseMemoryError("PROVIDER_MALFORMED_OUTPUT", operation, message);
}

function object(value: unknown, operation: string, label: string): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) malformed(operation, `${label} must be an object`);
  return value as JsonObject;
}

function text(value: unknown, operation: string, label: string): string {
  if (typeof value !== "string" || !value.trim()) malformed(operation, `${label} must be non-empty text`);
  return value;
}

function integer(value: unknown, operation: string, label: string, minimum = 0): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum) malformed(operation, `${label} must be an integer >= ${minimum}`);
  return value as number;
}

function structured(response: unknown, operation: string): JsonObject {
  const envelope = object(response, operation, "response");
  if (envelope.isError === true) malformed(operation, "provider returned an error envelope");
  if (envelope.structuredContent !== undefined) return object(envelope.structuredContent, operation, "structuredContent");
  const content = envelope.content;
  if (Array.isArray(content)) {
    const first = object(content[0], operation, "first content block");
    const body = text(first.text, operation, "content text");
    try {
      return object(JSON.parse(body) as unknown, operation, "content JSON");
    } catch (cause) {
      throw new CodebaseMemoryError("PROVIDER_MALFORMED_OUTPUT", operation, "content text was not JSON", { cause });
    }
  }
  return envelope;
}

function architectureText(response: unknown): string {
  const envelope = object(response, "get_architecture", "response");
  if (!Array.isArray(envelope.content)) malformed("get_architecture", "architecture content must be an array");
  const first = object(envelope.content[0], "get_architecture", "first content block");
  return text(first.text, "get_architecture", "architecture text");
}

function sectionLines(source: string, section: string): readonly string[] {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith(`${section}:`));
  if (start < 0) return [];
  const values: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === undefined || !line.startsWith("  ")) break;
    values.push(line.trim());
  }
  return values;
}

function countSection(value: JsonObject, key: string, operation: string): Readonly<{ count: number; truncated: boolean }> {
  const section = object(value[key], operation, key);
  return {
    count: integer(section.count, operation, `${key}.count`),
    truncated: section.truncated === true,
  };
}

export function parseIndexDiagnostic(response: unknown): IndexDiagnostic {
  const value = structured(response, "index_status");
  const status = text(value.status, "index_status", "status");
  if (status !== "ready" && status !== "empty") malformed("index_status", "status must be ready or empty");
  const partial = countSection(value, "parse_partial", "index_status");
  const skipped = countSection(value, "skipped", "index_status");
  const notIndexed = object(value.not_indexed, "index_status", "not_indexed");
  const notIndexedCount = integer(notIndexed.dirs_count, "index_status", "not_indexed.dirs_count")
    + integer(notIndexed.files_count, "index_status", "not_indexed.files_count");
  return {
    project: text(value.project, "index_status", "project"),
    nodes: integer(value.nodes, "index_status", "nodes"),
    edges: integer(value.edges, "index_status", "edges"),
    status,
    parsePartialCount: partial.count,
    skippedCount: skipped.count,
    notIndexedCount,
    truncated: partial.truncated || skipped.truncated || notIndexed.truncated === true,
  };
}

export function parseCoveragePage(response: unknown): CoveragePage {
  const value = structured(response, "check_index_coverage");
  const metadata = object(value.metadata, "check_index_coverage", "metadata");
  if (!Array.isArray(value.scopes) || value.scopes.length !== 1) {
    malformed("check_index_coverage", "exactly one scope result is required");
  }
  const scope = object(value.scopes[0], "check_index_coverage", "scope result");
  const status = text(scope.status, "check_index_coverage", "scope status");
  if (!["coverage_unavailable", "known_gaps", "no_recorded_issue"].includes(status)) {
    malformed("check_index_coverage", "scope status is invalid");
  }
  if (!Array.isArray(scope.entries)) malformed("check_index_coverage", "scope entries must be an array");
  const entries = scope.entries.map((entryValue, index) => {
    const entry = object(entryValue, "check_index_coverage", `scope entry ${index + 1}`);
    const detailValue = entry.detail ?? entry.reason ?? entry.error_ranges;
    return {
      path: text(entry.path ?? entry.rel_path, "check_index_coverage", "coverage path"),
      kind: text(entry.kind ?? entry.phase, "check_index_coverage", "coverage kind"),
      ...(typeof detailValue === "string" && detailValue.trim() ? { detail: detailValue } : {}),
    };
  });
  const hasMore = scope.has_more === true;
  const nextOffset = scope.next_offset;
  if (hasMore && (!Number.isSafeInteger(nextOffset) || (nextOffset as number) < 1)) {
    malformed("check_index_coverage", "non-terminal scope requires next_offset");
  }
  return {
    project: text(value.project, "check_index_coverage", "project"),
    recordingStatus: text(metadata.recording_status, "check_index_coverage", "metadata.recording_status"),
    generationMatches: metadata.generation_matches === true,
    hashRecordsComplete: metadata.hash_records_complete === true,
    status: status as CoveragePage["status"],
    total: integer(scope.total, "check_index_coverage", "scope total"),
    hasMore,
    ...(hasMore ? { nextOffset: nextOffset as number } : {}),
    entries,
  };
}

export function parseArchitectureCapture(response: unknown): ArchitectureCapture {
  const source = architectureText(response);
  const scalar = (name: string): string => {
    const line = source.split(/\r?\n/).find((candidate) => candidate.startsWith(`${name}:`));
    return line ? line.slice(name.length + 1).trim() : malformed("get_architecture", `architecture omitted ${name}`);
  };
  const nodeCount = Number(scalar("total_nodes"));
  const edgeCount = Number(scalar("total_edges"));
  if (!Number.isSafeInteger(nodeCount) || nodeCount < 0 || !Number.isSafeInteger(edgeCount) || edgeCount < 0) {
    malformed("get_architecture", "architecture totals are invalid");
  }
  const sectionNames = [
    "node_labels", "edge_types", "languages", "packages", "entry_points", "routes",
    "hotspots", "boundaries", "layers", "clusters",
  ] as const;
  return {
    project: scalar("project"),
    nodeCount,
    edgeCount,
    sections: Object.fromEntries(sectionNames.map((name) => [name, sectionLines(source, name)])),
  };
}

export function parseArchitecture(repositoryId: string, response: unknown): RepositoryOverview {
  const source = architectureText(response);
  const languageLines = sectionLines(source, "languages");
  const packageLines = sectionLines(source, "packages");
  const entryLines = sectionLines(source, "entry_points");
  const boundaryLines = sectionLines(source, "boundaries");
  const languages = languageLines.map((line) => {
    const match = line.match(/^(.*?)\s+(\d+)$/);
    if (!match?.[1] || !match[2]) malformed("get_architecture", "invalid language row");
    return { name: match[1], fileCount: Number(match[2]) };
  });
  const packages = packageLines.map((line) => text(line.split(/\s+/)[0], "get_architecture", "package name"));
  const entryPoints = entryLines.map((line) => {
    const match = line.match(/^(\S+)\s+(\S+)$/);
    if (!match?.[1] || !match[2]) malformed("get_architecture", "invalid entry-point row");
    return { qualifiedName: match[1], path: match[2] };
  });
  const boundaries = boundaryLines.map((line) => {
    const match = line.match(/^(\S+)\s+(\S+)\s+(\d+)$/);
    if (!match?.[1] || !match[2] || !match[3]) malformed("get_architecture", "invalid boundary row");
    return { from: match[1], to: match[2], calls: Number(match[3]) };
  });
  if (!languages.length) malformed("get_architecture", "architecture omitted languages");
  return {
    repositoryId,
    summary: `${languages.map((item) => item.name).join(", ")} repository with ${packages.length} reported packages and ${boundaries.length} call boundaries.`,
    languages,
    packages,
    entryPoints,
    boundaries,
    completeness: "complete",
    limitations: ["architecture overview is parsed from the bounded v0.10.8 text format"],
  };
}

function tableRows(value: JsonObject, operation: string): readonly Readonly<Record<string, unknown>>[] {
  const columns = value.cols;
  const rows = value.rows;
  if (!Array.isArray(columns) || !columns.every((column) => typeof column === "string") || !Array.isArray(rows)) {
    malformed(operation, "response table requires cols and rows arrays");
  }
  return rows.map((row) => {
    if (!Array.isArray(row) || row.length !== columns.length) malformed(operation, "response row does not match cols");
    return Object.fromEntries(columns.map((column, index) => [column, row[index]]));
  });
}

function parseLines(value: unknown, operation: string): Readonly<{ startLine: number; endLine: number }> {
  const match = text(value, operation, "lines").match(/^(\d+)-(\d+)$/);
  if (!match?.[1] || !match[2]) malformed(operation, "lines must use start-end format");
  const startLine = Number(match[1]);
  const endLine = Number(match[2]);
  if (startLine < 1 || endLine < startLine) malformed(operation, "lines span is invalid");
  return { startLine, endLine };
}

export function parseSearch(response: unknown): readonly SearchHit[] {
  return tableRows(structured(response, "search_graph"), "search_graph").map((row) => ({
    qualifiedName: text(row.qn, "search_graph", "qn"),
    label: text(row.label, "search_graph", "label"),
    source: {
      path: text(row.file, "search_graph", "file"),
      ...parseLines(row.lines, "search_graph"),
    },
  }));
}

export function parseTrace(response: unknown): TraceResult {
  const result = structured(response, "trace_path");
  const direction = text(result.direction, "trace_path", "direction");
  if (!["inbound", "outbound", "both"].includes(direction)) malformed("trace_path", "direction is invalid");
  const groupKey = direction === "inbound" ? "callers" : "callees";
  const groupsValue = object(result[groupKey], "trace_path", groupKey);
  if (!Array.isArray(groupsValue.groups)) malformed("trace_path", `${groupKey}.groups must be an array`);
  const calls = groupsValue.groups.flatMap((groupValue) => {
    const group = object(groupValue, "trace_path", "trace group");
    const prefix = text(group.qn_prefix, "trace_path", "qn_prefix");
    return tableRows({ cols: groupsValue.cols, rows: group.rows }, "trace_path").map((row) => {
      const name = text(row.name, "trace_path", "call name");
      return { qualifiedName: `${prefix}.${name}`, name, hop: integer(row.hop, "trace_path", "hop", 1) };
    });
  });
  return {
    functionName: text(result.function, "trace_path", "function"),
    direction: direction as TraceResult["direction"],
    calls: calls.sort((left, right) => left.hop - right.hop || left.qualifiedName.localeCompare(right.qualifiedName)),
  };
}

function repositorySource(repositoryRoot: string, providerPath: string): string {
  const absoluteRoot = path.resolve(repositoryRoot);
  const candidate = path.isAbsolute(providerPath) ? path.resolve(providerPath) : path.resolve(absoluteRoot, providerPath);
  const relative = path.relative(absoluteRoot, candidate).split(path.sep).join("/");
  if (!relative || relative.startsWith("../") || path.isAbsolute(relative)) {
    throw new CodebaseMemoryError("UNSAFE_SOURCE_PATH", "get_code_snippet", "provider source path is outside the repository");
  }
  return relative;
}

export function parseSnippet(repositoryRoot: string, response: unknown): SourceSnippet {
  const value = structured(response, "get_code_snippet");
  const startLine = integer(value.start_line, "get_code_snippet", "start_line", 1);
  const endLine = integer(value.end_line, "get_code_snippet", "end_line", startLine);
  return {
    qualifiedName: text(value.qualified_name, "get_code_snippet", "qualified_name"),
    name: text(value.name, "get_code_snippet", "name"),
    label: text(value.label, "get_code_snippet", "label"),
    source: { path: repositorySource(repositoryRoot, text(value.file_path, "get_code_snippet", "file_path")), startLine, endLine },
    text: text(value.source, "get_code_snippet", "source"),
  };
}
