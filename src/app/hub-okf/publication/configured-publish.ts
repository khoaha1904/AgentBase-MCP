import path from "node:path";

import { agentBaseStorage } from "../../local-storage/index.ts";
import { acquireHubActivationLock, activatePersistedHubConfiguration,
  readPersistedHubConfiguration, releaseHubActivationLock } from "../configuration/configuration-file.ts";
import { resolveHubConfiguration } from "../configuration/configuration.ts";
import { admitPersistentLocalHub } from "../workspace/local-hub.ts";
import { publishHubProposalDirect, type DirectPublishOptions } from "./direct-publish.ts";
import { GitHubHubApi } from "../../../providers/github-hub/index.ts";

export function hubPublicationPolicy(environment: NodeJS.ProcessEnv, mode?: "direct" | "pr") {
  if (mode !== undefined && mode !== "direct" && mode !== "pr") throw new Error("Hub publication policy must be direct or pr");
  const lock = mode === undefined ? undefined : acquireHubActivationLock(environment);
  try {
    const configuration = readPersistedHubConfiguration(environment);
    if (configuration?.kind !== "remote") throw new Error("connect a remote Hub before selecting publication policy");
    const policy = mode ?? configuration.publicationPolicy ?? "direct";
    if (lock) activatePersistedHubConfiguration({ ...configuration, publicationPolicy: policy },
      environment, configuration.localHubId, { activationLock: lock });
    return { hub: { host: configuration.host, repository: configuration.repository, branch: configuration.targetBranch },
      publication_policy: policy, policy_source: mode || configuration.publicationPolicy ? "configured" : "default",
      workflow: { direct_cli: "available", unified_pr: "available", mcp: "publish" } };
  } finally { if (lock) releaseHubActivationLock(lock); }
}

export async function publishConfiguredHubProposal(
  input: Readonly<{ proposalId: string; diffDigest: string; mode: "direct" | "pr" }>,
  environment: NodeJS.ProcessEnv,
  dependencies: Readonly<{ git?: DirectPublishOptions["git"]; publish?: typeof publishHubProposalDirect }> = {},
) {
  if (!/^[a-f0-9]{24}$/.test(input.proposalId) || !/^sha256:[a-f0-9]{64}$/.test(input.diffDigest) || !["direct", "pr"].includes(input.mode)) {
    throw new Error("Publish requires exact proposal ID, reviewed SHA-256 digest and explicit direct mode");
  }
  const lock = acquireHubActivationLock(environment);
  try {
    const configuration = resolveHubConfiguration(environment);
    if (configuration.kind !== "remote") throw new Error("Publish requires a configured remote Hub");
    if ((configuration.publicationPolicy ?? "direct") !== input.mode) {
      throw new Error(`Hub policy is ${configuration.publicationPolicy ?? "direct"}; confirmed publication mode does not match`);
    }
    if (!configuration.token) throw new Error("Publish requires the configured Hub credential");
    try {
      const localHub = await admitPersistentLocalHub(configuration, dependencies.git, { allowRecoveryState: true });
      return await (dependencies.publish ?? publishHubProposalDirect)({
        stateRoot: agentBaseStorage(environment).hubRuntime, localHub,
        proposalRoot: path.join(agentBaseStorage(environment).hubRuntime, "proposals", input.proposalId),
        expectedDiffDigest: input.diffDigest, authorization: input.mode, token: configuration.token,
        ...(input.mode === "pr" ? { github: new GitHubHubApi(configuration.hub, configuration.token) } : {}),
        ...(dependencies.git ? { git: dependencies.git } : {}),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "direct publication failed";
      throw new Error(message.split(configuration.token).join("[REDACTED]"));
    }
  } finally { releaseHubActivationLock(lock); }
}
