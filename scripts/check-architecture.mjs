#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const budgets = Object.freeze({
  production: { errorLines: 300, warningLines: 240, maxLine: 160, maxBytes: 20_000, maxDensity: 120, warningImports: 12 },
  test: { errorLines: 350, warningLines: 280, maxLine: 180, maxBytes: 24_000, maxDensity: 140, warningImports: 14 },
});
const metricKeys = ["lines", "bytes", "maxLine", "density", "localImports"];

function sourceFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isSymbolicLink()) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) files.push(...sourceFiles(full));
    else if (entry.isFile() && /\.ts$/.test(entry.name)) files.push(full);
  }
  return files;
}

function localImports(content) {
  return [...content.matchAll(/(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]+?\s+from\s+|import\s*\()\s*["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((specifier) => specifier.startsWith("."));
}

function resolveImport(file, specifier) {
  const raw = path.resolve(path.dirname(file), specifier);
  const options = [raw, `${raw}.ts`, path.join(raw, "index.ts")];
  return options.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function relative(root, file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function metricsFor(content, imports) {
  const physical = content.split(/\r?\n/);
  const nonblank = physical.filter((line) => line.trim());
  return {
    lines: physical.length,
    bytes: Buffer.byteLength(content),
    maxLine: Math.max(0, ...physical.map((line) => line.length)),
    density: Math.round(Buffer.byteLength(content) / Math.max(1, nonblank.length)),
    localImports: imports.length,
  };
}

function reviewViolations(metrics, budget) {
  const values = [];
  if (metrics.lines > budget.errorLines) values.push(`lines=${metrics.lines}>${budget.errorLines}`);
  if (metrics.maxLine > budget.maxLine) values.push(`maxLine=${metrics.maxLine}>${budget.maxLine}`);
  if (metrics.bytes > budget.maxBytes) values.push(`bytes=${metrics.bytes}>${budget.maxBytes}`);
  if (metrics.density > budget.maxDensity) values.push(`density=${metrics.density}>${budget.maxDensity}`);
  if (metrics.localImports > budget.warningImports) values.push(`localImports=${metrics.localImports}>${budget.warningImports}`);
  return values;
}

function exactMetrics(value) {
  return value && metricKeys.every((key) => Number.isInteger(value[key]) && value[key] >= 0);
}

function validApproval(value) {
  return typeof value?.approvedBy === "string" && Boolean(value.approvedBy.trim())
    && typeof value?.reason === "string" && Boolean(value.reason.trim());
}

function validFileException(value) {
  return ["legacy-debt", "cohesive-hotspot"].includes(value?.kind)
    && validApproval(value)
    && exactMetrics(value.ceilings)
    && (value.kind !== "cohesive-hotspot"
      || (typeof value.reviewWhen === "string" && Boolean(value.reviewWhen.trim())));
}

function forbiddenDirection(source, target) {
  if (source.startsWith("src/core/") && /^(?:src\/providers\/|src\/app\/)/.test(target)) return true;
  return source.startsWith("src/providers/") && target.startsWith("src/app/");
}

function findCycles(files, graph, root) {
  const complete = new Set();
  const stack = [];
  const cycles = new Set();
  const visit = (file) => {
    const position = stack.indexOf(file);
    if (position >= 0) {
      cycles.add([...stack.slice(position), file].map((item) => relative(root, item)).join(" → "));
      return;
    }
    if (complete.has(file)) return;
    stack.push(file);
    for (const target of graph.get(file) ?? []) visit(target);
    stack.pop();
    complete.add(file);
  };
  files.forEach(visit);
  return [...cycles].sort();
}

function changedFiles(root) {
  const commands = [
    ["diff", "--name-only", "HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ];
  const changed = new Set();
  for (const args of commands) {
    const result = spawnSync("git", [...args, "-z"], { cwd: root, encoding: "utf8" });
    if (result.status === 0) result.stdout.split("\0").filter(Boolean).forEach((file) => changed.add(path.resolve(root, file)));
  }
  return changed;
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function checkArchitecture(root, options = {}) {
  const boundariesFile = options.boundariesFile ?? path.join(root, "scripts", "module-boundaries.json");
  const baselineFile = options.baselineFile ?? path.join(root, "scripts", "architecture-baseline.json");
  const boundaries = readJson(boundariesFile, { schema: 1, composition: [], modules: [] });
  const baseline = readJson(baselineFile, { schema: 1, files: {}, edges: [] });
  const errors = [];
  const warnings = [];
  const measured = {};
  const error = (code, message) => errors.push({ code, message });
  const warn = (code, message) => warnings.push({ code, message });

  if (!boundaries || boundaries.schema !== 1 || !Array.isArray(boundaries.composition) || !Array.isArray(boundaries.modules)) {
    error("ARCH-REGISTRY-INVALID", "module registry must use schema 1 with composition and modules arrays");
  }
  if (!baseline || baseline.schema !== 1 || typeof baseline.files !== "object" || !Array.isArray(baseline.edges)) {
    error("ARCH-BASELINE-INVALID", "architecture baseline must use schema 1 with files and edges");
  }
  const safeBoundaries = boundaries ?? { composition: [], modules: [] };
  const safeBaseline = baseline ?? { files: {}, edges: [] };
  const files = sourceFiles(path.join(root, "src"));
  const selected = options.changedOnly ? changedFiles(root) : new Set(files);
  const graph = new Map();
  const edges = [];

  for (const file of files) {
    const name = relative(root, file);
    const content = fs.readFileSync(file, "utf8");
    const imports = localImports(content);
    const resolved = imports.map((specifier) => resolveImport(file, specifier)).filter(Boolean);
    graph.set(file, resolved);
    resolved.forEach((target) => edges.push({ source: name, target: relative(root, target) }));
    const metrics = metricsFor(content, imports);
    measured[name] = metrics;
    if (!selected.has(file)) continue;
    const budget = name.includes(".test.") ? budgets.test : budgets.production;
    const violations = reviewViolations(metrics, budget);
    const exception = safeBaseline.files?.[name];
    if (violations.length && !exception) error("ARCH-REVIEWABILITY", `${name}: ${violations.join(", ")}`);
    if (violations.length && exception) {
      if (!validFileException(exception)) error("ARCH-BASELINE-INVALID", `${name}: invalid exact file exception`);
      else {
        const growth = metricKeys.filter((key) => metrics[key] > exception.ceilings[key]);
        if (growth.length) error("ARCH-BASELINE-GROWTH", `${name}: grew ${growth.join(", ")}`);
        else warn("ARCH-BASELINED-FILE", `${name}: ${violations.join(", ")}`);
      }
    }
    if (!violations.length && metrics.lines > budget.warningLines) warn("ARCH-FILE-WARN", `${name}: lines=${metrics.lines}`);
  }

  const composition = new Set(safeBoundaries.composition ?? []);
  for (const entry of composition) {
    if (typeof entry !== "string" || !(entry in measured)) error("ARCH-COMPOSITION-STALE", `${String(entry)}: missing composition file`);
  }

  for (const module of safeBoundaries.modules ?? []) {
    if (typeof module?.root !== "string" || !module.root.startsWith("src/")
      || typeof module?.responsibility !== "string" || !module.responsibility.trim()
      || !Array.isArray(module.public)) {
      error("ARCH-REGISTRY-INVALID", "module entries require root, responsibility and public paths");
      continue;
    }
    const prefix = `${module.root.replace(/\/$/, "")}/`;
    const members = Object.keys(measured).filter((file) => file.startsWith(prefix));
    if (!members.length) error("ARCH-OWNER-STALE", `${module.root}: registered owner has no authored file`);
    for (const publicPath of module.public) {
      if (typeof publicPath !== "string" || !publicPath.startsWith(prefix) || !(publicPath in measured)) {
        error("ARCH-PUBLIC-INVALID", `${module.root}: invalid public path ${String(publicPath)}`);
      }
    }
    for (const edge of edges.filter((item) => item.target.startsWith(prefix) && !item.source.startsWith(prefix))) {
      if (!module.public.includes(edge.target)) error("ARCH-PRIVATE-IMPORT", `${edge.source} → ${edge.target}`);
    }
  }

  for (const file of Object.keys(measured)) {
    if (composition.has(file)) continue;
    const owners = (safeBoundaries.modules ?? []).filter((module) => typeof module?.root === "string" && file.startsWith(`${module.root.replace(/\/$/, "")}/`));
    if (!owners.length) error("ARCH-OWNER-UNKNOWN", `${file}: no capability owner`);
    else if (owners.length > 1) error("ARCH-OWNER-OVERLAP", `${file}: ${owners.map((owner) => owner.root).join(", ")}`);
  }

  for (const edge of edges.filter((item) => composition.has(item.target) && !composition.has(item.source))) {
    error("ARCH-COMPOSITION-IMPORT", `${edge.source} → ${edge.target}`);
  }

  const approvedEdges = new Map();
  for (const edge of safeBaseline.edges ?? []) {
    if (!validApproval(edge) || typeof edge.source !== "string" || typeof edge.target !== "string"
      || edge.source.includes("*") || edge.target.includes("*")) {
      error("ARCH-BASELINE-INVALID", "dependency exceptions require exact source, target, owner and reason");
    } else approvedEdges.set(`${edge.source}\0${edge.target}`, false);
  }
  for (const edge of edges.filter((item) => forbiddenDirection(item.source, item.target))) {
    const key = `${edge.source}\0${edge.target}`;
    if (approvedEdges.has(key)) {
      approvedEdges.set(key, true);
      warn("ARCH-BASELINED-EDGE", `${edge.source} → ${edge.target}`);
    } else error("ARCH-DIRECTION", `${edge.source} → ${edge.target}`);
  }
  for (const [key, used] of approvedEdges) {
    if (!used) error("ARCH-BASELINE-STALE", key.replace("\0", " → "));
  }

  for (const [file, exception] of Object.entries(safeBaseline.files ?? {})) {
    if (!validFileException(exception)) {
      error("ARCH-BASELINE-INVALID", `${file}: invalid file exception`);
      continue;
    }
    if (!(file in measured)) error("ARCH-BASELINE-STALE", `${file}: file missing`);
    else {
      const budget = file.includes(".test.") ? budgets.test : budgets.production;
      if (!reviewViolations(measured[file], budget).length) error("ARCH-BASELINE-STALE", `${file}: exception resolved`);
    }
  }

  findCycles(files, graph, root).forEach((cycle) => error("ARCH-CYCLE", cycle));
  return { errors, warnings, metrics: measured };
}

export function main(root = path.resolve(import.meta.dirname, ".."), args = process.argv.slice(2)) {
  const result = checkArchitecture(root, { changedOnly: args.includes("--changed") });
  result.errors.forEach((item) => console.error(`ERROR ${item.code}: ${item.message}`));
  result.warnings.forEach((item) => console.warn(`WARNING ${item.code}: ${item.message}`));
  console.log(result.errors.length || result.warnings.length
    ? `Architecture check: ${result.errors.length} error(s), ${result.warnings.length} warning(s).`
    : "Architecture checks passed.");
  return result.errors.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main();
