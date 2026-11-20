import * as __reaScope from "../../../native/context.mjs";
import { WakaruProvider } from "../javascript/recovery/WakaruProvider.js";
import { wakaruHostSupported, } from "../javascript/recovery/WakaruCommand.js";
export { wakaruHostSupported };
/** Construct optional recovery without acquiring tools, processes or workspaces. */
export const createJavaScriptRecoveryProvider = (environment = __reaScope.backendEnvironment(), launcher) => new WakaruProvider(environment, launcher);
