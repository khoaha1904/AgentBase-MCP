import { evaluateConformance, normalizeNeighborhood, stableSerialize } from "../../core/code-intelligence/index.ts";
import { createFixtureFakeProvider, fixtureExpectation } from "../../providers/fake-code-intelligence/index.ts";

export async function runFoundationDemo() {
  const provider = createFixtureFakeProvider();
  const mapResult = await provider.repositoryMap(fixtureExpectation.repositoryId);
  if (mapResult.status !== "found") throw new Error(`Fixture repository map failed: ${mapResult.status}`);
  const neighborhoodResult = await provider.relevantNeighborhood(fixtureExpectation.query);
  if (neighborhoodResult.status !== "found") throw new Error(`Fixture neighborhood failed: ${neighborhoodResult.status}`);
  const neighborhood = normalizeNeighborhood(neighborhoodResult);
  const conformance = await evaluateConformance(provider, fixtureExpectation);
  return {
    repositoryMap: mapResult.map,
    relevantNeighborhood: neighborhood,
    benchmark: {
      passed: conformance.passed,
      distinctFiles: conformance.distinctFiles,
      maximumFiles: fixtureExpectation.maximumFiles,
      missingNodeIds: conformance.missingNodeIds,
      missingEdgeIds: conformance.missingEdgeIds,
      deterministicRuns: conformance.serializations.length,
      normalizedBytes: Buffer.byteLength(stableSerialize(neighborhood)),
    },
  } as const;
}

type Writer = (value: string) => void;

export async function executeFoundationCli(
  writeOutput: Writer = (value) => process.stdout.write(value),
  writeError: Writer = (value) => process.stderr.write(value),
): Promise<number> {
  try {
    const result = await runFoundationDemo();
    writeOutput(`${JSON.stringify(result, null, 2)}\n`);
    return result.benchmark.passed ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeError(`Foundation demo failed: ${message}\n`);
    return 1;
  }
}
