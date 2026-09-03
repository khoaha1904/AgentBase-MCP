import type { OkfConceptSchema } from "../definition.ts";
import { DATA_SCHEMAS } from "./data.ts";
import { FOUNDATION_SCHEMAS } from "./foundation.ts";
import { GOVERNANCE_SCHEMAS } from "./governance.ts";
import { INFRASTRUCTURE_SCHEMAS } from "./infrastructure.ts";
import { SOFTWARE_SCHEMAS } from "./software.ts";

export type { OkfConceptSchema } from "../definition.ts";

export const OKF_CONCEPT_SCHEMAS: readonly OkfConceptSchema[] = [
  ...FOUNDATION_SCHEMAS,
  ...SOFTWARE_SCHEMAS,
  ...INFRASTRUCTURE_SCHEMAS,
  ...DATA_SCHEMAS,
  ...GOVERNANCE_SCHEMAS,
];
