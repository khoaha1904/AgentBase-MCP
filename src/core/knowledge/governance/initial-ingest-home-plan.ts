import {
  normalizeConfirmedDomain,
  type ConfirmedDomain,
} from "./confirmed-domain.ts";

const CANDIDATE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const MAXIMUM_ASSIGNMENTS = 64;

export type AgentBaseHomeSelection =
  | Readonly<{ kind: "shared" }>
  | Readonly<{
    kind: "domain";
    identity: string;
    title: string;
    evidenceResource: string;
  }>;

export type AgentBaseInitialIngestHomePlan = Readonly<{
  defaultHome: AgentBaseHomeSelection;
  exceptions: readonly Readonly<{
    candidateId: string;
    home: AgentBaseHomeSelection;
  }>[];
  participations: readonly Readonly<{
    candidateId: string;
    domain: ConfirmedDomain;
  }>[];
}>;

function record(value: unknown, name: string): Readonly<Record<string, unknown>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${name} must be an object`);
  return value as Readonly<Record<string, unknown>>;
}

function exactKeys(value: Readonly<Record<string, unknown>>, expected: readonly string[], name: string): void {
  const actual = Object.keys(value).sort(), wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${name} contains unknown or missing fields`);
  }
}

function candidateId(value: unknown, name: string): string {
  if (typeof value !== "string" || !CANDIDATE_ID.test(value)) throw new Error(`${name} is invalid`);
  return value;
}

function homeSelection(value: unknown, name: string): AgentBaseHomeSelection {
  const input = record(value, name);
  if (input.kind === "shared") {
    exactKeys(input, ["kind"], name);
    return { kind: "shared" };
  }
  if (input.kind !== "domain") throw new Error(`${name} kind must be domain or shared`);
  exactKeys(input, ["kind", "identity", "title"], name);
  return { kind: "domain", ...normalizeConfirmedDomain({ identity: input.identity, title: input.title }) };
}

function rememberDomain(
  domains: Map<string, string>,
  selection: AgentBaseHomeSelection | ConfirmedDomain,
): void {
  if (!("identity" in selection)) return;
  const previous = domains.get(selection.identity);
  if (previous !== undefined && previous !== selection.title) {
    throw new Error(`home plan Domain ${selection.identity} has conflicting titles`);
  }
  domains.set(selection.identity, selection.title);
}

export function normalizeAgentBaseInitialIngestHomePlan(value: unknown): AgentBaseInitialIngestHomePlan {
  const input = record(value, "home plan");
  exactKeys(input, ["default_home", "exceptions", "participations"], "home plan");
  if (!Array.isArray(input.exceptions) || input.exceptions.length > MAXIMUM_ASSIGNMENTS
    || !Array.isArray(input.participations) || input.participations.length > MAXIMUM_ASSIGNMENTS) {
    throw new Error("home plan assignments must be arrays with at most 64 entries each");
  }
  const domains = new Map<string, string>();
  const defaultHome = homeSelection(input.default_home, "home plan default_home");
  rememberDomain(domains, defaultHome);
  const exceptionIds = new Set<string>();
  const exceptions = input.exceptions.map((raw, index) => {
    const entry = record(raw, `home plan exception ${index + 1}`);
    exactKeys(entry, ["candidate_id", "home"], `home plan exception ${index + 1}`);
    const id = candidateId(entry.candidate_id, `home plan exception ${index + 1} candidate_id`);
    if (exceptionIds.has(id)) throw new Error(`home plan exception candidate is duplicated: ${id}`);
    exceptionIds.add(id);
    const home = homeSelection(entry.home, `home plan exception ${id} home`);
    rememberDomain(domains, home);
    return { candidateId: id, home };
  }).sort((left, right) => left.candidateId.localeCompare(right.candidateId));
  const participationKeys = new Set<string>();
  const participations = input.participations.map((raw, index) => {
    const entry = record(raw, `home plan participation ${index + 1}`);
    exactKeys(entry, ["candidate_id", "domain"], `home plan participation ${index + 1}`);
    const id = candidateId(entry.candidate_id, `home plan participation ${index + 1} candidate_id`);
    const domainInput = record(entry.domain, `home plan participation ${id} domain`);
    exactKeys(domainInput, ["identity", "title"], `home plan participation ${id} domain`);
    const domain = normalizeConfirmedDomain(domainInput);
    const key = `${id}\0${domain.identity}`;
    if (participationKeys.has(key)) throw new Error(`home plan participation is duplicated: ${id}/${domain.identity}`);
    participationKeys.add(key);
    rememberDomain(domains, domain);
    return { candidateId: id, domain };
  }).sort((left, right) => left.candidateId.localeCompare(right.candidateId)
    || left.domain.identity.localeCompare(right.domain.identity));
  return { defaultHome, exceptions, participations };
}

function externalHome(value: unknown, name: string): Readonly<Record<string, unknown>> {
  const input = record(value, name);
  if (input.kind === "shared") {
    exactKeys(input, ["kind"], name);
    return { kind: "shared" };
  }
  exactKeys(input, ["kind", "identity", "title", "evidenceResource"], name);
  return { kind: input.kind, identity: input.identity, title: input.title };
}

export function validateAgentBaseInitialIngestHomePlan(value: unknown): AgentBaseInitialIngestHomePlan {
  const input = record(value, "normalized home plan");
  exactKeys(input, ["defaultHome", "exceptions", "participations"], "normalized home plan");
  if (!Array.isArray(input.exceptions) || !Array.isArray(input.participations)) {
    throw new Error("normalized home plan assignments must be arrays");
  }
  const normalized = normalizeAgentBaseInitialIngestHomePlan({
    default_home: externalHome(input.defaultHome, "normalized defaultHome"),
    exceptions: input.exceptions.map((raw, index) => {
      const entry = record(raw, `normalized exception ${index + 1}`);
      exactKeys(entry, ["candidateId", "home"], `normalized exception ${index + 1}`);
      return { candidate_id: entry.candidateId, home: externalHome(entry.home, `normalized exception ${index + 1} home`) };
    }),
    participations: input.participations.map((raw, index) => {
      const entry = record(raw, `normalized participation ${index + 1}`);
      exactKeys(entry, ["candidateId", "domain"], `normalized participation ${index + 1}`);
      const domain = externalHome({ kind: "domain", ...record(entry.domain,
        `normalized participation ${index + 1} domain`) }, `normalized participation ${index + 1} domain`);
      const { kind: _kind, ...confirmedDomain } = domain;
      return { candidate_id: entry.candidateId, domain: confirmedDomain };
    }),
  });
  if (JSON.stringify(normalized) !== JSON.stringify(value)) throw new Error("normalized home plan is not canonical");
  return normalized;
}

export function legacyConfirmedDomainHomePlan(
  domain: ConfirmedDomain,
  participantCandidateIds: readonly string[],
): AgentBaseInitialIngestHomePlan {
  const unique = [...new Set(participantCandidateIds.map((value) => candidateId(value, "legacy participant candidate")))].sort();
  if (unique.length > MAXIMUM_ASSIGNMENTS) throw new Error("legacy Domain participation exceeds the home plan bound");
  return {
    defaultHome: { kind: "domain", ...domain },
    exceptions: [],
    participations: unique.map((candidateIdValue) => ({ candidateId: candidateIdValue, domain })),
  };
}

export function agentBaseCandidateHome(
  plan: AgentBaseInitialIngestHomePlan,
  candidate: string,
): AgentBaseHomeSelection {
  return plan.exceptions.find((entry) => entry.candidateId === candidate)?.home ?? plan.defaultHome;
}
