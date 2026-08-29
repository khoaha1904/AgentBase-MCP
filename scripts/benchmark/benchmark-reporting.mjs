export function createRunRegression(currentRun, currentMetrics, previous) {
  if (!previous) return { status: "no-baseline", previousRunId: null, changes: {}, regressions: [] };
  const numeric = ["referenceConceptCoveragePercent", "embeddedKnowledgeCoveragePercent",
    "recognizedSchemaAgreementPercent", "metadataCompletenessPercent", "provenanceCoveragePercent"];
  const changes = Object.fromEntries(numeric.flatMap((field) => Number.isFinite(currentMetrics[field])
    && Number.isFinite(previous.metrics[field]) ? [[field, currentMetrics[field] - previous.metrics[field]]] : []));
  if (Number.isFinite(currentRun.elapsedMs) && Number.isFinite(previous.run.elapsedMs)) {
    changes.elapsedMs = currentRun.elapsedMs - previous.run.elapsedMs;
  }
  for (const field of ["inputTokens", "outputTokens", "reasoningOutputTokens"]) {
    const current = currentRun.usage?.[field], prior = previous.run.usage?.[field];
    if (Number.isFinite(current) && Number.isFinite(prior)) changes[field] = current - prior;
  }
  const acceptanceRank = { invalid: 0, valid_partial: 1, review_ready: 2 };
  const regressions = [];
  if (acceptanceRank[currentMetrics.initialIngestAcceptance] < acceptanceRank[previous.metrics.initialIngestAcceptance]) {
    regressions.push(`Initial Ingest acceptance declined from ${previous.metrics.initialIngestAcceptance} to ${currentMetrics.initialIngestAcceptance}`);
  }
  if (previous.metrics.validation?.passed && !currentMetrics.validation?.passed) regressions.push("OKF validation changed from passed to failed");
  if (previous.run.discoveryQualification?.status === "passed" && currentRun.discoveryQualification?.status !== "passed") {
    regressions.push("Discovery qualification changed from passed to failed");
  }
  return { status: "compared", previousRunId: previous.runId, changes, regressions };
}

function efficiencyFor(run) {
  if (!run) return null;
  return {
    elapsedMs: Number.isFinite(run.elapsedMs) ? run.elapsedMs : null,
    inputTokens: run.usage?.inputTokens ?? null,
    cachedInputTokens: run.usage?.cachedInputTokens ?? null,
    cacheWriteInputTokens: run.usage?.cacheWriteInputTokens ?? null,
    uncachedInputTokens: run.usage?.uncachedInputTokens ?? null,
    outputTokens: run.usage?.outputTokens ?? null,
    reasoningOutputTokens: run.usage?.reasoningOutputTokens ?? null,
  };
}

export function createPairComparison({ pair, runs, metrics }) {
  const failures = [];
  for (const arm of ["mcp", "direct"]) {
    const run = runs[arm];
    if (!run) failures.push(`${arm} arm run is missing`);
    else if (run.outcome !== "succeeded") failures.push(`${arm} arm did not succeed: ${run.failures?.join("; ") || "unknown failure"}`);
    if (!metrics[arm]) failures.push(`${arm} arm metrics are unavailable`);
    if (run && !run.usage) failures.push(`${arm} arm token usage is unavailable`);
    if (run && !Number.isFinite(run.elapsedMs)) failures.push(`${arm} arm elapsed time is unavailable`);
  }
  const efficiency = { mcp: efficiencyFor(runs.mcp), direct: efficiencyFor(runs.direct), delta: {} };
  for (const field of ["elapsedMs", "inputTokens", "cachedInputTokens", "cacheWriteInputTokens", "uncachedInputTokens", "outputTokens", "reasoningOutputTokens"]) {
    const mcp = efficiency.mcp?.[field], direct = efficiency.direct?.[field];
    if (Number.isFinite(mcp) && Number.isFinite(direct)) efficiency.delta[field] = mcp - direct;
  }
  return { suite: pair.suite, repository: pair.repository, pairId: pair.pairId,
    completeness: { status: failures.length ? "incomplete" : "complete", failures },
    quality: { mcp: metrics.mcp ?? null, direct: metrics.direct ?? null }, efficiency,
    activity: { mcp: runs.mcp?.activity ?? null, direct: runs.direct?.activity ?? null } };
}
