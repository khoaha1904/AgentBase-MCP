import assert from "node:assert/strict";
import test from "node:test";

import { parseConceptDocument } from "../documents/okf-document.ts";
import {
  createQuestionId,
  renderQuestionDocument,
  resolveQuestionFromEvidence,
  type SharedQuestion,
} from "./questions.ts";

function question(): SharedQuestion {
  const origin = { kind: "relation-candidate" as const, originSubject: "components/publisher",
    originProperty: "queue", scopeKey: "jobs" };
  return { id: createQuestionId(origin), revision: 1, state: "open", ...origin,
    subject: origin.originSubject, property: origin.originProperty,
    references: [{ referenceKind: "candidate-evidence", candidateKey: "jobs",
      sourceResource: "repository://repository-publisher-111111111111/main.tf#L1-L2" }],
    missingEvidence: ["Provider identity is missing."], limitations: [], guidance: [],
    title: "Question: publisher queue", createdAt: "2026-08-30T00:00:00Z" };
}

test("[AB-QUESTION-003][AB-ENRICH-018] resolved factual Question body reflects accepted evidence", () => {
  const resolved = resolveQuestionFromEvidence(question(), { referenceKind: "owned-item",
    owner: "resources/jobs", itemKind: "observed-value", itemKey: "AB-OBS-123",
    sourceId: "aws-sqs-123", observedRevision: `sha256:${"a".repeat(64)}` });
  const bytes = renderQuestionDocument(resolved);
  assert.deepEqual(resolved.missingEvidence, []);
  assert.match(bytes, /Resolved by accepted evidence/);
  assert.doesNotMatch(bytes, /maintainer decision is still required/);
  assert.equal(parseConceptDocument(`questions/${resolved.id}.md`, bytes).body.includes("Resolved by accepted evidence"), true);
});
