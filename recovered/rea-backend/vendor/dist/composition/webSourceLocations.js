import * as __reaScope from "../../../native/context.mjs";
import { WebSourceLocationService } from "../application/WebSourceLocationService.js";
import { LocalWebSourceLocationArtifacts } from "../browser/assets/WebSourceLocationArtifacts.js";
import { SourceMapDecoder } from "../javascript/sourceMaps/SourceMapDecoder.js";
/** Compose local source/map analysis without import-time reads or process acquisition. */
export const createWebSourceLocationService = (environment = __reaScope.backendEnvironment()) => new WebSourceLocationService(new LocalWebSourceLocationArtifacts(), new SourceMapDecoder({ environment }));
