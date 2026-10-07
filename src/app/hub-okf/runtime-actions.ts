import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  classifyAgentBaseHubProfile, getOkfAuthoringGuidance, getOkfConceptSchema, loadOkfBundle, parseConceptDocument,
  readRepositoryIdentityRecord, readRepositoryRefreshCoverage, repositorySourceResources, selectOkfConceptSchemas,
  type HubContinuityGap, type HubContinuityManifest,
  type InventoryReceipt,
} from "../../core/knowledge/index.ts";
import {
  createCandidateWorktree,
  GitHubApiError,
  GitHubHubApi,
  removeCandidateWorktree,
  resolveSourceSnapshot,
  type SourceSnapshot,
} from "../../providers/github-hub/index.ts";
import { AwsCliAdapter, AWS_SQS_PROFILE, AWS_STS_PROFILE } from "../../providers/aws-cli/index.ts";
import { hubProfileId, type AdmittedLocalHubState } from "../../core/hub/index.ts";
import {
  discoverRepositorySourceChanges, discoverRepositorySourceState, resolveRepositorySourceRoot,
} from "../repository-source/index.ts";
import {
  beginHubAuthoringSession, finalizeHubAuthoringSession, materializeInitialIngestSessionSkeletons,
  readHubAuthoringSession, validateHubAuthoringSession,
} from "./authoring/authoring-session.ts";
import { resolveProfileInitialIngestPlan, resolveProfileRefreshSubject } from "./authoring/profile-home-plan.ts";
import { listHubQuestions } from "./authoring/questions.ts";
import { resolveHubConfiguration, type OptionalHubConfiguration } from "./configuration/configuration.ts";
import { migratePersistedHubConfiguration, readPersistedHubProfile } from "./configuration/configuration-file.ts";
import { copyHubProfileToken, migrateHubProfileToken, removeHubProfileToken } from "./configuration/credential-file.ts";
import { admitPersistentLocalHub } from "./workspace/local-hub.ts";
import type { HubToolActions } from "./mcp/mcp-tools.ts";
import { recoverSynchronizationTransaction } from "./publication/recovery.ts";
import {
  buildActiveHubContinuity,
  inspectInitialIngestHubContext,
  readPublishedRepositoryInventory,
  readPublishedHubConcept,
  projectPublishedHubDomain,
  searchPublishedHub,
} from "./query/query.ts";
import { prepareDiagramPacket } from "./visualization/diagram-packet.ts";
import { buildStaticDomainSite } from "./visualization/domain-site.ts";
import { agentBaseStorage, copyLegacyDirectory } from "../local-storage/index.ts";
import { readInReviewProposalIds, scanWorkspaceRepositories } from "./query/workspace-scan.ts";
import { listPendingHubProposals } from "./review/pending.ts";
import { publishConfiguredHubProposal } from "./publication/configured-publish.ts";
import { synchronizeLocalHub } from "./publication/synchronize.ts";
import { attachExistingHub } from "./workspace/setup.ts";
import { executeHubBootstrap, previewHubBootstrap } from "./workspace/bootstrap.ts";
import { createReviewActions } from "./review/review-actions.ts";
import { writeAtomicJson } from "./review/proposal-state.ts";
import {
  finalizeDomainEnrichment, prepareDomainEnrichment, readEnrichmentManifest, runDomainEnrichment,
} from "./enrichment/index.ts";
import {
  batchMemberId, confirmBatchIngest, finalizeBatchIngest, prepareBatchIngest,
  readBatchManifest, recordBatchMember, retryBatchMember, reviseBatchMembership,
  type BatchMember,
} from "./batch-ingest/index.ts";
import { initializeHub as executeHubInitialization, previewHubInitialization } from "./ci/upgrade.ts";
import { finalizeProfileMigration, prepareProfileMigration } from "./migration/profile-migration.ts";

export function defaultHubRuntimeStateRoot(): string {
  const target = agentBaseStorage().hubRuntime;
  if (process.env.AGENTBASE_HOME) return target;
  const owner = typeof process.getuid === "function" ? String(process.getuid()) : "portable";
  return copyLegacyDirectory(path.join(os.tmpdir(), `agentbase-${owner}`, "hub-runtime"), target);
}

function proposalRoot(stateRoot: string, proposalId: string): string {
  if (!/^[a-f0-9]{24}$/.test(proposalId)) throw new Error("Hub proposal ID is invalid");
  return path.join(stateRoot, "proposals", proposalId);
}

function batchDocumentPaths(repositoryRoot: string): readonly string[] {
  const candidates = ["README.md", "README.MD", "readme.md"];
  const docs = path.join(repositoryRoot, "docs");
  if (fs.existsSync(docs) && fs.statSync(docs).isDirectory()) {
    for (const entry of fs.readdirSync(docs, { recursive: true, withFileTypes: true })) {
      if (entry.isFile() && /\.md$/i.test(entry.name)) {
        const parent = entry.parentPath ?? docs;
        candidates.push(path.relative(repositoryRoot, path.join(parent, entry.name)).split(path.sep).join("/"));
      }
      if (candidates.length >= 16) break;
    }
  }
  return [...new Set(candidates.filter((relative) => {
    const target = path.resolve(repositoryRoot, ...relative.split("/"));
    return target.startsWith(`${repositoryRoot}${path.sep}`) && fs.existsSync(target) && fs.statSync(target).isFile();
  }))].slice(0, 16);
}

async function withPublishedHub<T>(localHub: AdmittedLocalHubState, stateRoot: string,
  operation: (publishedRoot: string) => Promise<T> | T): Promise<T> {
  if (localHub.kind === "local-only") throw new Error("Domain Enrichment requires a Published remote Hub base");
  fs.mkdirSync(path.resolve(stateRoot), { recursive: true, mode: 0o700 });
  const parent = fs.mkdtempSync(path.join(path.resolve(stateRoot), "published-"));
  const publishedRoot = path.join(parent, "hub");
  try {
    await createCandidateWorktree(localHub.root, publishedRoot, localHub.remoteBase);
    return await operation(publishedRoot);
  } finally {
    if (fs.existsSync(publishedRoot)) await removeCandidateWorktree(localHub.root, publishedRoot);
    fs.rmSync(parent, { recursive: true, force: true });
  }
}

function requireHubToken(token: string | undefined): string {
  if (!token) throw new Error("remote Hub publication requires the dedicated GitHub token");
  return token;
}

function enrichmentCallPlan(manifest: ReturnType<typeof readEnrichmentManifest>): readonly unknown[] {
  return [{ profileFamily: AWS_STS_PROFILE.family, profileVersion: AWS_STS_PROFILE.version,
    operation: "get-caller-identity", accountId: manifest.providerScope.accountId },
  ...manifest.candidates.map((candidate) => ({ candidateId: candidate.id,
    profileFamily: AWS_SQS_PROFILE.family, profileVersion: AWS_SQS_PROFILE.version,
    operations: ["get-queue-url", "get-queue-attributes"], queue: candidate.queue }))];
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
      "GitHub access is insufficient; update the shared Hub token with repository read, Contents write and Pull requests write access, then retry",
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
    const refreshCoverage = readRepositoryRefreshCoverage(concept);
    if (refreshCoverage) gaps.push({
      kind: "limitation", subject: concept.conceptId,
      detail: `Refresh coverage is partial after ${refreshCoverage.coveragePasses}/3 convergence passes; ${refreshCoverage.omittedChangedPaths} changed paths were omitted`,
      details: refreshCoverage.limitations,
      updatedAt: refreshCoverage.observedAt,
    });
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
  stateRoot = defaultHubRuntimeStateRoot(),
  dependencies: Readonly<{
    sourceSnapshotResolver?: typeof resolveSourceSnapshot;
    discoveryReceiptResolver?: (id: string) => InventoryReceipt | undefined;
    discoveryReceiptRebaser?: (id: string, publishedBase: string) => InventoryReceipt | undefined;
    enrichmentAdapter?: AwsCliAdapter;
    onSourceSnapshot?: (snapshot: SourceSnapshot, mode: "new" | "refresh", authority: Readonly<{
      hubProfileId: string;
      publishedBase: string;
    }>) => void;
  }> = {},
): HubToolActions {
  const pendingSourceSnapshots = new Map<string, SourceSnapshot>();
  const sourceSnapshotsByAnalysisRoot = new Map<string, SourceSnapshot>();
  const current = (): OptionalHubConfiguration => resolveHubConfiguration(environment);
  const migrateActive = () => {
    const before = current();
    if (before.kind === "remote") {
      const canonicalId = hubProfileId(before.hub), canonical = readPersistedHubProfile(canonicalId, environment);
      if (canonical && (canonical.kind !== "remote" || canonical.localRoot !== before.localRoot
        || canonical.baseCommit !== before.baseCommit || canonical.catalogVersion !== before.catalogVersion
        || canonical.host !== before.host || canonical.repository !== before.repository
        || canonical.targetBranch !== before.targetBranch)) {
        throw new Error("canonical Hub profile already differs from the legacy profile");
      }
      migrateHubProfileToken(before.localHubId, environment);
      copyHubProfileToken(before.localHubId, canonicalId, environment);
    }
    const migration = migratePersistedHubConfiguration(environment);
    if (migration) {
      if (migration.previousId !== migration.currentId) removeHubProfileToken(migration.previousId, environment);
      const transactions = path.join(path.resolve(stateRoot), "transactions");
      if (fs.existsSync(transactions)) {
        for (const entry of fs.readdirSync(transactions, { withFileTypes: true }).slice(0, 64)) {
          if (!entry.isDirectory() || !/^sync-[a-z0-9]+$/.test(entry.name)) continue;
          const target = path.join(transactions, entry.name, "transaction.json");
          const state = JSON.parse(fs.readFileSync(target, "utf8")) as Record<string, unknown>;
          if (state.localHubId === migration.previousId || state.localHubId === undefined) {
            writeAtomicJson(target, { ...state, localHubId: migration.currentId });
          }
        }
      }
    }
  };
  const configured = (mutating = false) => {
    if (mutating) migrateActive();
    const configuration = current();
    if (configuration.kind === "unconfigured") {
      throw new Error("AgentBase Hub is not configured; connect an existing Hub or bootstrap an empty remote Hub first");
    }
    if (configuration.kind === "local-only") {
      throw new Error("legacy local-only Hub authority is no longer supported; connect or bootstrap a remote Hub profile");
    }
    return configuration;
  };
  const admit = async (createForAuthoring = false, mutating = createForAuthoring) => {
    const configuration = configured(mutating);
    return admitPersistentLocalHub(configuration);
  };
  const rememberSourceSnapshot = (snapshot: SourceSnapshot) => {
    pendingSourceSnapshots.set(snapshot.requestedRoot, snapshot);
    if (snapshot.analysisRoot !== snapshot.requestedRoot) sourceSnapshotsByAnalysisRoot.set(snapshot.analysisRoot, snapshot);
    return snapshot;
  };
  const sourceAuthority = (snapshot: SourceSnapshot) => ({
    repository_id: snapshot.repositoryId,
    remote: snapshot.remote.canonicalHttpsUrl,
    default_branch: snapshot.defaultBranch,
    commit: snapshot.commit,
    analysis_source_repository: snapshot.analysisRoot,
    kind: snapshot.kind,
  });
  const authorizeSource = async (requestedRoot: string, repositoryId: string): Promise<SourceSnapshot> => {
    const configuration = configured(true);
    if (configuration.kind !== "remote" || !configuration.hub) throw new Error("Hub-bound authoring requires one remote Hub profile");
    const resolver = dependencies.sourceSnapshotResolver ?? resolveSourceSnapshot;
    const token = configuration.token ?? (dependencies.sourceSnapshotResolver ? "injected-source-authority" : requireHubToken(configuration.token));
    return rememberSourceSnapshot(await resolver({ requestedRoot, repositoryId, hub: configuration.hub,
      token, stateRoot }));
  };
  const preparedSource = async (inputRoot: string, repositoryId: string): Promise<Readonly<{
    snapshot: SourceSnapshot;
    requestedSource: ReturnType<typeof discoverRepositorySourceState>;
    source: ReturnType<typeof discoverRepositorySourceState>;
  }>> => {
    const selected = fs.realpathSync(inputRoot);
    const fromAnalysis = sourceSnapshotsByAnalysisRoot.get(selected);
    const pending = pendingSourceSnapshots.get(selected) ?? fromAnalysis;
    const requestedRoot = pending?.requestedRoot ?? selected;
    const requestedSource = discoverRepositorySourceState(requestedRoot);
    const snapshot = pending ?? await authorizeSource(requestedRoot, repositoryId);
    if (snapshot.repositoryId !== repositoryId) throw new Error("source snapshot Repository identity changed");
    pendingSourceSnapshots.delete(snapshot.requestedRoot);
    return { snapshot, requestedSource, source: { ...requestedSource, repositoryId,
      commit: snapshot.commit, dirty: false, dirtyDigest: null, capturedAt: snapshot.createdAt,
      limitations: [...new Set([...requestedSource.limitations,
        "Hub authoring is bound to the exact remote default-branch source snapshot"])].sort() } };
  };
  return {
    async status() {
      const configuration = current();
      if (configuration.kind === "unconfigured") return {
        kind: "unconfigured", local: { state: "not-created" }, credential: "not-required",
        sync: { state: "not-applicable" },
      };
      if (configuration.kind === "local-only") return {
        kind: "unsupported-local-profile",
        local: { state: "blocked", detail: "legacy local-only Hub authority is no longer supported" },
        credential: "not-applicable", sync: { state: "not-applicable" },
      };
      let localHub: Awaited<ReturnType<typeof admit>> | undefined;
      let local: Record<string, unknown>;
      let localReady = false;
      try {
        localHub = await admitPersistentLocalHub(configuration, undefined, { readOnly: true });
        try {
          const pending = await listPendingHubProposals(localHub);
          local = { state: "ready", published_head: localHub.remoteBase, active_head: localHub.activeHead,
            draft_count: pending.length };
          localReady = true;
        } catch (error) {
          local = { state: "degraded", published_head: localHub.remoteBase, active_head: localHub.activeHead,
            detail: error instanceof Error ? error.message.slice(0, 240) : "pending inventory is unavailable" };
        }
      } catch (error) {
        local = { state: "unavailable", detail: error instanceof Error ? error.message.slice(0, 240) : "local Hub is unavailable" };
      }
      const transactionsRoot = path.join(path.resolve(stateRoot), "transactions");
      let recovery: string[] = [], recoveryInventoryError = false;
      try {
        recovery = fs.existsSync(transactionsRoot)
          ? fs.readdirSync(transactionsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory() && /^sync-[a-z0-9]+$/.test(entry.name))
            .filter((entry) => {
              try {
                const state = JSON.parse(fs.readFileSync(path.join(transactionsRoot, entry.name, "transaction.json"), "utf8")) as { localHubId?: unknown };
                if (state.localHubId === undefined) return true;
                if (typeof state.localHubId !== "string" || !/^[a-f0-9]{24}$/.test(state.localHubId)) {
                  recoveryInventoryError = true;
                  return false;
                }
                return state.localHubId === configuration.localHubId;
              } catch { recoveryInventoryError = true; return false; }
            }).slice(0, 16).map((entry) => entry.name)
          : [];
      } catch { recoveryInventoryError = true; }
      let remote: Record<string, unknown> = { state: "unavailable", detail: "Shared Hub credential is missing" };
      let openPrCount: Readonly<{ count: number; truncated: boolean }> | "unavailable" = "unavailable";
      let credential: "ready" | "missing" | "invalid" = configuration.token ? "ready" : "missing";
      if (configuration.token) {
        const github = new GitHubHubApi(configuration.hub, configuration.token);
        try {
          const ref = await github.getBranchRef(configuration.targetBranch);
          remote = localHub
            ? { state: ref.commit === localHub.remoteBase ? "current" : "updates-available", head: ref.commit }
            : { state: "unavailable", head: ref.commit, detail: "local Published boundary is unavailable for comparison" };
        } catch (error) {
          if (error instanceof GitHubApiError && error.code === "PERMISSION") credential = "invalid";
          remote = { state: "unavailable", detail: "remote branch could not be inspected" };
        }
        try { openPrCount = await github.countOpenPullRequests(configuration.targetBranch); }
        catch { openPrCount = "unavailable"; }
      }
      return {
        kind: "remote",
        hub: { host: configuration.host, repository: configuration.repository, branch: configuration.targetBranch },
        publication: { policy: configuration.publicationPolicy ?? "direct", modes: ["direct", "pr"] },
        local, credential, remote, open_pr_count: openPrCount,
        sync: recovery.length ? { state: "recovery-required", transaction_ids: recovery }
          : recoveryInventoryError ? { state: "blocked", detail: "recovery inventory is unavailable" }
            : localReady && credential === "ready" && remote.state !== "unavailable"
              ? { state: "ready" } : { state: "blocked" },
      };
    },
    async configure(input) {
      if (current().kind !== "unconfigured") migrateActive();
      return attachExistingHub(input.repositoryUrl, input.targetBranch, environment);
    },
    async previewBootstrap(repositoryUrl, targetBranch) { return previewHubBootstrap(repositoryUrl, targetBranch, environment); },
    async bootstrap(repositoryUrl, targetBranch) { return executeHubBootstrap(repositoryUrl, targetBranch, environment); },
    async scan(workspaceRoot) {
      const configuration = current();
      if (configuration.kind !== "remote") return scanWorkspaceRepositories({ workspaceRoot });
      const localHub = await admitPersistentLocalHub(configuration, undefined, { readOnly: true });
      const [published, pending] = await Promise.all([
        readPublishedRepositoryInventory(localHub),
        listPendingHubProposals(localHub),
      ]);
      return scanWorkspaceRepositories({ workspaceRoot, published, pending,
        inReviewProposalIds: readInReviewProposalIds(stateRoot) });
    },
    async preflight(sourceRepository) {
      if (!path.isAbsolute(sourceRepository) || !fs.statSync(sourceRepository).isDirectory()) {
        throw new Error("source repository must be an existing absolute directory");
      }
      const source = discoverRepositorySourceState(sourceRepository);
      const localHub = await admit(true);
      const context = await inspectInitialIngestHubContext(localHub, {
        displayName: source.displayName,
        ...source.identityHints,
      });
      if (context.repository.kind === "ambiguous") {
        throw new Error(`repository identity is ambiguous: ${context.repository.reason}`);
      }
      const mode = context.repository.kind === "new" ? "new" : "refresh";
      const requestedRoot = resolveRepositorySourceRoot(sourceRepository);
      const cached = pendingSourceSnapshots.get(fs.realpathSync(requestedRoot));
      const snapshot = cached?.repositoryId === context.repository.repository.id
        ? cached : await authorizeSource(requestedRoot, context.repository.repository.id);
      dependencies.onSourceSnapshot?.(snapshot, mode, {
        hubProfileId: hubProfileId(localHub.hub),
        publishedBase: localHub.activeHead,
      });
      return { source: { ...source, repositoryId: snapshot.repositoryId, commit: snapshot.commit,
        dirty: false, dirtyDigest: null, capturedAt: snapshot.createdAt }, ...context,
        source_authority: sourceAuthority(snapshot) };
    },
    async prepareMigration() {
      const localHub = await admit(false, true);
      return prepareProfileMigration({ stateRoot, localHub });
    },
    async finalizeMigration(input) {
      const localHub = await admit(false, true);
      return finalizeProfileMigration({ stateRoot, localHub, sessionId: input.sessionId, moves: input.moves });
    },
    async prepare(input) {
      if (!path.isAbsolute(input.sourceRepository) || !fs.statSync(input.sourceRepository).isDirectory()) {
        throw new Error("source repository must be an existing absolute directory");
      }
      const selectedInputRoot = fs.realpathSync(input.sourceRepository);
      const pending = pendingSourceSnapshots.get(selectedInputRoot) ?? sourceSnapshotsByAnalysisRoot.get(selectedInputRoot);
      const identityRoot = pending?.requestedRoot ?? selectedInputRoot;
      const requestedSource = discoverRepositorySourceState(identityRoot);
      const localHub = await admit(true);
      const profileAdmission = classifyAgentBaseHubProfile(loadOkfBundle(localHub.root,
        { requireAgentBaseRootIndex: true }));
      if (profileAdmission.kind === "unsupported") {
        throw new Error(`Hub Profile is unsupported: ${profileAdmission.failures.join("; ")}`);
      }
      if (input.mode === "refresh" && input.homePlan) throw new Error("Refresh does not accept home_plan");
      if (profileAdmission.kind === "legacy-unprofiled" && input.homePlan) {
        throw new Error("home_plan requires an AgentBase OKF Profile 1.0 Hub");
      }
      const repository = await inspectInitialIngestHubContext(localHub, {
        displayName: requestedSource.displayName,
        ...requestedSource.identityHints,
      }, { boundary: input.mode === "refresh" ? "active" : "published" });
      if (repository.repository.kind === "ambiguous") {
        throw new Error(`repository identity is ambiguous: ${repository.repository.reason}`);
      }
      if (input.mode === "refresh" && repository.repository.kind === "new") {
        throw new Error("repository is absent from Hub; use Initial Ingest");
      }
      if (input.mode === "new" && repository.repository.kind === "existing") {
        throw new Error("repository already exists in Published Hub; use Refresh");
      }
      const subjectDirectory = input.mode === "refresh" && profileAdmission.kind === "profile-1.0"
        ? resolveProfileRefreshSubject(input.subjectDirectory, repository.repositorySubject)
        : input.subjectDirectory;
      const sourceRepositoryId = repository.repository.repository.id;
      const { snapshot, source } = await preparedSource(input.sourceRepository, sourceRepositoryId);
      const knownGaps = listHubQuestions(localHub, { status: "open", limit: 100 })
        .filter((question) => question.sourceRepositoryId === sourceRepositoryId)
        .slice(0, 64)
        .map((question) => ({
          kind: "question" as const,
          subject: question.subject,
          detail: `${question.property}: missing or conflicting evidence`,
          details: question.missingEvidence.length ? question.missingEvidence : ["conflicting evidence"],
          updatedAt: question.createdAt,
        }));
      const receipt = input.mode === "new" && input.discoveryReceiptId
        ? dependencies.discoveryReceiptResolver?.(input.discoveryReceiptId) : undefined;
      if (input.mode === "new" && !receipt) {
        throw new Error("new Initial Ingest requires one active frozen discovery Receipt");
      }
      if (receipt && (receipt.source.repositoryId !== sourceRepositoryId || receipt.source.commit !== snapshot.commit
        || receipt.hubProfileId !== hubProfileId(localHub.hub) || receipt.publishedBase !== localHub.activeHead)) {
        throw new Error("discovery Receipt source or Hub authority no longer matches Prepare");
      }
      const profilePlan = input.mode === "new" && profileAdmission.kind === "profile-1.0"
        ? resolveProfileInitialIngestPlan({
          subjectDirectory,
          ...(input.homePlan ? { homePlan: input.homePlan } : {}),
          ...(input.confirmedDomain ? { confirmedDomain: input.confirmedDomain } : {}),
          request: receipt!.guidanceRequest,
          guidance: receipt!.guidance,
        }) : undefined;
      let continuity = await buildActiveHubContinuity(localHub, sourceRepositoryId, subjectDirectory, {
        knownGaps,
        domainIdentities: profilePlan ? [
          ...(profilePlan.plan.defaultHome.kind === "domain" ? [profilePlan.plan.defaultHome.identity] : []),
          ...profilePlan.plan.exceptions.flatMap((entry) => entry.home.kind === "domain" ? [entry.home.identity] : []),
          ...profilePlan.plan.participations.map((entry) => entry.domain.identity),
        ] : input.confirmedDomain ? [input.confirmedDomain.identity] : [],
      });
      const documentGaps = continuityDocumentGaps(localHub, continuity, snapshot.analysisRoot);
      continuity = { ...continuity, knownGaps: [...knownGaps, ...documentGaps].slice(0, 64) };
      const sourceChanges = input.mode === "refresh"
        ? discoverRepositorySourceChanges(snapshot.analysisRoot, continuity.observedSource?.commit, source)
        : undefined;
      const signals = input.confirmedDomain ? [...(input.signals ?? []), "business domain"] : (input.signals ?? []);
      const guidance = receipt?.guidance ?? (input.guidanceRequest ? getOkfAuthoringGuidance(input.guidanceRequest) : undefined);
      const coverage = receipt ? { partial: receipt.coverage.limitations.length > 0,
        limitations: receipt.coverage.limitations } : input.coverage;
      const evidenceDigest = receipt?.digest ?? authoringEvidenceDigest(sourceRepositoryId, source,
        input.guidanceRequest ?? { signals, coverage, refreshScope: input.mode === "refresh" ? input.refreshScope ?? "delta" : undefined });
      const selectedSchemas = guidance
        ? [...new Set(guidance.recommendations.flatMap((item) => ["exact", "suggested"].includes(item.status) && item.schema ? [item.schema.type] : []))]
        : selectOkfConceptSchemas(signals).map((item) => item.type);
      if (input.mode === "refresh") {
        for (const concept of continuity.currentSource) {
          const schema = getOkfConceptSchema(concept.type);
          if (schema && schema.authoringScope !== "governance" && !selectedSchemas.includes(schema.type)) {
            selectedSchemas.push(schema.type);
          }
        }
      }
      if (input.mode === "new" && !selectedSchemas.includes("Repository")) selectedSchemas.unshift("Repository");
      if (input.confirmedDomain && !selectedSchemas.includes("Domain")) selectedSchemas.push("Domain");
      if (profilePlan && !selectedSchemas.includes("Domain") && (profilePlan.plan.defaultHome.kind === "domain"
        || profilePlan.plan.exceptions.some((entry) => entry.home.kind === "domain")
        || profilePlan.plan.participations.length > 0)) selectedSchemas.push("Domain");
      if (!selectedSchemas.length) throw new Error("authoring guidance did not establish any exact or suggested schema role");
      const session = beginHubAuthoringSession({
        stateRoot,
        mode: input.mode,
        ...(input.mode === "refresh" ? { refreshScope: input.refreshScope ?? "delta" } : {}),
        hub: localHub.hub,
        baseCommit: localHub.activeHead,
        checkoutRoot: localHub.root,
        sourceRepositoryRoot: snapshot.analysisRoot,
        sourceRepositoryId,
        sourceState: { commit: source.commit, dirty: source.dirty, dirtyDigest: source.dirtyDigest },
        evidenceDigest,
        subjectDirectory: profilePlan?.subjectDirectory ?? subjectDirectory,
        ...(input.confirmedDomain && !profilePlan ? { confirmedDomain: input.confirmedDomain } : {}),
        ...(profilePlan ? { homePlan: profilePlan.plan } : {}),
        signals,
        selectedSchemas,
        ...(guidance ? { guidance } : {}),
        ...(coverage ? { coverage } : {}),
        ...(receipt ? { discoveryReceipt: receipt } : {}),
        ...(sourceChanges ? { sourceChanges } : {}),
        requireObservedRevision: true,
        createdAt: new Date().toISOString(),
      });
      const skeletons = input.mode === "new" && receipt
        ? materializeInitialIngestSessionSkeletons(stateRoot, session.id, localHub.root,
          repository.repository.repository)
        : session.skeletons ?? [];
      return {
        sessionId: session.id,
        bundleRoot: session.bundleRoot,
        baseCommit: session.baseCommit,
        selectedSchemas: session.selectedSchemas,
        sourceRepositoryId: session.sourceRepositoryId,
        evidenceDigest,
        ...(receipt ? { discoveryReceiptId: receipt.id } : {}),
        source,
        source_authority: sourceAuthority(snapshot),
        repositoryResolution: repository.repository,
        ...(input.confirmedDomain ? { confirmedDomain: input.confirmedDomain } : {}),
        ...(session.homePlan ? { homePlan: session.homePlan } : {}),
        continuity,
        ...(sourceChanges ? { sourceChanges } : {}),
        ...(input.mode === "refresh" ? { refreshScope: input.refreshScope ?? "delta" } : {}),
        skeletons,
        ...(input.mode === "new" ? { authoringConstraints: [
          "Preserve generated sources, relationships, repository identity metadata and navigation; enrich the skeleton instead of rebuilding its frontmatter.",
          "Use the Repository as the default dossier: add only applicable evidence-backed purpose/boundary, runtime/deployment, capability, interface/trigger, dependency/data, operations/recovery and known-gap sections; omit unsupported headings and avoid duplicating promoted knowledge.",
          "Add Embedded Relations only for exact evidenced runtime directions; containment and prose alone never create arrows.",
        ] } : {}),
      };
    },
    async validate(sessionId, referencedIdentities) {
      const configuration = configured();
      const session = readHubAuthoringSession(stateRoot, sessionId, configuration.localRoot);
      const source = discoverRepositorySourceState(session.sourceRepositoryRoot);
      const currentSource = { commit: source.commit, dirty: source.dirty, dirtyDigest: source.dirtyDigest };
      if (JSON.stringify(currentSource) !== JSON.stringify(session.sourceState)) {
        throw new Error("source repository changed after Prepare");
      }
      const localHub = await admitPersistentLocalHub(configuration, undefined, { readOnly: true });
      if (localHub.activeHead !== session.baseCommit) throw new Error("Hub authoring base changed after Prepare");
      const publishedTargets = [...loadOkfBundle(localHub.root).concepts.values()].map((concept) => ({
        identity: concept.conceptId, path: concept.path, type: concept.type,
      }));
      return validateHubAuthoringSession(stateRoot, sessionId, configuration.localRoot, publishedTargets, referencedIdentities);
    },
    async finalize(sessionId, questions, removals, changeAccounting) {
      const configuration = configured(true);
      const session = readHubAuthoringSession(stateRoot, sessionId, configuration.localRoot);
      const source = discoverRepositorySourceState(session.sourceRepositoryRoot);
      const currentSource = { commit: source.commit, dirty: source.dirty, dirtyDigest: source.dirtyDigest };
      if (JSON.stringify(currentSource) !== JSON.stringify(session.sourceState)) {
        throw new Error("source repository changed after Prepare");
      }
      const localHub = await admitPersistentLocalHub(configuration);
      if (localHub.activeHead !== session.baseCommit) {
        if (!session.discoveryReceipt) return { result: "reprepare_required", reason: "hub-base-advanced", mode: session.mode,
          previous_session_id: session.id, current_hub_base: localHub.activeHead };
        const repository = [...loadOkfBundle(session.bundleRoot).concepts.values()].map(readRepositoryIdentityRecord)
          .find((record) => record?.id === session.sourceRepositoryId);
        if (!repository) throw new Error("replacement Initial Ingest cannot resolve its Repository identity");
        const rematch = await inspectInitialIngestHubContext(localHub, {
          displayName: repository.displayName, remotes: repository.remotes, rootCommits: repository.rootCommits,
          ...(repository.forgeId ? { forgeId: repository.forgeId } : {}),
        }, { boundary: "published" });
        if (rematch.repository.kind !== "new") {
          throw new Error("Repository entered Published Hub while Initial Ingest was being authored; use Refresh");
        }
        const replacementReceipt = dependencies.discoveryReceiptRebaser?.(session.discoveryReceipt.id, localHub.activeHead);
        if (!replacementReceipt) throw new Error("Hub base advanced and the frozen discovery Receipt cannot be rebound");
        const replacement = beginHubAuthoringSession({
          stateRoot, mode: "new", hub: localHub.hub, baseCommit: localHub.activeHead,
          checkoutRoot: localHub.root, sourceRepositoryRoot: session.sourceRepositoryRoot,
          sourceRepositoryId: session.sourceRepositoryId, sourceState: session.sourceState,
          evidenceDigest: replacementReceipt.digest, subjectDirectory: session.subjectDirectory,
          ...(session.confirmedDomain ? { confirmedDomain: session.confirmedDomain } : {}),
          ...(session.homePlan ? { homePlan: session.homePlan } : {}),
          signals: session.signals, selectedSchemas: session.selectedSchemas,
          guidance: replacementReceipt.guidance,
          coverage: { partial: replacementReceipt.coverage.limitations.length > 0,
            limitations: replacementReceipt.coverage.limitations },
          discoveryReceipt: replacementReceipt, requireObservedRevision: true,
          createdAt: new Date().toISOString(),
        });
        const skeletons = materializeInitialIngestSessionSkeletons(stateRoot, replacement.id, localHub.root, repository);
        fs.rmSync(session.root, { recursive: true, force: true });
        return { result: "replacement_required", reason: "hub-base-advanced", source_discovery_reused: true,
          previous_session_id: session.id, session_id: replacement.id,
          discovery_receipt_id: replacementReceipt.id, bundle_root: replacement.bundleRoot,
          base_commit: replacement.baseCommit, skeletons };
      }
      const finalized = finalizeHubAuthoringSession(stateRoot, sessionId, configuration.localRoot,
        questions ?? [], removals ?? [], currentSource, localHub.activeHead, true, changeAccounting ?? []);
      if (!session.discoveryReceipt || configuration.kind !== "remote" || !configuration.token) return finalized;
      try {
        const repository = session.discoveryReceipt.source.remote.replace(`https://${configuration.host}/`, "").replace(/\.git$/, "");
        const api = new GitHubHubApi(configuration.hub, configuration.token);
        const remote = await api.getRepository(repository);
        const ref = await api.getBranchRef(remote.defaultBranch, remote.fullName);
        return { ...finalized, source_head: ref.commit === session.discoveryReceipt.source.commit
          ? { status: "current", commit: ref.commit }
          : { status: "source-advanced", observed_commit: session.discoveryReceipt.source.commit, current_commit: ref.commit } };
      } catch {
        return { ...finalized, source_head: { status: "unavailable", detail: "current source default head could not be checked" } };
      }
    },
    async prepareBatch(input) {
      const localHub = await admit(true);
      const members: BatchMember[] = [];
      for (const [order, sourceRepository] of input.sourceRepositories.entries()) {
        if (!path.isAbsolute(sourceRepository) || !fs.existsSync(sourceRepository)
          || fs.lstatSync(sourceRepository).isSymbolicLink() || !fs.statSync(sourceRepository).isDirectory()) {
          throw new Error("batch source repositories must be explicit existing absolute directories");
        }
        const root = resolveRepositorySourceRoot(sourceRepository), source = discoverRepositorySourceState(root);
        const context = await inspectInitialIngestHubContext(localHub, { displayName: source.displayName, ...source.identityHints });
        const resolution = context.repository;
        const repository = resolution.kind === "ambiguous" ? resolution.candidates[0] : resolution.repository;
        if (!repository) throw new Error(`batch repository identity is unresolved: ${sourceRepository}`);
        const snapshot = await authorizeSource(root, repository.id);
        members.push({ id: batchMemberId(repository.id, root), order, root, analysisRoot: snapshot.analysisRoot,
          repositoryId: repository.id, displayName: repository.displayName,
          source: { commit: snapshot.commit, dirty: false, dirtyDigest: null },
          sourceAuthority: { remote: snapshot.remote.canonicalHttpsUrl, defaultBranch: snapshot.defaultBranch,
            commit: snapshot.commit, kind: snapshot.kind },
          identityStatus: resolution.kind, documentPaths: batchDocumentPaths(root),
          warnings: resolution.kind === "new" ? [] : [resolution.kind === "existing"
            ? "Repository already exists in Hub and requires Refresh" : resolution.reason] });
      }
      const manifest = prepareBatchIngest({ stateRoot, baseCommit: localHub.activeHead,
        domain: input.proposedDomain, members, createdAt: new Date().toISOString() });
      return { manifest, matrix: manifest.members.map((member) => ({ memberId: member.id,
        repositoryId: member.repositoryId, displayName: member.displayName, identityStatus: member.identityStatus,
        proposedDomain: manifest.domain, documentPaths: member.documentPaths, warnings: member.warnings,
        sourceAuthority: member.sourceAuthority, analysisSourceRepository: member.analysisRoot })) };
    },
    async confirmBatch(input) {
      const localHub = await admit(false, true), prior = readBatchManifest(stateRoot, input.manifestId, input.manifestRevision);
      if (prior.baseCommit !== localHub.activeHead) throw new Error("Hub base changed after batch preflight");
      return confirmBatchIngest({ stateRoot, ...input });
    },
    async recordBatchMember(input) {
      const localHub = await admit(false, true), manifest = readBatchManifest(stateRoot, input.manifestId, input.manifestRevision);
      const member = manifest.members.find((value) => value.id === input.memberId);
      if (!member) throw new Error("batch member is absent from current manifest");
      const source = discoverRepositorySourceState(member.analysisRoot);
      return recordBatchMember({ stateRoot, localHub, ...input,
        currentSource: { commit: source.commit, dirty: source.dirty, dirtyDigest: source.dirtyDigest } });
    },
    async retryBatchMember(input) { return retryBatchMember({ stateRoot, ...input }); },
    async reviseBatch(input) {
      const localHub = await admit(false, true), manifest = readBatchManifest(stateRoot, input.manifestId, input.manifestRevision);
      if (manifest.baseCommit !== localHub.activeHead) throw new Error("Hub base changed after batch preflight");
      return reviseBatchMembership({ stateRoot, ...input });
    },
    async finalizeBatch(input) {
      const localHub = await admit(false, true), manifest = readBatchManifest(stateRoot, input.manifestId, input.manifestRevision);
      const currentSources = new Map(manifest.members.map((member) => {
        const source = discoverRepositorySourceState(member.analysisRoot);
        return [member.id, { commit: source.commit, dirty: source.dirty, dirtyDigest: source.dirtyDigest }] as const;
      }));
      return finalizeBatchIngest({ stateRoot, localHub, ...input, currentSources });
    },
    async prepareEnrichment(input) {
      const localHub = await admit(false, true);
      return withPublishedHub(localHub, stateRoot, (publishedRoot) => {
        const manifest = prepareDomainEnrichment({ stateRoot, publishedRoot, baseCommit: localHub.remoteBase,
          ...input, createdAt: new Date().toISOString() });
        return { manifest, plannedCalls: enrichmentCallPlan(manifest) };
      });
    },
    async reviseEnrichment(input) {
      const localHub = await admit(false, true);
      const prior = readEnrichmentManifest(stateRoot, input.manifestId, input.manifestRevision);
      if (prior.baseCommit !== localHub.remoteBase) throw new Error("Published Hub base changed after enrichment Prepare");
      return withPublishedHub(localHub, stateRoot, (publishedRoot) => {
        const manifest = prepareDomainEnrichment({ stateRoot, publishedRoot, baseCommit: prior.baseCommit,
          domainId: prior.domainId, repositoryIds: input.repositoryIds, candidates: input.candidates,
          accountId: prior.providerScope.accountId, regions: prior.providerScope.regions,
          createdAt: prior.createdAt, prior });
        const previous = new Map(prior.candidates.map((candidate) => [candidate.id, candidate.evidenceDigest]));
        const current = new Map(manifest.candidates.map((candidate) => [candidate.id, candidate.evidenceDigest]));
        return { manifest, plannedCalls: enrichmentCallPlan(manifest),
          reusedCandidateIds: manifest.candidates.filter((candidate) => previous.get(candidate.id) === candidate.evidenceDigest).map((candidate) => candidate.id),
          providerCallCandidateIds: manifest.candidates.filter((candidate) => previous.get(candidate.id) !== candidate.evidenceDigest).map((candidate) => candidate.id),
          invalidatedCandidateIds: prior.candidates.filter((candidate) => current.get(candidate.id) !== candidate.evidenceDigest).map((candidate) => candidate.id) };
      });
    },
    async runEnrichment(input) {
      const localHub = await admit(false, true);
      const manifest = readEnrichmentManifest(stateRoot, input.manifestId, input.manifestRevision);
      if (manifest.baseCommit !== localHub.remoteBase) throw new Error("Published Hub base changed after enrichment Prepare");
      return withPublishedHub(localHub, stateRoot, (publishedRoot) => runDomainEnrichment({
        stateRoot, publishedRoot, ...input, ...(dependencies.enrichmentAdapter
          ? { adapter: dependencies.enrichmentAdapter } : {}),
      }));
    },
    async finalizeEnrichment(input) {
      const localHub = await admit(false, true);
      return withPublishedHub(localHub, stateRoot, (publishedRoot) => finalizeDomainEnrichment({
        stateRoot, publishedRoot, localHub, ...input,
      }));
    },
    ...createReviewActions(stateRoot, (proposalId) => proposalRoot(stateRoot, proposalId), () => admit(false, true)),
    async publish(input) { return publishConfiguredHubProposal(input, environment); },
    async search(query, options) {
      const localHub = await admit();
      return searchPublishedHub(localHub, query, options);
    },
    async read(relativePath) {
      const localHub = await admit();
      return readPublishedHubConcept(localHub, relativePath);
    },
    async visualize(input) {
      const localHub = await admit();
      const projection = await projectPublishedHubDomain(localHub, input.domain);
      return input.mode === "diagram"
        ? prepareDiagramPacket(projection, input)
        : buildStaticDomainSite(projection, input);
    },
    async previewHubInitialization() {
      const configuration = configured();
      if (configuration.kind !== "remote" || !configuration.hub) throw new Error("Hub initialization requires an attached remote Hub");
      const token = requireHubToken(configuration.token), localHub = await admitPersistentLocalHub(configuration);
      try { return await previewHubInitialization({ stateRoot, localHub, token, github: new GitHubHubApi(configuration.hub, token) }); }
      catch (error) { throw remoteFailure(error, token); }
    },
    async initializeHub(input) {
      const configuration = configured(true);
      if (configuration.kind !== "remote" || !configuration.hub) throw new Error("Hub initialization requires an attached remote Hub");
      const token = requireHubToken(configuration.token), localHub = await admitPersistentLocalHub(configuration);
      try { return await executeHubInitialization({ stateRoot, localHub, token, github: new GitHubHubApi(configuration.hub, token) }, {
        baseCommit: input.expectedBase, initializationDigest: input.expectedInitializationDigest,
      }); } catch (error) { throw remoteFailure(error, token); }
    },
    async synchronize() {
      const configuration = configured(true);
      if (configuration.kind !== "remote") throw new Error("local-only Hub requires first bootstrap before synchronization");
      const token = requireHubToken(configuration.token);
      const localHub = await admitPersistentLocalHub(configuration);
      try { return await synchronizeLocalHub({ stateRoot, localHub, token }); }
      catch (error) { throw remoteFailure(error, token); }
    },
    async recover(transactionId) {
      const configuration = configured(true);
      if (configuration.kind !== "remote") throw new Error("local-only Hub has no synchronization transaction to recover");
      const localHub = await admitPersistentLocalHub(configuration, undefined, { allowRecoveryState: true });
      return recoverSynchronizationTransaction(stateRoot, transactionId, localHub);
    },
  };
}

export function tryCreateHubRuntimeActions(environment: NodeJS.ProcessEnv = process.env): HubToolActions | undefined {
  return createHubRuntimeActions(environment);
}
