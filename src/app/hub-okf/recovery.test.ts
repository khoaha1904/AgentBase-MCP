import assert from "node:assert/strict";
import { test } from "node:test";

import { recoverHubSubmission } from "./recovery.ts";
import { readHubProposalState } from "./proposal-state.ts";
import { submitHubProposal } from "./submit.ts";
import { createSubmissionFixture } from "./test-support.ts";

test("[AB-HUB-012][AB-HUB-013] PR failure after push recovers exact branch without another push", async () => {
  const current = createSubmissionFixture();
  try {
    current.setFailPull(true);
    await assert.rejects(submitHubProposal(current.options), /simulated PR failure/);
    assert.equal(readHubProposalState(current.options.proposalRoot).phase, "pushed");
    assert.equal(current.pushCount(), 1);
    current.setFailPull(false);
    const receipt = await recoverHubSubmission(current.options);
    assert.equal(receipt.pullRequest.number, 9);
    assert.equal(current.pushCount(), 1);
    assert.equal(current.pullCount(), 1);
  } finally { current.cleanup(); }
});
