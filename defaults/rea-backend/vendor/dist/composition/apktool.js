import * as __reaScope from "../../../native/context.mjs";
import { ApktoolProvider } from "../apktool/ApktoolProvider.js";
/** Construct one Apktool provider bound to the caller-selected launcher. */
export const createApktoolResourceAnalysisProvider = (environment = __reaScope.backendEnvironment()) => new ApktoolProvider({ environment });
