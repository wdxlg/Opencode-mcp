import * as __reaScope from "../../../../native/context.mjs";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { absoluteCallerPath } from "../../filesystem/callerPath.js";
/** Choose a fresh temporary destination for an artifact extraction. */
export const createArtifactExtractionDestination = () => absoluteCallerPath(`${__reaScope.backendTempDir()}/rea-extracted-${randomUUID()}`);
