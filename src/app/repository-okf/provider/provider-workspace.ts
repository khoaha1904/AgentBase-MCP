import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { agentBaseStorage } from "../../local-storage/index.ts";

export type ProviderWorkspace = Readonly<{
  cacheRoot: string;
  allowedRoot: string;
  project: string;
  namespaceId: string;
  receiptPath: string;
}>;

function privateDirectory(directory: string): void {
  if (fs.existsSync(directory) && fs.lstatSync(directory).isSymbolicLink()) throw new Error(`provider workspace cannot cross symlink: ${directory}`);
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.chmodSync(directory, 0o700);
}

function defaultStateRoot(): string {
  return agentBaseStorage().providerCache;
}

export function prepareProviderWorkspace(repositoryRoot: string, repositoryId: string, stateRoot = defaultStateRoot(), scope = "default"): ProviderWorkspace {
  if (!/^repository-[a-z0-9-]+-[a-f0-9]{12}$/.test(repositoryId)) throw new Error("repositoryId is not a normalized AgentBase identity");
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(scope)) throw new Error("provider workspace scope must be a bounded safe identifier");
  const allowedRoot = fs.realpathSync(repositoryRoot);
  const absoluteStateRoot = path.resolve(stateRoot);
  if (absoluteStateRoot === allowedRoot || absoluteStateRoot.startsWith(`${allowedRoot}${path.sep}`)) {
    throw new Error("provider cache must remain outside the allowed repository root");
  }
  privateDirectory(absoluteStateRoot);
  const providerRoot = path.join(absoluteStateRoot, "provider", "codebase-memory", "0.10.8");
  privateDirectory(path.join(absoluteStateRoot, "provider"));
  privateDirectory(path.join(absoluteStateRoot, "provider", "codebase-memory"));
  privateDirectory(providerRoot);
  const identityDigest = createHash("sha256").update(repositoryId).digest("hex");
  const repositoryCacheRoot = path.join(providerRoot, identityDigest.slice(0, 24));
  const cacheRoot = scope === "default" ? repositoryCacheRoot : path.join(repositoryCacheRoot, scope);
  privateDirectory(repositoryCacheRoot);
  privateDirectory(cacheRoot);
  const namespaceId = createHash("sha256")
    .update("codebase-memory").update("\0")
    .update("0.10.8").update("\0")
    .update(repositoryId).update("\0")
    .update(scope)
    .digest("hex");
  const metadataRoot = path.join(absoluteStateRoot, "metadata", "codebase-memory", "0.10.8", identityDigest.slice(0, 24), scope);
  privateDirectory(path.join(absoluteStateRoot, "metadata"));
  privateDirectory(path.join(absoluteStateRoot, "metadata", "codebase-memory"));
  privateDirectory(path.join(absoluteStateRoot, "metadata", "codebase-memory", "0.10.8"));
  privateDirectory(path.join(absoluteStateRoot, "metadata", "codebase-memory", "0.10.8", identityDigest.slice(0, 24)));
  privateDirectory(metadataRoot);
  return {
    cacheRoot,
    allowedRoot,
    project: `agentbase-${identityDigest.slice(0, 16)}`,
    namespaceId,
    receiptPath: path.join(metadataRoot, "freshness.json"),
  };
}
