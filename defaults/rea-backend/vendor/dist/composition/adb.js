import * as __reaScope from "../../../native/context.mjs";
import { AdbProvider } from "../adb/AdbProvider.js";
/** Construct one ADB provider bound to the caller-selected binary. */
export const createAdbDeviceAnalysisProvider = (environment = __reaScope.backendEnvironment()) => new AdbProvider({ environment });
