import fs from "node:fs";
import path from "node:path";

import type { EngineIdentity, RepositorySourceState } from "../../core/observations/index.ts";

const MAX_RECEIPT_BYTES = 64 * 1024;
const SHA256 = /^[a-f0-9]{64}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;

type ReceiptSource = Readonly<{
  commit: string | null;
  dirty: boolean;
  dirtyDigest: string | null;
}>;

export type GraphFreshnessReceipt = Readonly<{
  schemaVersion: 1;
  repositoryId: string;
  source: ReceiptSource;
  engine: EngineIdentity;
  namespaceId: string;
  evidenceDigest: string;
  acceptedAt: string;
}>;

export type GraphPreparationDecision = Readonly<{
  mode: "reused" | "refreshed";
  reason: "exact-match" | "missing-receipt" | "source-changed" | "provider-changed" | "forced";
}>;

type ReceiptInput = Readonly<{
  source: RepositorySourceState;
  engine: EngineIdentity;
  namespaceId: string;
  evidenceDigest: string;
  acceptedAt: string;
}>;

type CommitOperations = Readonly<{
  renameSync?: (oldPath: string, newPath: string) => void;
}>;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function bounded(value: unknown, maximum = 512): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximum;
}

function validEngine(value: unknown): value is EngineIdentity {
  if (!record(value) || !exactKeys(value, [
    "provider", "packageName", "providerVersion", "packageIntegrity",
    "executableSha256", "adapterVersion", "invocationMode",
  ])) return false;
  return value.provider === "codebase-memory-mcp"
    && value.packageName === "codebase-memory-mcp"
    && value.providerVersion === "0.10.1"
    && bounded(value.packageIntegrity, 1024)
    && typeof value.executableSha256 === "string" && SHA256.test(value.executableSha256)
    && Number.isSafeInteger(value.adapterVersion) && Number(value.adapterVersion) > 0
    && (value.invocationMode === "one-shot-cli" || value.invocationMode === "scoped-session");
}

function validSource(value: unknown): value is ReceiptSource {
  if (!record(value) || !exactKeys(value, ["commit", "dirty", "dirtyDigest"])) return false;
  if (value.commit !== null && !bounded(value.commit, 128)) return false;
  if (typeof value.dirty !== "boolean") return false;
  if (value.dirty) return typeof value.dirtyDigest === "string" && DIGEST.test(value.dirtyDigest);
  return value.dirtyDigest === null;
}

function parseReceipt(value: unknown): GraphFreshnessReceipt | null {
  if (!record(value) || !exactKeys(value, [
    "schemaVersion", "repositoryId", "source", "engine", "namespaceId",
    "evidenceDigest", "acceptedAt",
  ])) return null;
  if (value.schemaVersion !== 1 || !bounded(value.repositoryId, 128)) return null;
  if (!validSource(value.source) || !validEngine(value.engine)) return null;
  if (typeof value.namespaceId !== "string" || !SHA256.test(value.namespaceId)) return null;
  if (typeof value.evidenceDigest !== "string" || !DIGEST.test(value.evidenceDigest)) return null;
  if (!bounded(value.acceptedAt, 64) || !Number.isFinite(Date.parse(value.acceptedAt))) return null;
  return value as GraphFreshnessReceipt;
}

function sourceIdentity(source: RepositorySourceState): ReceiptSource {
  return { commit: source.commit, dirty: source.dirty, dirtyDigest: source.dirtyDigest };
}

function equal(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function createGraphFreshnessReceipt(input: ReceiptInput): GraphFreshnessReceipt {
  const receipt: GraphFreshnessReceipt = {
    schemaVersion: 1,
    repositoryId: input.source.repositoryId,
    source: sourceIdentity(input.source),
    engine: { ...input.engine },
    namespaceId: input.namespaceId,
    evidenceDigest: input.evidenceDigest,
    acceptedAt: input.acceptedAt,
  };
  const validated = parseReceipt(receipt);
  if (!validated) throw new Error("graph freshness receipt input is invalid");
  return validated;
}

export function readGraphFreshnessReceipt(receiptPath: string): GraphFreshnessReceipt | null {
  try {
    const stat = fs.lstatSync(receiptPath);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_RECEIPT_BYTES) return null;
    return parseReceipt(JSON.parse(fs.readFileSync(receiptPath, "utf8")));
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

export function decideGraphPreparation(input: Readonly<{
  receipt: GraphFreshnessReceipt | null;
  source: RepositorySourceState;
  engine: EngineIdentity;
  namespaceId: string;
  forced: boolean;
}>): GraphPreparationDecision {
  if (input.forced) return { mode: "refreshed", reason: "forced" };
  if (!input.receipt) return { mode: "refreshed", reason: "missing-receipt" };
  if (input.receipt.repositoryId !== input.source.repositoryId
    || !equal(input.receipt.source, sourceIdentity(input.source))) {
    return { mode: "refreshed", reason: "source-changed" };
  }
  if (!equal(input.receipt.engine, input.engine) || input.receipt.namespaceId !== input.namespaceId) {
    return { mode: "refreshed", reason: "provider-changed" };
  }
  return { mode: "reused", reason: "exact-match" };
}

export function commitGraphFreshnessReceipt(
  receiptPath: string,
  receipt: GraphFreshnessReceipt,
  operations: CommitOperations = {},
): void {
  const directory = path.dirname(receiptPath);
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.chmodSync(directory, 0o700);
  const temporaryPath = path.join(directory, `.${path.basename(receiptPath)}.${process.pid}.${Date.now().toString(36)}.tmp`);
  try {
    fs.writeFileSync(temporaryPath, `${JSON.stringify(receipt)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
    const descriptor = fs.openSync(temporaryPath, "r");
    try { fs.fsyncSync(descriptor); } finally { fs.closeSync(descriptor); }
    (operations.renameSync ?? fs.renameSync)(temporaryPath, receiptPath);
    fs.chmodSync(receiptPath, 0o600);
  } catch (error) {
    try { fs.rmSync(temporaryPath, { force: true }); } catch { /* best-effort temporary cleanup */ }
    throw error;
  }
}
