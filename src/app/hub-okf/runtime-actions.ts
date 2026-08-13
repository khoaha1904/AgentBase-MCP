import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { selectOkfConceptSchemas } from "../../core/knowledge/index.ts";
import { GitHubHubApi } from "../../providers/github-hub/index.ts";
import { discoverRepositorySourceState } from "../repository-okf/index.ts";
import { beginHubAuthoringSession, finalizeHubAuthoringSession } from "./authoring-session.ts";
import { acceptHubProposal } from "./accept.ts";
import { loadHubConfiguration } from "./configuration.ts";
import { admitPersistentLocalHub } from "./local-hub.ts";
import type { HubToolActions } from "./mcp-tools.ts";
import { readHubProposalState } from "./proposal-state.ts";
import { recoverSynchronizationTransaction } from "./recovery.ts";
import { readActiveHubConcept, searchActiveHub } from "./query.ts";
import { listPendingHubProposals } from "./pending.ts";
import { publishPendingHubProposals } from "./publish.ts";
import { synchronizeLocalHub } from "./synchronize.ts";

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

export function createHubRuntimeActions(
  environment: NodeJS.ProcessEnv = process.env,
  stateRoot = defaultStateRoot(),
): HubToolActions {
  const configuration = loadHubConfiguration(environment);
  return {
    async prepare(input) {
      if (!path.isAbsolute(input.sourceRepository) || !fs.statSync(input.sourceRepository).isDirectory()) {
        throw new Error("source repository must be an existing absolute directory");
      }
      const source = discoverRepositorySourceState(input.sourceRepository);
      const localHub = await admitPersistentLocalHub(configuration);
      const selectedSchemas = selectOkfConceptSchemas(input.signals).map((item) => item.type);
      const session = beginHubAuthoringSession({
        stateRoot,
        mode: input.mode,
        hub: configuration.hub,
        baseCommit: localHub.activeHead,
        checkoutRoot: localHub.root,
        sourceRepositoryId: source.repositoryId,
        evidenceDigest: input.evidenceDigest,
        subjectDirectory: input.subjectDirectory,
        signals: input.signals,
        selectedSchemas,
        createdAt: new Date().toISOString(),
      });
      return {
        sessionId: session.id,
        bundleRoot: session.bundleRoot,
        baseCommit: session.baseCommit,
        selectedSchemas: session.selectedSchemas,
        sourceRepositoryId: session.sourceRepositoryId,
      };
    },
    async finalize(sessionId) { return finalizeHubAuthoringSession(stateRoot, sessionId); },
    async inspect(proposalId) {
      const root = proposalRoot(stateRoot, proposalId);
      return {
        proposal: readHubProposalState(root),
        inspection: JSON.parse(fs.readFileSync(path.join(root, "inspection.json"), "utf8")) as unknown,
      };
    },
    async accept(proposalId, proposalDigest) {
      const localHub = await admitPersistentLocalHub(configuration);
      return acceptHubProposal({
        stateRoot,
        localHub,
        proposalRoot: proposalRoot(stateRoot, proposalId),
        expectedDiffDigest: proposalDigest,
      });
    },
    async search(query, limit) {
      const localHub = await admitPersistentLocalHub(configuration);
      return searchActiveHub(localHub, query, limit === undefined ? {} : { limit });
    },
    async read(relativePath) {
      const localHub = await admitPersistentLocalHub(configuration);
      return readActiveHubConcept(localHub, relativePath);
    },
    async listPending() {
      const localHub = await admitPersistentLocalHub(configuration);
      return listPendingHubProposals(localHub);
    },
    async submitMany(proposalIds) {
      const token = requireHubToken(configuration.token);
      const github = new GitHubHubApi(configuration.hub, token);
      const localHub = await admitPersistentLocalHub(configuration);
      return publishPendingHubProposals({
        stateRoot,
        localHub,
        selectedProposalIds: proposalIds,
        token,
        github,
      });
    },
    async synchronize() {
      const token = requireHubToken(configuration.token);
      const localHub = await admitPersistentLocalHub(configuration);
      return synchronizeLocalHub({ stateRoot, localHub, token });
    },
    async recover(proposalId) {
      const localHub = await admitPersistentLocalHub(configuration);
      return recoverSynchronizationTransaction(stateRoot, proposalId, localHub);
    },
  };
}

export function tryCreateHubRuntimeActions(environment: NodeJS.ProcessEnv = process.env): HubToolActions | undefined {
  const keys = ["AGENTBASE_HUB_REPOSITORY", "AGENTBASE_HUB_TARGET_BRANCH", "AGENTBASE_HUB_LOCAL_ROOT"];
  return keys.every((key) => Boolean(environment[key])) ? createHubRuntimeActions(environment) : undefined;
}
