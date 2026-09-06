// Historical fixtures only; excluded from the release artifact.
import path from "node:path";
import { createHubRuntimeActions } from "../runtime-actions.ts";
import { resolveHubConfiguration } from "../configuration/configuration.ts";
import { admitPersistentLocalHub } from "../workspace/local-hub.ts";
import { acceptHubProposal } from "./test-support/accept.ts";
import { listPendingHubProposals } from "./pending.ts";
import { publishPendingHubProposals } from "../publication/test-support.ts";
import { GitHubHubApi } from "../../../providers/github-hub/index.ts";

export function createLegacyTestActions(environment: NodeJS.ProcessEnv, stateRoot: string,
  dependencies?: Parameters<typeof createHubRuntimeActions>[2]) {
  const configuration = () => {
    const value = resolveHubConfiguration(environment);
    if (value.kind !== "remote") throw new Error("fixture requires remote Hub configuration");
    return value;
  };
  return {
    ...createHubRuntimeActions(environment, stateRoot, dependencies),
    async accept(id: string, digest: string) {
      return acceptHubProposal({ stateRoot, localHub: await admitPersistentLocalHub(configuration()),
        proposalRoot: path.join(stateRoot, "proposals", id), expectedDiffDigest: digest });
    },
    async listPending() { return listPendingHubProposals(await admitPersistentLocalHub(configuration())); },
    async submitMany(ids: readonly string[]) {
      const config = configuration();
      if (!config.token) throw new Error("remote Hub publication requires the dedicated GitHub token");
      return publishPendingHubProposals({ stateRoot, localHub: await admitPersistentLocalHub(config),
        selectedProposalIds: ids, token: config.token, github: new GitHubHubApi(config.hub, config.token) });
    },
  };
}
