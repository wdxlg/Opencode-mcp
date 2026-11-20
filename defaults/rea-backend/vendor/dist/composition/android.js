import * as __reaScope from "../../../native/context.mjs";
import { JadxProvider } from "../android/JadxProvider.js";
/** Construct one APK provider with its own queue and cleanup-failure state. */
export const createAndroidAnalysisProvider = (environment = __reaScope.backendEnvironment(), launcher, settings) => new JadxProvider(environment, launcher, settings);
