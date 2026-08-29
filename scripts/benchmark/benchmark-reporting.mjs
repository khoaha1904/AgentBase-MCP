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

export function reportFor(entry, run, metrics) {
  const agent = run.agent ? `${run.agent.model} via ${run.agent.actualVersion}` : "unavailable";
  const catalogPrompt = run.catalogVersion && run.promptVersion ? `${run.catalogVersion} / ${run.promptVersion}` : "unavailable";
  const discovery = run.discoveryQualification
    ? `${run.discoveryQualification.status}; ${run.discoveryQualification.representativeChecks?.length ?? 0} representative checks`
    : "not applicable";
  const regression = metrics.regression?.status === "compared"
    ? `Compared with ${metrics.regression.previousRunId}; ${metrics.regression.regressions.length
      ? `regressions: ${metrics.regression.regressions.join("; ")}` : "no new hard regression"}`
    : "No prior accepted run in this suite";
  const list = (items) => items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
  const defects = `\n## Defect boundaries\n\n### OKF\n\n${list(metrics.authoringAssessment.hardFailures)}\n\n`
    + `### MCP/runtime\n\n${list(run.failures ?? [])}\n\n### Benchmark\n\n- None\n`;
  const header = `# ${entry.id} — agent OKF benchmark\n\n- Agent: ${agent}\n- Catalog/prompt: ${catalogPrompt}\n`
    + `- Agent outcome: ${run.outcome}\n- OKF validation: ${metrics.validation.passed ? "passed" : "failed"}\n`
    + `- Authoring assessment: ${metrics.authoringAssessment.status}\n- Owner review: ${metrics.ownerReview.status}\n`
    + `- Initial Ingest acceptance: ${metrics.initialIngestAcceptance}\n- Discovery qualification: ${discovery}\n- Regression: ${regression}\n`;
  if (run.outcome !== "succeeded") return header
    + `- Semantic metrics: not scored because the ${run.arm ?? "mcp"} arm lifecycle failed\n`
    + `\n## Hard failures\n\n${list(metrics.authoringAssessment.hardFailures)}\n${defects}`
    + `\n## Limitations\n\n${list(metrics.authoringAssessment.limitations)}\n`;
  const measured = (value, ratio) => `${value === null ? "n/a" : `${value}%`} (${ratio.matched}/${ratio.total})`;
  return header
    + `- Reference concept coverage: ${measured(metrics.referenceConceptCoveragePercent, metrics.ratios.referenceConceptCoverage)}\n`
    + `- Recognized schema agreement: ${measured(metrics.recognizedSchemaAgreementPercent, metrics.ratios.recognizedSchemaAgreement)}\n`
    + `- Metadata completeness: ${measured(metrics.metadataCompletenessPercent, metrics.ratios.metadataCompleteness)}\n`
    + `- Provenance coverage: ${measured(metrics.provenanceCoveragePercent, metrics.ratios.provenanceCoverage)}\n`
    + `- Reference relationship coverage: ${measured(metrics.referenceRelationshipCoveragePercent, metrics.ratios.referenceRelationshipCoverage)}\n`
    + `- Source-conflict visibility: ${measured(metrics.conflictVisibilityPercent, metrics.ratios.conflictVisibility)}\n`
    + `- Observed-value coverage: ${measured(metrics.observedValueCoveragePercent, metrics.ratios.observedValueCoverage)}\n`
    + `- Embedded-knowledge coverage: ${measured(metrics.embeddedKnowledgeCoveragePercent, metrics.ratios.embeddedKnowledgeCoverage)}\n`
    + `- Priority quality: ${metrics.priority?.qualityStatus ?? "unavailable"} (${metrics.priority?.weightedScore ?? 0}/${metrics.priority?.weightedPossible ?? 0}; critical ${metrics.priority?.tiers?.critical?.matched ?? 0}/${metrics.priority?.tiers?.critical?.total ?? 0}, important ${metrics.priority?.tiers?.important?.matched ?? 0}/${metrics.priority?.tiers?.important?.total ?? 0}, optional ${metrics.priority?.tiers?.optional?.matched ?? 0}/${metrics.priority?.tiers?.optional?.total ?? 0})\n`
    + `- Unjudged concepts / relationships: ${metrics.classifications.concepts.unjudged.length} / ${metrics.classifications.relationships.unjudged.length}\n`
    + `- Missing reference concepts / relationships: ${metrics.classifications.concepts.missingReference.length} / ${metrics.classifications.relationships.missingReference.length}\n`
    + (metrics.classifications.concepts.unjudged.length ? `\n## Unjudged concepts\n\n${list(metrics.classifications.concepts.unjudged)}\n` : "")
    + (metrics.classifications.relationships.unjudged.length ? `\n## Unjudged relationships\n\n${list(metrics.classifications.relationships.unjudged)}\n` : "")
    + (metrics.authoringAssessment.hardFailures.length ? `\n## Hard failures\n\n${list(metrics.authoringAssessment.hardFailures)}\n` : "")
    + (metrics.ownerReview.findings.length ? `\n## Owner-review findings\n\n${list(metrics.ownerReview.findings)}\n` : "")
    + defects + `\n## Limitations\n\n${list(metrics.authoringAssessment.limitations)}\n`;
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
