import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { selectOkfConceptSchemas } from "../../core/knowledge/index.ts";
import { GitHubHubApi } from "../../providers/github-hub/index.ts";
import { discoverRepositorySourceState } from "../repository-okf/index.ts";
import { beginHubAuthoringSession, finalizeHubAuthoringSession } from "./authoring-session.ts";
import { acceptHubProposal } from "./accept.ts";
import { resolveHubConfiguration, type OptionalHubConfiguration } from "./configuration.ts";
import { admitPersistentLocalHub } from "./local-hub.ts";
import type { HubToolActions } from "./mcp-tools.ts";
import { readHubProposalState } from "./proposal-state.ts";
import { recoverSynchronizationTransaction } from "./recovery.ts";
import { readActiveHubConcept, searchActiveHub, traverseActiveHub } from "./query.ts";
import { listPendingHubProposals } from "./pending.ts";
import { publishPendingHubProposals } from "./publish.ts";
import { synchronizeLocalHub } from "./synchronize.ts";
import { attachExistingHub, createLocalHub } from "./setup.ts";
import { executeHubBootstrap, previewHubBootstrap } from "./bootstrap.ts";

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

function remoteFailure(error: unknown, token: string): Error {
  const message = (error instanceof Error ? error.message : "remote Hub action failed").split(token).join("[REDACTED]");
  if (/(?:status 401|status 403|exited with status)/i.test(message)) {
    return new Error(
      "GitHub access is insufficient; update the one global token with repository read, Contents write and Pull requests write access, then retry",
    );
  }
  return new Error(message);
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
    async prepare(input) {
      if (!path.isAbsolute(input.sourceRepository) || !fs.statSync(input.sourceRepository).isDirectory()) {
        throw new Error("source repository must be an existing absolute directory");
      }
      const source = discoverRepositorySourceState(input.sourceRepository);
      const configuration = configured();
      const localHub = await admit();
      const selectedSchemas = selectOkfConceptSchemas(input.signals).map((item) => item.type);
      const session = beginHubAuthoringSession({
        stateRoot,
        mode: input.mode,
        ...(configuration.kind === "remote" ? { hub: configuration.hub } : { localHubId: configuration.localHubId }),
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
    async finalize(sessionId) {
      const configuration = configured();
      return finalizeHubAuthoringSession(stateRoot, sessionId, configuration.localRoot);
    },
    async inspect(proposalId) {
      const root = proposalRoot(stateRoot, proposalId);
      return {
        proposal: readHubProposalState(root),
        inspection: JSON.parse(fs.readFileSync(path.join(root, "inspection.json"), "utf8")) as unknown,
      };
    },
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
