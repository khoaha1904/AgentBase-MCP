import type { AdmittedLocalHubState } from "../../../core/hub/index.ts";
import { prepareQuestionGuidanceProposal } from "../authoring/guidance-proposal.ts";
import type { HubToolActions } from "../mcp/mcp-tools.ts";
import {
  acquireHubMutationLock,
  hubMutationProfileId,
  readHubProposalState,
  releaseHubMutationLock,
} from "./proposal-state.ts";
import { readVerifiedHubProposalInspection } from "./inspect.ts";
import { listHubQuestions, readHubQuestion } from "../authoring/questions.ts";

type ReviewActions = Pick<HubToolActions, "inspect" | "listQuestions" | "answerQuestion">;

export function createReviewActions(
  stateRoot: string,
  proposalRoot: (proposalId: string) => string,
  admit: () => Promise<AdmittedLocalHubState>,
): ReviewActions {
  return {
    async inspect(proposalId) {
      const root = proposalRoot(proposalId);
      const proposal = readHubProposalState(root);
      return {
        proposal,
        inspection: readVerifiedHubProposalInspection(root, proposal),
      };
    },
    async listQuestions(options) {
      const localHub = await admit();
      return listHubQuestions(localHub, options);
    },
    async answerQuestion(input) {
      const localHub = await admit();
      const lock = acquireHubMutationLock(stateRoot, hubMutationProfileId(localHub), `answer:${input.questionId}`);
      try {
        const current = readHubQuestion(localHub, input.questionId);
        if (current.revision !== input.revision) throw new Error("question revision changed");
        const at = new Date().toISOString();
        return await prepareQuestionGuidanceProposal({
          stateRoot, localHub, question: current, answer: input.answer, by: input.maintainer, at,
        });
      } finally { releaseHubMutationLock(lock); }
    },
  };
}
