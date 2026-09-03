import { createHash } from "node:crypto";

import { observedValueSafetyFailure, type ObservedValueScalar } from "./observed-values.ts";

export type ProviderObservation = Readonly<{
  provider: "aws";
  profileFamily: string;
  profileVersion: number;
  authority: string;
  location: string;
  nativeIdentity: string;
  values: Readonly<Record<string, ObservedValueScalar>>;
  observedAt: string;
  evidenceDigest: string;
}>;

export type ProviderObservationInput = Omit<ProviderObservation, "evidenceDigest">;

const PROFILE = /^[a-z][a-z0-9.-]{1,127}$/;
const AUTHORITY = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$/;
const LOCATION = /^(?:global|[a-z]{2}(?:-gov)?-[a-z]+-\d)$/;
const PROPERTY = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

function canonical(input: ProviderObservationInput): string {
  return JSON.stringify({
    provider: input.provider,
    profileFamily: input.profileFamily,
    profileVersion: input.profileVersion,
    authority: input.authority,
    location: input.location,
    nativeIdentity: input.nativeIdentity,
    values: Object.fromEntries(Object.entries(input.values).sort(([left], [right]) => left.localeCompare(right))),
    observedAt: input.observedAt,
  });
}

export function createProviderObservation(input: ProviderObservationInput): ProviderObservation {
  const failures: string[] = [];
  if (input.provider !== "aws") failures.push("provider is unsupported");
  if (!PROFILE.test(input.profileFamily)) failures.push("profile family is invalid");
  if (!Number.isSafeInteger(input.profileVersion) || input.profileVersion < 1) failures.push("profile version is invalid");
  if (!AUTHORITY.test(input.authority)) failures.push("provider authority is invalid");
  if (!LOCATION.test(input.location)) failures.push("provider location is invalid");
  if (!input.nativeIdentity || input.nativeIdentity.includes("\n") || Buffer.byteLength(input.nativeIdentity) > 2048) failures.push("native identity is invalid");
  if (!Number.isFinite(Date.parse(input.observedAt))) failures.push("observation time is invalid");
  const entries = Object.entries(input.values);
  if (entries.length > 16) failures.push("provider observation has too many values");
  for (const [property, value] of entries) {
    if (!PROPERTY.test(property)) failures.push(`provider property ${property} is invalid`);
    const unsafe = observedValueSafetyFailure(property, value);
    if (unsafe) failures.push(`provider property ${property} ${unsafe}`);
  }
  if (failures.length) throw new Error(failures.join("; "));
  const evidenceDigest = `sha256:${createHash("sha256").update(canonical(input)).digest("hex")}`;
  return { ...input, values: Object.fromEntries(entries.sort(([left], [right]) => left.localeCompare(right))), evidenceDigest };
}

export function providerObservationSourceResource(observation: ProviderObservation): string {
  const scope = JSON.stringify([observation.provider, observation.profileFamily, observation.authority,
    observation.location, observation.nativeIdentity]);
  return `provider-observation://${observation.provider}/${createHash("sha256").update(scope).digest("hex")}`;
}

export function validateProviderObservation(observation: ProviderObservation): readonly string[] {
  try {
    const { evidenceDigest, ...input } = observation;
    return createProviderObservation(input).evidenceDigest === evidenceDigest ? [] : ["provider observation digest is invalid"];
  } catch (error) {
    return [error instanceof Error ? error.message : "provider observation is invalid"];
  }
}
