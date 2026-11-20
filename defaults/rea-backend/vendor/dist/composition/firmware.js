import * as __reaScope from "../../../native/context.mjs";
import { firmwareHostSupported, } from "../firmware/FirmwareCommand.js";
import { FirmwareProvider } from "../firmware/FirmwareProvider.js";
export { firmwareHostSupported };
/** Construct one firmware provider without launching or acquiring an engine. */
export const createFirmwareAnalysisProvider = (environment = __reaScope.backendEnvironment(), launcher) => new FirmwareProvider(environment, launcher);
