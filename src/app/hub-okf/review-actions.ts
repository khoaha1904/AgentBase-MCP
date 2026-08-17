import fs from "node:fs";
import path from "node:path";

import type { AdmittedLocalHubState } from "../../core/hub/index.ts";
import { prepareQuestionGuidanceProposal } from "./guidance-proposal.ts";
import type { HubToolActions } from "./mcp-tools.ts";
import { acquireHubMutationLock, readHubProposalState, releaseHubMutationLock } from "./proposal-state.ts";
import { reconcileAcceptedQuestions } from "./question-recovery.ts";
import { listHubQuestions, readHubQuestion, recordQuestionAnswer } from "./questions.ts";

type ReviewActions = Pick<HubToolActions, "inspect" | "listQuestions" | "answerQuestion">;

export function createReviewActions(
  stateRoot: string,
  proposalRoot: (proposalId: string) => string,
  admit: () => Promise<AdmittedLocalHubState>,
): ReviewActions {
  return {
    async inspect(proposalId) {
      const root = proposalRoot(proposalId);
      return {
        proposal: readHubProposalState(root),
        inspection: JSON.parse(fs.readFileSync(path.join(root, "inspection.json"), "utf8")) as unknown,
      };
    },
    async listQuestions(options) {
      const localHub = await admit();
      const lock = acquireHubMutationLock(stateRoot, "questions:list");
      try {
        reconcileAcceptedQuestions(stateRoot, localHub);
        return listHubQuestions(stateRoot, localHub, options);
      } finally { releaseHubMutationLock(lock); }
    },
    async answerQuestion(input) {
      const localHub = await admit();
      const lock = acquireHubMutationLock(stateRoot, `answer:${input.questionId}`);
      try {
        reconcileAcceptedQuestions(stateRoot, localHub);
        const current = readHubQuestion(stateRoot, localHub, input.questionId);
        if (current.revision !== input.revision) throw new Error("question revision changed");
        const at = new Date().toISOString();
        const guidance = await prepareQuestionGuidanceProposal({
          stateRoot, localHub, question: current, answer: input.answer, by: input.maintainer, at,
        });
        const question = recordQuestionAnswer(
          stateRoot, localHub, input.questionId, input.revision,
          input.answer, input.maintainer, guidance.proposal.id, at,
        );
        return { question, ...guidance };
      } finally { releaseHubMutationLock(lock); }
    },
  };
}
