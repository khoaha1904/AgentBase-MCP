import fs from "node:fs";
import path from "node:path";
import { isDeniedDiscoveryPath, isTestOrDocumentationPath, MAX_CENSUS_FILE_BYTES, walkCensusFiles } from "./census.ts";

export type NameRepository = Readonly<{ id: string; root: string; repositoryId?: string; remotes?: readonly string[] }>;
export type NameEvidence = Readonly<{ repo: string; path: string; line: number }>;
type Value = Readonly<{ text: string; evidence: readonly NameEvidence[] }>;
type Observation = Readonly<{
  repo: string; role: "definition" | "use"; name: string; key: string; partial: boolean;
  family: string; kind: string; mechanism: string; evidence: readonly NameEvidence[]; strength: number;
}>;
export type NameLink = Readonly<{
  name: string; defining_repo: string; using_repo: string; kind: string;
  confidence: "exact" | "normalized"; mechanisms: readonly string[];
  evidence: Readonly<{ definition: readonly NameEvidence[]; usage: readonly NameEvidence[] }>;
}>;
export type NameQuestion = Readonly<{
  reason: "duplicate-definition" | "unresolved-interpolation" | "distinctive-literal";
  name: string; repos: readonly string[]; evidence: readonly NameEvidence[]; confidence?: "partial";
}>;
export type NameMatchResult = Readonly<{
  links: readonly NameLink[]; questions: readonly NameQuestion[];
  referencedNotDefined: readonly Readonly<{ name: string; repo: string; evidence: readonly NameEvidence[] }>[];
  moduleVersionDrift: Readonly<{ modules: number; repositories: number }>;
  limitations: readonly string[];
}>;
const ENVIRONMENT = new Set(["dev", "development", "qa", "test", "stage", "staging", "uat", "prod", "prd", "production", "live", "nonprod"]);
const GENERIC = new Set(["queue", "topic", "bucket", "table", "service", "function", "lambda", "main", "default", "application", "endpoint", "resource", "example", "shared", "module", "worker"]);
const SECRET_KEY = /(?:password|passwd|token|secret|api[-_]?key|access[-_]?key|private[-_]?key|credential)/i;

function resourceName(raw: string): string {
  let value = raw.trim().replace(/^['"]|['"]$/g, "");
  const arn = value.match(/^arn:[^:]+:(sqs|sns|s3|dynamodb|lambda|ssm):(?:\$\{[^}]+\}|[^:])*:(?:\$\{[^}]+\}|[^:])*:(.+)$/i);
  if (arn) value = arn[2]!.replace(/^(?:table|function|parameter)[:/]/, "").split(/[:?]/)[0]!;
  else if (/^arn:[^:]+:s3:::/i.test(value)) value = value.replace(/^arn:[^:]+:s3:::/i, "").split("/")[0]!;
  else if (/^https?:\/\//i.test(value)) {
    const url = value.replace(/^https?:\/\//i, "").split(/[?#]/)[0]!;
    const slash = url.indexOf("/"), host = (slash < 0 ? url : url.slice(0, slash)).split("@").at(-1)!;
    const tail = slash < 0 ? "" : url.slice(slash + 1);
    if (/^sqs[.]/i.test(host)) value = tail.split("/").at(-1)!;
    else if (/^(?:sns|dynamodb)[.]/i.test(host)) value = tail.replace(/^table\//, "").split("/").at(-1)!;
    else if (/[.]s3(?:[.-]|$)/i.test(host)) value = host.split(/\.s3/i)[0]!;
    else if (/^s3[.-]/i.test(host)) value = tail.split("/")[0]!;
    else value = tail || host;
  }
  return value.replace(/-(?:\$\{(?:var\.|local\.)?(?:region|account[-_]?id)\}|(?:us|eu|ap|sa|ca|me|af|il|mx)-(?:gov-)?[a-z]+-\d|\d{12})(?=-|$)/gi, "");
}

export function normalizeSourceName(raw: string): string {
  return resourceName(raw).replace(/\$\{[^}]+\}/g, "*")
    .replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase()
    .replace(/[^a-z\d*]+/g, "-").split("-").filter((token) => token && !ENVIRONMENT.has(token)).join("-");
}

function useful(key: string): boolean {
  const tokens = key.split("-").filter((token) => token !== "*");
  return tokens.join("").length >= 8 && tokens.length >= 2 && !tokens.every((token) => GENERIC.has(token))
    && key.length <= 256;
}

function uniqueEvidence(values: readonly NameEvidence[]): NameEvidence[] {
  return [...new Map(values.map((item) => [`${item.repo}:${item.path}:${item.line}`, item])).values()].slice(0, 16);
}

function uncomment(source: string): string {
  return source.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\*[\s\S]*?\*\/|<!--[^]*?-->|(?:#|\/\/)[^\n]*/g,
    (match) => match.startsWith('"') || match.startsWith("'") ? match : match.replace(/[^\n]/g, " "));
}

function blocks(source: string, expression: RegExp): Readonly<{ match: RegExpExecArray; body: string; offset: number }>[] {
  const result = [];
  for (const match of source.matchAll(expression)) {
    const start = match.index + match[0].length, tokens = /"(?:\\.|[^"\\])*"|[{}]/g;
    tokens.lastIndex = start;
    let depth = 1, token: RegExpExecArray | null;
    while ((token = tokens.exec(source))) {
      if (token[0] === "{") depth++;
      if (token[0] === "}" && --depth === 0) {
        result.push({ match, body: source.slice(start, token.index), offset: start }); break;
      }
    }
  }
  return result;
}

function assignments(source: string) {
  return [...source.matchAll(/([A-Za-z_][\w.-]*)\s*=\s*("(?:\\.|[^"\\])*"|(?:var|local)\.[\w-]+|(?:data\.)?aws_[\w]+\.[\w-]+\.(?:name|arn|id|url))(?=[ \t]*(?:[,;\r\n}]|$))/g)];
}

function topAssignments(source: string) {
  let depth = 0;
  const scalar = source.replace(/"(?:\\.|[^"\\])*"|[{}]|[^"{}]+/g, (token) => {
    if (token === "{") { depth++; return " "; }
    if (token === "}") { depth--; return " "; }
    return depth > 0 ? token.replace(/[^\n]/g, " ") : token;
  });
  return assignments(scalar);
}

function namingAttributes(resourceType: string): readonly string[] {
  return ["name", "name_prefix", ...(resourceType === "aws_lambda_function" ? ["function_name"] : []),
    ...(resourceType === "aws_s3_bucket" ? ["bucket"] : [])];
}

function extract(repository: NameRepository, distinctive: boolean) {
  if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/.test(repository.id) || !path.isAbsolute(repository.root)
    || fs.lstatSync(repository.root).isSymbolicLink() || !fs.statSync(repository.root).isDirectory()) throw new Error("Invalid source-name repository");
  const marker = path.join(repository.root, ".git");
  if (!fs.existsSync(marker) || fs.lstatSync(marker).isSymbolicLink()) throw new Error("Source-name repository must be a Git root");
  const census = walkCensusFiles(repository.root, "standard");
  const files = census.files.filter((relative) => !isTestOrDocumentationPath(relative) && !/(?:^|\/)(?:stubs?|mocks?|examples?)\//i.test(relative))
    .flatMap((relative) => {
      const target = path.join(repository.root, relative), stat = fs.lstatSync(target);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_CENSUS_FILE_BYTES || isDeniedDiscoveryPath(relative)) return [];
      return [{ relative, text: uncomment(fs.readFileSync(target, "utf8")) }];
    });
  const evidence = (relative: string, text: string, offset: number): NameEvidence => ({ repo: repository.id,
    path: relative, line: text.slice(0, offset).split("\n").length });
  const variables = new Map<string, Value[]>(), locals = new Map<string, Value[]>(), properties = new Map<string, Value[]>(), references = new Map<string, Value[]>();
  const add = (map: Map<string, Value[]>, key: string, value: Value) => {
    if (SECRET_KEY.test(key)) return;
    const values = map.get(key) ?? [];
    if (values.length < 16 && !values.some((item) => item.text === value.text)) { values.push(value); map.set(key, values); }
  };
  for (const file of files) {
    const value = (text: string, offset: number): Value => ({ text: text.replace(/^"|"$/g, ''), evidence: [evidence(file.relative, file.text, offset)] });
    if (/\.tfvars$/.test(file.relative)) for (const entry of topAssignments(file.text)) add(variables, entry[1]!, value(entry[2]!, entry.index));
    if (/\.hcl$/.test(file.relative)) for (const block of blocks(file.text, /\binputs\s*=\s*\{/g)) for (const entry of topAssignments(block.body)) {
      add(variables, entry[1]!, value(entry[2]!, block.offset + entry.index));
    }
    if (/\.(?:tf|hcl)$/.test(file.relative)) {
      for (const block of blocks(file.text, /\b(resource|data)\s+"(aws_[\w]+)"\s+"([\w-]+)"\s*\{/g)) {
        const entry = topAssignments(block.body).find((item) => namingAttributes(block.match[2]!).includes(item[1]!));
        if (entry) for (const attribute of ["name", "arn", "id", "url"]) add(references,
          `${path.posix.dirname(file.relative)}:${block.match[1] === "data" ? "data." : ""}${block.match[2]}.${block.match[3]}.${attribute}`,
          value(entry[2]!, block.offset + entry.index));
      }
      for (const block of blocks(file.text, /\bvariable\s+"([\w-]+)"\s*\{/g)) {
        const entry = topAssignments(block.body).find((item) => item[1] === "default");
        if (entry) add(variables, `${path.posix.dirname(file.relative)}:${block.match[1]}`, value(entry[2]!, block.offset + entry.index));
      }
      for (const block of blocks(file.text, /\blocals\s*\{/g)) for (const entry of topAssignments(block.body)) {
        add(locals, `${path.posix.dirname(file.relative)}:${entry[1]}`, value(entry[2]!, block.offset + entry.index));
      }
    }
    if (/\.properties$/.test(file.relative)) for (const match of file.text.matchAll(/^\s*([\w.-]+)\s*[=:]\s*([^\n\r]+)/gm)) {
      add(properties, match[1]!, value(match[2]!, match.index));
    }
    if (path.posix.basename(file.relative) === "pom.xml") {
      const body = file.text.match(/<properties>([^]*?)<\/properties>/)?.[1] ?? "";
      for (const match of body.matchAll(/<([\w.-]+)>\s*([^<]+)\s*<\/\1>/g)) add(properties, match[1]!, value(match[2]!, Math.max(0, file.text.indexOf(match[0]))));
    }
  }
  const resolve = (value: Value, relative: string, depth = 0): Value[] => {
    if (depth >= 2) return [value];
    const expressions = [...value.text.matchAll(/\$\{([^}]+)\}|^((?:var|local)\.[\w-]+|(?:data\.)?aws_\w+\.[\w-]+\.(?:name|arn|id|url))$/g)];
    let values = [value];
    for (const reference of expressions) {
      const key = reference[1] ?? reference[2]!, [kind, ...parts] = key.split("."), name = parts.join(".");
      let configured = kind === "var" ? variables.get(`${path.posix.dirname(relative)}:${name}`) ?? variables.get(name)
        : kind === "local" ? locals.get(`${path.posix.dirname(relative)}:${name}`)
          : references.get(`${path.posix.dirname(relative)}:${key}`) ?? properties.get(key);
      if (!configured && /^(?:var|local)\.(?:environment|env)$/.test(key)) {
        const environment = relative.split("/").find((part) => ENVIRONMENT.has(part));
        if (environment) configured = [{ text: environment, evidence: [] }];
      }
      if (!configured) {
        if (reference[2]) values = values.map((current) => ({ ...current, text: current.text.replace(reference[0], `\${${key}}`) }));
        continue;
      }
      values = values.flatMap((current) => configured!.flatMap((item) => resolve(item, relative, depth + 1)
        .map((resolved) => ({ text: current.text.replace(reference[0], resolved.text), evidence: uniqueEvidence([...current.evidence, ...resolved.evidence]) })))).slice(0, 16);
    }
    return values;
  };
  const observations: Observation[] = [], literals: Value[] = [], modules: { identity: string; ref: string; repo: string }[] = [];
  const emit = (role: Observation["role"], raw: Value, relative: string, family: string, kind: string, mechanism: string, strength = 1) => {
    for (const value of resolve(raw, relative)) {
      const name = resourceName(value.text), key = normalizeSourceName(name);
      if (!useful(key) || observations.length >= 4096) continue;
      observations.push({ repo: repository.id, role, name, key, family, kind, mechanism,
        partial: /\$\{[^}]+\}/.test(name) || /^(?:var|local)\./.test(name), evidence: value.evidence, strength });
    }
  };
  const moduleEvidence = files.filter((file) => /\.tf$/.test(file.relative)).slice(0, 16);
  for (const name of new Set([path.basename(repository.root), ...(repository.remotes ?? []).flatMap((remote) => {
    const name = remote.replace(/\.git$/, "").split(/[/:]/).at(-1); return name ? [name] : [];
  })])) if (moduleEvidence.length) emit("definition", { text: name,
    evidence: moduleEvidence.map((file) => ({ repo: repository.id, path: file.relative, line: 1 })) },
    moduleEvidence[0]!.relative, "module", "depends-on", "git-repository");
  const operation = (text: string): string => /send_?Message|publish(?:\s*\(|\b)|PublishCommand/i.test(text) ? "publishes-to"
    : /put_?Item|PutCommand|put_?Object|write|save\s*\(/i.test(text) ? "writes-to"
    : /receive_?Message|get_?Item|get_?Object|poll\s*\(|consume|event_source_arn/i.test(text) ? "reads-from" : "depends-on";
  const codeFiles = files.filter((file) => /\.(?:[cm]?js|tsx?|py|java|groovy|kt)$/.test(file.relative));
  const envReads = codeFiles.flatMap((file) => {
    const reads = [...file.text.matchAll(/process\.env\.([\w]+)|(?:os\.(?:environ(?:\.get\(|\[)|getenv\()|System\.getenv\()\s*["']([^"']+)["']/g)]
      .map((match) => ({ key: match[1] ?? match[2]!, evidence: evidence(file.relative, file.text, match.index), kind: operation(file.text.slice(Math.max(0, match.index - 100), match.index + 180)) }));
    for (const match of file.text.matchAll(/\{([^}]+)\}\s*=\s*process\.env/g)) for (const key of match[1]!.split(",").map((item) => item.trim().split(/[:=]/)[0]!.trim())) {
      if (/^\w+$/.test(key)) reads.push({ key, evidence: evidence(file.relative, file.text, match.index), kind: operation(file.text) });
    }
    return reads;
  });
  for (const file of files) {
    const value = (text: string, offset: number): Value => ({ text: text.replace(/^"|"$/g, ''), evidence: [evidence(file.relative, file.text, offset)] });
    if (/\.(?:tf|hcl)$/.test(file.relative)) {
      for (const block of blocks(file.text, /\b(resource|data)\s+"(aws_[\w]+)"\s+"([\w-]+)"\s*\{/g)) {
        for (const entry of topAssignments(block.body).filter((item) => namingAttributes(block.match[2]!).includes(item[1]!))) {
          const family = block.match[2]!.replace(/^aws_/, "");
          emit(block.match[1] === "resource" ? "definition" : "use", value(entry[2]!, block.offset + entry.index), file.relative,
            family, /sqs_queue|s3_bucket|dynamodb_table/.test(family) ? "reads-from" : "depends-on", `terraform-${block.match[1]}`);
        }
      }
      for (const block of blocks(file.text, /\bmodule\s+"([\w-]+)"\s*\{/g)) for (const entry of topAssignments(block.body)) {
        if (["service-name", "function_name", "name"].includes(entry[1]!)) emit("definition", value(entry[2]!, block.offset + entry.index), file.relative, "resource", "depends-on", "module-name");
      }
      for (const entry of assignments(file.text)) {
        if (SECRET_KEY.test(entry[1]!)) continue;
        for (const read of envReads.filter((item) => item.key === entry[1])) emit("use", {
          ...value(entry[2]!, entry.index), evidence: [evidence(file.relative, file.text, entry.index), read.evidence],
        }, file.relative, "resource", read.kind, "function-environment", 3);
      }
    }
    if (/\.java$/.test(file.relative)) {
      for (const match of file.text.matchAll(/@Value\(\s*"\$\{([^}:]+)(?::[^}]+)?\}"/g)) {
        emit("use", { text: `\${${match[1]}}`, evidence: [evidence(file.relative, file.text, match.index)] }, file.relative,
          "resource", operation(file.text), "spring-value", 3);
      }
      const classIndex = file.text.search(/\bclass\s+/), annotation = file.text.slice(0, Math.max(0, classIndex));
      for (const match of annotation.matchAll(/@RequestMapping\(\s*(?:(?:value|path)\s*=\s*)?"([^"\n]+)"/g)) emit("definition", value(match[1]!, match.index), file.relative, "http", "depends-on", "class-request-mapping");
    }
    if (path.posix.basename(file.relative) === "package.json") {
      try {
        const json = JSON.parse(file.text) as { name?: unknown; dependencies?: Record<string, unknown>; peerDependencies?: Record<string, unknown>; optionalDependencies?: Record<string, unknown> };
        if (typeof json.name === "string") emit("definition", value(json.name, file.text.indexOf('"name"')), file.relative, "npm", "depends-on", "npm-package");
        for (const group of [json.dependencies, json.peerDependencies, json.optionalDependencies]) for (const name of Object.keys(group ?? {})) {
          emit("use", value(name, Math.max(0, file.text.indexOf(JSON.stringify(name)))), file.relative, "npm", "depends-on", "npm-dependency");
        }
      } catch { /* Invalid manifests remain outside this bounded name matcher. */ }
    }
    if (path.posix.basename(file.relative) === "pom.xml") {
      const parentGroup = file.text.match(/<parent>([^]*?)<\/parent>/)?.[1]?.match(/<groupId>\s*([^<]+)\s*<\/groupId>/)?.[1];
      const coordinate = (body: string, fallback?: string) => {
        const group = body.match(/<groupId>\s*([^<]+)\s*<\/groupId>/)?.[1] ?? fallback;
        const artifact = body.match(/<artifactId>\s*([^<]+)\s*<\/artifactId>/)?.[1];
        return group && artifact ? `${group.trim()}:${artifact.trim()}` : undefined;
      };
      const own = file.text.replace(/<(?:parent|dependencies|dependencyManagement|build)>[^]*?<\/(?:parent|dependencies|dependencyManagement|build)>/g, "");
      const name = coordinate(own, parentGroup);
      if (name) emit("definition", value(name, Math.max(0, file.text.indexOf("<artifactId>"))), file.relative, "maven", "depends-on", "maven-project");
      for (const match of file.text.matchAll(/<dependency>([^]*?)<\/dependency>/g)) {
        if (/<scope>\s*test\s*<\/scope>/.test(match[1]!)) continue;
        const name = coordinate(match[1]!);
        if (name) emit("use", value(name, match.index), file.relative, "maven", "depends-on", "maven-dependency");
      }
    }
    if (/build\.gradle(?:\.kts)?$/.test(file.relative)) {
      const group = file.text.match(/\bgroup\s*=\s*["']([^"']+)["']/)?.[1];
      const name = file.text.match(/(?:rootProject\.name|archivesBaseName|archiveBaseName)\s*=\s*["']([^"']+)["']/)?.[1]
        ?? files.find((item) => /settings\.gradle(?:\.kts)?$/.test(item.relative))?.text.match(/rootProject\.name\s*=\s*["']([^"']+)["']/)?.[1];
      if (group && name) emit("definition", value(`${group}:${name}`, 0), file.relative, "maven", "depends-on", "gradle-project");
      for (const match of file.text.matchAll(/\b(?:implementation|api|compile|runtimeOnly|compileOnly)\s*\(?\s*["']([^:"']+):([^:"']+):[^"']+["']/g)) {
        emit("use", value(`${match[1]}:${match[2]}`, match.index), file.relative, "maven", "depends-on", "gradle-dependency");
      }
      for (const match of file.text.matchAll(/\b(?:implementation|api|compile|runtimeOnly|compileOnly)\s*\(?\s*group\s*:\s*["']([^"']+)["']\s*,\s*name\s*:\s*["']([^"']+)["']/g)) emit("use", value(`${match[1]}:${match[2]}`, match.index), file.relative, "maven", "depends-on", "gradle-dependency");
    }
    for (const match of file.text.matchAll(/["']((?:arn:[^"'\n]+|https?:\/\/[^"'\s]+))["']/g)) {
      const previous = file.text.slice(Math.max(0, match.index - 80), match.index);
      if (SECRET_KEY.test(previous.split(/\n|[,{}]/).at(-1)!)) continue;
      const raw = match[1]!;
      if (/\/\/[^/]*@|[?&](?:token|key|secret)=/i.test(raw)) continue;
      if (!raw.startsWith("arn:") && !/\.(?:[cm]?js|tsx?|py|java|groovy|kt)$/.test(file.relative)
        && (!/["']?[\w.-]*(?:url|uri|endpoint|host|address|queue[\w]*)["']?\s*[:=]\s*$/i.test(previous.trim())
          || path.posix.basename(file.relative) === "pom.xml")) continue;
      const kind = /event_source_arn/.test(previous) ? "reads-from" : "depends-on";
      emit("use", value(raw, match.index), file.relative, /arn:|amazonaws\.com/.test(raw) ? "resource" : "http", kind, /arn:/.test(raw) ? "aws-arn" : "resource-url", kind === "reads-from" ? 3 : 0);
    }
    for (const match of file.text.matchAll(/\bsource\s*=\s*"((?:(?:git::)?(?:ssh|https):\/\/|(?:git::)?git@|github\.com\/)[^"\s]+)"/g)) {
      const locator = match[1]!.replace(/^git::/, "").replace(/^(?:ssh|https):\/\/(?:git@)?/, "").replace(/^git@([^:]+):/, "$1/");
      const [address, query] = locator.split("?"), repositoryName = address!.match(/^[^/]+\/[^/]+\/([^/]+?)(?:\.git)?(?:\/\/|$)/)?.[1];
      const module = address!.split("//")[1] ?? "";
      if (!repositoryName) continue;
      const identity = `${normalizeSourceName(repositoryName)}:${module}`;
      const ref = new URLSearchParams(query ?? "").get("ref");
      if (ref) modules.push({ identity, ref, repo: repository.id });
      emit("use", value(repositoryName, match.index), file.relative, "module", "depends-on", "git-module");
    }
    if (distinctive && /\.(?:json|properties|ya?ml|tf|hcl|tfvars|toml)$/.test(file.relative)) for (const match of file.text.matchAll(/["']([^"'\n]{8,128})["']/g)) {
      if (useful(normalizeSourceName(match[1]!)) && /[-_/]/.test(match[1]!) && !/[:@?]/.test(match[1]!)) literals.push(value(match[1]!, match.index));
    }
  }
  const limitations = [
    ...(census.truncated ? [`${repository.id}: source census was sampled`] : []),
    ...(census.oversized ? [`${repository.id}: ${census.oversized} oversized files omitted`] : []),
    ...(observations.length >= 4096 ? [`${repository.id}: name observation bound reached`] : []),
  ];
  return { observations, modules, literals, limitations };
}

export function matchRepositoryNames(repositories: readonly NameRepository[], options: Readonly<{ distinctiveLiterals?: boolean }> = {}): NameMatchResult {
  if (repositories.length < 2 || repositories.length > 32 || new Set(repositories.map((item) => item.id)).size !== repositories.length
    || new Set(repositories.map((item) => fs.realpathSync(item.root))).size !== repositories.length) throw new Error("Source-name matching requires 2..32 unique repositories");
  const extracted = repositories.map((item) => extract(item, options.distinctiveLiterals === true));
  const observations = extracted.flatMap((item) => item.observations), questions: NameQuestion[] = [], links: NameLink[] = [];
  const missing: NameMatchResult["referencedNotDefined"][number][] = [];
  let frequentNames = 0;
  const grouped = new Map<string, Observation[]>();
  for (const item of observations) {
    const entries = grouped.get(item.key) ?? []; entries.push(item); grouped.set(item.key, entries);
  }
  for (const [key, entries] of [...grouped].sort(([a], [b]) => a.localeCompare(b))) {
    const repoIds = [...new Set(entries.map((item) => item.repo))].sort();
    if (repoIds.length > Math.max(8, Math.ceil(repositories.length * 0.75))) { frequentNames++; continue; }
    const definitions = entries.filter((item) => item.role === "definition"), uses = entries.filter((item) => item.role === "use");
    const definitionRepos = [...new Set(definitions.map((item) => item.repo))];
    if (definitionRepos.length > 1) {
      questions.push({ reason: "duplicate-definition", name: key, repos: definitionRepos.sort(), evidence: uniqueEvidence(definitions.flatMap((item) => item.evidence)) }); continue;
    }
    if (entries.some((item) => item.partial)) {
      const pattern = new RegExp(`^${key.replaceAll("*", ".*")}$`);
      const potential = key.includes("*") ? observations.filter((item) => item.role === "definition" && !item.partial && pattern.test(item.key)) : [];
      questions.push({ reason: "unresolved-interpolation", name: key,
        repos: [...new Set([...repoIds, ...potential.map((item) => item.repo)])].sort(), confidence: "partial",
        evidence: uniqueEvidence([...entries, ...potential].flatMap((item) => item.evidence)) }); continue;
    }
    if (!definitions.length) {
      for (const repo of [...new Set(uses.map((item) => item.repo))]) missing.push({ name: key, repo,
        evidence: uniqueEvidence(uses.filter((item) => item.repo === repo).flatMap((item) => item.evidence)) });
      continue;
    }
    for (const repo of [...new Set(uses.map((item) => item.repo))].sort()) {
      if (repo === definitionRepos[0]) continue;
      const usage = uses.filter((item) => item.repo === repo && (item.family === "resource" || definitions.some((definition) => definition.family === item.family || definition.family === "resource")));
      if (!usage.length) continue;
      const strength = Math.max(...usage.map((item) => item.strength)), strongest = usage.filter((item) => item.strength === strength);
      const kinds = [...new Set(strongest.map((item) => item.kind))];
      for (const kind of kinds) links.push({ name: key, defining_repo: definitionRepos[0]!, using_repo: repo, kind,
        confidence: strongest.some((use) => definitions.some((definition) => definition.name === use.name)) ? "exact" : "normalized",
        mechanisms: [...new Set(usage.map((item) => item.mechanism))].sort(),
        evidence: { definition: uniqueEvidence(definitions.flatMap((item) => item.evidence)), usage: uniqueEvidence(usage.flatMap((item) => item.evidence)) } });
    }
  }
  if (options.distinctiveLiterals) {
    const literals = new Map<string, Value[]>();
    for (const item of extracted.flatMap((item) => item.literals)) {
      const key = normalizeSourceName(item.text), entries = literals.get(key) ?? []; entries.push(item); literals.set(key, entries);
    }
    for (const [name, entries] of literals) {
      const repos = [...new Set(entries.flatMap((item) => item.evidence.map((source) => source.repo)))].sort();
      if (repos.length > 1 && repos.length <= 8) questions.push({ reason: "distinctive-literal", name, repos, evidence: uniqueEvidence(entries.flatMap((item) => item.evidence)) });
    }
  }
  const modules = extracted.flatMap((item) => item.modules), drift = [...new Set(modules.map((item) => item.identity))]
    .filter((identity) => new Set(modules.filter((item) => item.identity === identity).map((item) => item.ref)).size > 1);
  return { links, questions, referencedNotDefined: missing,
    moduleVersionDrift: { modules: drift.length, repositories: new Set(modules.filter((item) => drift.includes(item.identity)).map((item) => item.repo)).size },
    limitations: [...extracted.flatMap((item) => item.limitations),
      ...(frequentNames ? [`${frequentNames} names shared by too many repositories were suppressed`] : []),
      "Names are source hints, not deployed identity or interaction proof; dynamic/external config, deploy order and external CI are unsupported."] };
}
