import { FakeCodeIntelligenceProvider } from "./fake-provider.ts";
import {
  acceptedNeighborhood,
  fixtureRepositoryMap,
  fixtureRepositoryOverview,
  fixtureTaskContext,
  isolatedNeighborhood,
} from "./fixture-snapshot.ts";

export { fixtureExpectation, fixtureTaskContextExpectation } from "./fixture-snapshot.ts";

export function createFixtureFakeProvider(): FakeCodeIntelligenceProvider {
  return new FakeCodeIntelligenceProvider(fixtureRepositoryMap, new Map([
    [acceptedNeighborhood.subjectId, acceptedNeighborhood],
    [isolatedNeighborhood.subjectId, isolatedNeighborhood],
  ]), { overview: fixtureRepositoryOverview, context: fixtureTaskContext });
}
