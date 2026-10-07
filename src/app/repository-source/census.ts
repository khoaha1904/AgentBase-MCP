import fs from "node:fs";
import path from "node:path";

const MAX_CENSUS_ENTRIES = 4_096;
export const MAX_CENSUS_FILE_BYTES = 64 * 1024;

function normalizedPath(value: string): string | undefined {
  const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "");
  if (!normalized || normalized.startsWith("/") || normalized.split("/").some((part) => !part || part === "." || part === "..")) {
    return undefined;
  }
  return normalized;
}

export function isDeniedDiscoveryPath(value: string): boolean {
  const normalized = normalizedPath(value);
  if (!normalized) return true;
  const parts = normalized.toLowerCase().split("/");
  const deniedDirectories = new Set([
    ".git", ".agentbase", ".codebase-memory", "node_modules", "vendor", "dist", "build",
    "coverage", "target", ".terraform", ".terragrunt-cache", ".gradle", ".serverless",
    ".cache", ".next", ".nuxt", "__pycache__",
  ]);
  if (parts.some((part) => deniedDirectories.has(part))) return true;
  const name = parts.at(-1)!;
  return name === ".env" || name.startsWith(".env.") || name.endsWith(".env")
    || [".netrc", ".npmrc", ".pypirc", "credentials", "credentials.json", "id_rsa", "id_ed25519"].includes(name)
    || [".pem", ".key", ".p12", ".pfx", ".crt", ".cer"].some((suffix) => name.endsWith(suffix));
}

function candidateFile(relative: string): boolean {
  const name = path.posix.basename(relative).toLowerCase();
  const extension = path.posix.extname(name);
  if ([".min.js", ".min.css", ".bundle.js", ".chunk.js"].some((suffix) => name.endsWith(suffix))) return false;
  return /^readme(?:\.|$)/i.test(name) || name.endsWith("web.xml")
    || ["codeowners", "dockerfile", "makefile", "terragrunt.hcl", "go.mod", "pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"].includes(name)
    || [".tf", ".tfvars", ".properties", ".xml", ".groovy", ".hcl", ".yaml", ".yml", ".json", ".template", ".toml", ".md", ".ts", ".tsx", ".js", ".mjs",
      ".cjs", ".py", ".go", ".java", ".sh", ".cs", ".kt", ".kts"].includes(extension);
}

export function isTestPath(relative: string): boolean {
  return /(?:^|\/)(?:tests?|__tests__|fixtures?|__fixtures__|mocks?|__mocks__|__files|mappings)\//i.test(relative)
    || /(?:Test|Tests|Spec)\.(?:java|kt|kts)$/.test(relative)
    || /(?:^|[\/._-])(?:test|spec)[._-]/i.test(relative)
    || /(?:_test\.go|_test\.py|\/test_[^/]+\.py)$/i.test(relative);
}

export function isTestOrDocumentationPath(relative: string): boolean {
  return isTestPath(relative) || /(?:^|\/)(?:docs?|documentation)\//i.test(relative)
    || /\.(?:md|markdown|mdx)$/i.test(relative);
}

export function isTestOrStubPath(relative: string): boolean {
  return isTestPath(relative) || /(?:^|\/)(?:stub|stubs|mocks?|__mocks__)\//i.test(relative);
}

export function readmeRank(relative: string): number {
  return /^readme(?:\.|$)/i.test(path.posix.basename(relative)) ? relative.includes("/") ? 1 : 0 : 2;
}

function priorityFile(relative: string): boolean {
  const name = path.posix.basename(relative).toLowerCase();
  return !isTestPath(relative) && /^readme(?:\.|$)/.test(name)
    || ["package.json", "pyproject.toml", "go.mod", "pom.xml", "build.gradle", "build.gradle.kts",
      "dockerfile", "makefile", "codeowners", "terragrunt.hcl"].includes(name)
    || !isTestOrDocumentationPath(relative) && name.endsWith("web.xml")
    || /\.(tf|tfvars|hcl|properties)$/.test(name) || /^(template|sam|serverless|compose|docker-compose)(?:\.|$)/.test(name)
    || /^(runbook|deploy|deployment|release).*\.md$/.test(name) || relative.startsWith(".github/workflows/")
    || !isTestOrDocumentationPath(relative) && /\.(?:java|kt|kts)$/.test(name) && (/(?:controller|resource|endpoint|application|main)(?:impl)?\.(?:java|kt|kts)$/.test(name)
      || /(?:^|\/)(?:controllers?|resources?|endpoints?)\//i.test(relative));
}

export function walkCensusFiles(root: string, mode: "standard" | "expanded") {
  const pending = [""];
  const files: string[] = [];
  const fileLimit = mode === "expanded" ? 1_024 : 256;
  let entries = 0;
  let entriesTruncated = false, oversized = 0;
  while (pending.length && entries < MAX_CENSUS_ENTRIES) {
    const relativeDirectory = pending.shift()!;
    const absoluteDirectory = relativeDirectory ? path.join(root, relativeDirectory) : root;
    const children = fs.readdirSync(absoluteDirectory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of children) {
      if (entries >= MAX_CENSUS_ENTRIES) { entriesTruncated = true; break; }
      entries += 1;
      const relative = normalizedPath(relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name);
      if (!relative || isDeniedDiscoveryPath(relative) || entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) pending.push(relative);
      else if (entry.isFile() && candidateFile(relative)) {
        if (fs.lstatSync(path.join(root, relative)).size <= MAX_CENSUS_FILE_BYTES) files.push(relative);
        else oversized += 1;
      }
    }
  }
  entriesTruncated ||= Boolean(pending.length);
  const ordered = files.sort();
  const priority = ordered.filter((file) => priorityFile(file))
    .sort((left, right) => Number(readmeRank(left) !== 0) - Number(readmeRank(right) !== 0));
  const ordinary = ordered.filter((file) => !priorityFile(file));
  const reserved = Math.min(ordinary.length, Math.floor(fileLimit / 4));
  const selected = new Set([...priority.slice(0, fileLimit - reserved), ...ordinary.slice(0, reserved)]);
  for (const file of [...priority, ...ordinary]) {
    if (selected.size >= fileLimit) break;
    selected.add(file);
  }
  return { files: [...selected].sort(), truncated: entriesTruncated || files.length > fileLimit, oversized,
    accounting: { mode, fileLimit, selectedFiles: selected.size, eligibleFiles: files.length,
      omittedPriorityFiles: priority.filter((file) => !selected.has(file)).length, entriesTruncated } };
}
