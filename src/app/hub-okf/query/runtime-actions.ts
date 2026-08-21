import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  getOkfAuthoringGuidance, parseConceptDocument, repositorySourceResources, selectOkfConceptSchemas,
  type HubContinuityGap, type HubContinuityManifest,
} from "../../../core/knowledge/index.ts";
import { GitHubHubApi } from "../../../providers/github-hub/index.ts";
import type { AdmittedLocalHubState } from "../../../core/hub/index.ts";
import {
  discoverRepositorySourceChanges, discoverRepositorySourceState, resolveRepositorySourceRoot,
} from "../../repository-okf/index.ts";
import { beginHubAuthoringSession, finalizeHubAuthoringSession, readHubAuthoringSession } from "../authoring/authoring-session.ts";
import { writeInitialIngestSkeletons } from "../authoring/initial-ingest-skeleton.ts";
import { listHubQuestions } from "../authoring/questions.ts";
import { acceptHubProposal } from "../review/accept.ts";
import { resolveHubConfiguration, type OptionalHubConfiguration } from "../configuration/configuration.ts";
import { admitPersistentLocalHub } from "../workspace/local-hub.ts";
import type { HubToolActions } from "../mcp/mcp-tools.ts";
import { recoverSynchronizationTransaction } from "../publication/recovery.ts";
import {
  buildActiveHubContinuity,
  inspectInitialIngestHubContext,
  readActiveHubConcept,
  readActiveHubLiveEvidence,
  searchActiveHub,
  traverseActiveHub,
} from "./query.ts";
import { listPendingHubProposals } from "../review/pending.ts";
import { publishPendingHubProposals } from "../publication/publish.ts";
import { synchronizeLocalHub } from "../publication/synchronize.ts";
import { attachExistingHub, createLocalHub } from "../workspace/setup.ts";
import { executeHubBootstrap, previewHubBootstrap } from "../workspace/bootstrap.ts";
import { createReviewActions } from "../review/review-actions.ts";

function defaultStateRoot(): string {
  const owner = typeof process.getuid === "function" ? String(process.getuid()) : "portable";
  return path.join(os.tmpdir(), `agentbase-${owner}`, "hub-runtime");
}

function proposalRoot(stateRoot: string, proposalId: string): string {
  if (!/^[a-f0-9]{24}$/.test(proposalId)) throw new Error("Hub proposal ID is invalid");
  return path.join(stateRoot, "proposals", proposalId);
}

function requireHubToken(token: string | undefined): string {
  if (!token) throw new Error("remote Hub publication requires the dedicated GitHub token");
  return token;
}

function authoringEvidenceDigest(sourceRepositoryId: string, source: ReturnType<typeof discoverRepositorySourceState>, evidence: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify({
    sourceRepositoryId,
    source: { commit: source.commit, dirty: source.dirty, dirtyDigest: source.dirtyDigest },
    evidence,
  })).digest("hex")}`;
}

function remoteFailure(error: unknown, token: string): Error {
  const message = (error instanceof Error ? error.message : "remote Hub action failed").split(token).join("[REDACTED]");
  if (/(?:status 401|status 403|exited with status)/i.test(message)) {
    return new Error(
      "GitHub access is insufficient; update the one global token with repository read, Contents write and Pull requests write access, then retry",
    );
  }
  return new Error(message);
}

function continuityDocumentGaps(
  localHub: AdmittedLocalHubState,
  continuity: HubContinuityManifest,
  repositoryRoot: string,
  gitRoot = fs.realpathSync(repositoryRoot),
): readonly HubContinuityGap[] {
  const gaps: HubContinuityGap[] = [];
  for (const summary of continuity.currentSource) {
    const concept = parseConceptDocument(summary.path,
      fs.readFileSync(path.join(localHub.root, ...summary.path.split("/")), "utf8"));
    if (/^# Limitations\s*$/m.test(concept.body)) gaps.push({
      kind: "limitation", subject: concept.conceptId,
      detail: "accepted concept contains an explicit Limitations section",
    });
    for (const resource of repositorySourceResources(concept)) {
      const prefix = `repository://${continuity.sourceRepositoryId}/`;
      if (!resource.startsWith(prefix)) continue;
      const encoded = resource.slice(prefix.length).replace(/#L\d+-L\d+$/, "");
      let relative: string;
      try { relative = encoded.split("/").map((part) => decodeURIComponent(part)).join(path.sep); }
      catch { relative = ""; }
      const target = relative ? path.resolve(gitRoot, relative) : "";
      if (!target || (target !== gitRoot && !target.startsWith(`${gitRoot}${path.sep}`)) || !fs.existsSync(target)) gaps.push({
        kind: "reference-warning", subject: concept.conceptId,
        detail: `source reference is unavailable in the authorized checkout: ${resource}`,
      });
      if (gaps.length >= 64) return gaps;
    }
  }
  return gaps;
}

export function createHubRuntimeActions(
  environment: NodeJS.ProcessEnv = process.env,
  stateRoot = defaultStateRoot(),
): HubToolActions {
  const current = (): OptionalHubConfiguration => resolveHubConfiguration(environment);
  const configured = () => {
    const configuration = current();
    if (configuration.kind === "unconfigured") {
      throw new Error("AgentBase Hub is not configured; choose attach-existing or create-local before building OKF");
    }
    return configuration;
  };
  const admit = async () => {
    const configuration = configured();
    return configuration.kind === "remote"
      ? admitPersistentLocalHub(configuration) : admitPersistentLocalHub(configuration);
  };
  return {
    async status() {
      const configuration = current();
      if (configuration.kind === "unconfigured") return { kind: "unconfigured", setupChoices: ["existing", "new"] };
      const localHub = await admit();
      const pending = await listPendingHubProposals(localHub);
      return { kind: configuration.kind, localHubId: configuration.localHubId, localRoot: configuration.localRoot,
        baseCommit: configuration.baseCommit, activeHead: localHub.activeHead, pendingCount: pending.length,
        ...(configuration.kind === "remote" ? { repository: configuration.repository, targetBranch: "main" } : {}) };
    },
    async configure(input) {
      return input.mode === "existing"
        ? attachExistingHub(input.repositoryUrl!, environment)
        : createLocalHub(environment);
    },
    async previewBootstrap(repositoryUrl, mode) { return previewHubBootstrap(repositoryUrl, mode, environment); },
    async bootstrap(repositoryUrl, mode) { return executeHubBootstrap(repositoryUrl, mode, environment); },
    async preflight(sourceRepository) {
      if (!path.isAbsolute(sourceRepository) || !fs.statSync(sourceRepository).isDirectory()) {
        throw new Error("source repository must be an existing absolute directory");
      }
      const source = discoverRepositorySourceState(sourceRepository);
      const localHub = await admit();
      const context = await inspectInitialIngestHubContext(localHub, {
        displayName: source.displayName,
        ...source.identityHints,
      });
      return { source, ...context };
    },
    async prepare(input) {
      if (!path.isAbsolute(input.sourceRepository) || !fs.statSync(input.sourceRepository).isDirectory()) {
        throw new Error("source repository must be an existing absolute directory");
      }
      const source = discoverRepositorySourceState(input.sourceRepository);
      const configuration = configured();
      const localHub = await admit();
      const repository = await inspectInitialIngestHubContext(localHub, {
        displayName: source.displayName,
        ...source.identityHints,
      });
      if (repository.repository.kind === "ambiguous") {
        throw new Error(`repository identity is ambiguous: ${repository.repository.reason}`);
      }
      if (input.mode === "refresh" && repository.repository.kind === "new") {
        throw new Error("repository is absent from Hub; use Initial Ingest");
      }
      const sourceRepositoryId = repository.repository.repository.id;
      const knownGaps = listHubQuestions(stateRoot, localHub, { status: "pending", limit: 100 })
        .filter((question) => question.sourceRepositoryId === sourceRepositoryId)
        .slice(0, 64)
        .map((question) => ({
          kind: "question" as const,
          subject: question.subject,
          detail: `${question.property}: ${question.missingEvidence.join("; ") || "conflicting evidence"}`,
          updatedAt: question.updatedAt,
        }));
      let continuity = await buildActiveHubContinuity(localHub, sourceRepositoryId, input.subjectDirectory, { knownGaps });
      const documentGaps = continuityDocumentGaps(localHub, continuity, resolveRepositorySourceRoot(input.sourceRepository));
      continuity = { ...continuity, knownGaps: [...knownGaps, ...documentGaps].slice(0, 64) };
      const sourceChanges = input.mode === "refresh"
        ? discoverRepositorySourceChanges(input.sourceRepository, continuity.observedSource?.commit, source)
        : undefined;
      if (input.mode === "new" && !input.guidanceRequest) {
        throw new Error("new Initial Ingest requires evidence-bearing guidance_request; source-less signals are refresh-only");
      }
      const signals = input.confirmedDomain ? [...(input.signals ?? []), "business domain"] : (input.signals ?? []);
      const guidance = input.guidanceRequest ? getOkfAuthoringGuidance(input.guidanceRequest) : undefined;
      const evidenceDigest = authoringEvidenceDigest(sourceRepositoryId, source,
        input.guidanceRequest ?? { signals, coverage: input.coverage });
      const selectedSchemas = guidance
        ? [...new Set(guidance.recommendations.flatMap((item) => ["exact", "suggested"].includes(item.status) && item.schema ? [item.schema.type] : []))]
        : selectOkfConceptSchemas(signals).map((item) => item.type);
      if (input.mode === "new" && !selectedSchemas.includes("Repository")) selectedSchemas.unshift("Repository");
      if (input.confirmedDomain && !selectedSchemas.includes("Domain")) selectedSchemas.push("Domain");
      if (!selectedSchemas.length) throw new Error("authoring guidance did not establish any exact or suggested schema role");
      const session = beginHubAuthoringSession({
        stateRoot,
        mode: input.mode,
        ...(configuration.kind === "remote" ? { hub: configuration.hub } : { localHubId: configuration.localHubId }),
        baseCommit: localHub.activeHead,
        checkoutRoot: localHub.root,
        sourceRepositoryRoot: resolveRepositorySourceRoot(input.sourceRepository),
        sourceRepositoryId,
        sourceState: { commit: source.commit, dirty: source.dirty, dirtyDigest: source.dirtyDigest },
        evidenceDigest,
        subjectDirectory: input.subjectDirectory,
        ...(input.confirmedDomain ? { confirmedDomain: input.confirmedDomain } : {}),
        signals,
        selectedSchemas,
        ...(guidance ? { guidance } : {}),
        ...(input.coverage ? { coverage: input.coverage } : {}),
        createdAt: new Date().toISOString(),
      });
      const skeletons = input.mode === "new" && input.guidanceRequest && guidance
        ? writeInitialIngestSkeletons({
          bundleRoot: session.bundleRoot,
          subjectDirectory: input.subjectDirectory,
          sourceRepositoryId,
          repository: repository.repository.repository,
          ...(session.confirmedDomain ? { confirmedDomain: session.confirmedDomain } : {}),
          request: input.guidanceRequest,
          guidance,
          createdAt: session.createdAt,
          sourceState: session.sourceState,
        }) : [];
      return {
        sessionId: session.id,
        bundleRoot: session.bundleRoot,
        baseCommit: session.baseCommit,
        selectedSchemas: session.selectedSchemas,
        sourceRepositoryId: session.sourceRepositoryId,
        evidenceDigest,
        source,
        repositoryResolution: repository.repository,
        ...(session.confirmedDomain ? { confirmedDomain: session.confirmedDomain } : {}),
        continuity,
        ...(sourceChanges ? { sourceChanges } : {}),
        skeletons,
      };
    },
    async finalize(sessionId, questions, lifecycleIntents) {
      const configuration = configured();
      const session = readHubAuthoringSession(stateRoot, sessionId, configuration.localRoot);
      const source = discoverRepositorySourceState(session.sourceRepositoryRoot);
      const localHub = await admit();
      return finalizeHubAuthoringSession(stateRoot, sessionId, configuration.localRoot, questions ?? [], lifecycleIntents ?? [], {
        commit: source.commit, dirty: source.dirty, dirtyDigest: source.dirtyDigest,
      }, localHub.activeHead);
    },
    ...createReviewActions(stateRoot, (proposalId) => proposalRoot(stateRoot, proposalId), admit),
    async accept(proposalId, proposalDigest) {
      const localHub = await admit();
      return acceptHubProposal({
        stateRoot,
        localHub,
        proposalRoot: proposalRoot(stateRoot, proposalId),
        expectedDiffDigest: proposalDigest,
      });
    },
    async search(query, options) {
      const localHub = await admit();
      return searchActiveHub(localHub, query, options);
    },
    async traverse(start, options) {
      const localHub = await admit();
      return traverseActiveHub(localHub, start, options);
    },
    async read(relativePath) {
      const localHub = await admit();
      return readActiveHubConcept(localHub, relativePath);
    },
    async readLiveEvidence(relativePath, source) {
      const localHub = await admit();
      return readActiveHubLiveEvidence(localHub, relativePath, source);
    },
    async listPending() {
      const localHub = await admit();
      return listPendingHubProposals(localHub);
    },
    async submitMany(proposalIds) {
      const configuration = configured();
      if (configuration.kind !== "remote" || !configuration.hub) throw new Error("local-only Hub requires first bootstrap before normal publication");
      const token = requireHubToken(configuration.token);
      const github = new GitHubHubApi(configuration.hub, token);
      const localHub = await admitPersistentLocalHub(configuration);
      try {
        return await publishPendingHubProposals({
          stateRoot,
          localHub,
          selectedProposalIds: proposalIds,
          token,
          github,
        });
      } catch (error) { throw remoteFailure(error, token); }
    },
    async synchronize() {
      const configuration = configured();
      if (configuration.kind !== "remote") throw new Error("local-only Hub requires first bootstrap before synchronization");
      const token = requireHubToken(configuration.token);
      const localHub = await admitPersistentLocalHub(configuration);
      try { return await synchronizeLocalHub({ stateRoot, localHub, token }); }
      catch (error) { throw remoteFailure(error, token); }
    },
    async recover(proposalId) {
      const configuration = configured();
      if (configuration.kind !== "remote") throw new Error("local-only Hub has no synchronization transaction to recover");
      const localHub = await admitPersistentLocalHub(configuration);
      return recoverSynchronizationTransaction(stateRoot, proposalId, localHub);
    },
  };
}

export function tryCreateHubRuntimeActions(environment: NodeJS.ProcessEnv = process.env): HubToolActions | undefined {
  return createHubRuntimeActions(environment);
}
