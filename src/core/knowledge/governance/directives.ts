import type { OkfBundle } from "../documents/okf-bundle.ts";
import type { OkfValue } from "../documents/okf-document.ts";

export type MaintainerDirective = Readonly<{
  id: string;
  action: "defer" | "reopen";
  subject: string;
  conceptId: string;
}>;

export type MaintainerDirectiveSet = Readonly<{
  directives: readonly MaintainerDirective[];
  deferredSubjects: ReadonlySet<string>;
  reopenedSubjects: ReadonlySet<string>;
  warnings: readonly string[];
}>;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>>
    : undefined;
}

function normalizedSubject(value: string): boolean {
  return Boolean(value) && !value.startsWith("/") && !value.endsWith(".md")
    && !value.split("/").some((part) => !part || part === "." || part === "..");
}

export function readMaintainerDirectives(bundle: OkfBundle): MaintainerDirectiveSet {
  const directives: MaintainerDirective[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  for (const concept of bundle.concepts.values()) {
    const generated = mapping(concept.frontmatter.generated);
    const isHumanGuidance = concept.type === "Maintainer Guidance"
      && concept.status === "stable"
      && typeof generated?.by === "string"
      && generated.by.startsWith("human:");
    const directive = mapping(mapping(concept.frontmatter.agentbase)?.directive);
    if (!directive) continue;
    if (!isHumanGuidance) {
      warnings.push(`${concept.path}: AgentBase directive is ignored because the concept is not stable human maintainer guidance`);
      continue;
    }
    const { id, action, subject } = directive;
    if (typeof id !== "string" || !/^AB-DIRECTIVE-[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)
      || (action !== "defer" && action !== "reopen") || typeof subject !== "string" || !normalizedSubject(subject)) {
      warnings.push(`${concept.path}: malformed AgentBase directive`);
      continue;
    }
    if (ids.has(id)) {
      warnings.push(`${concept.path}: duplicate AgentBase directive id ${id}`);
      continue;
    }
    ids.add(id);
    directives.push({ id, action, subject, conceptId: concept.conceptId });
  }
  const ordered = directives.sort((left, right) => left.id.localeCompare(right.id));
  return {
    directives: ordered,
    deferredSubjects: new Set(ordered.filter((directive) => directive.action === "defer").map((directive) => directive.subject)),
    reopenedSubjects: new Set(ordered.filter((directive) => directive.action === "reopen").map((directive) => directive.subject)),
    warnings: warnings.sort(),
  };
}
