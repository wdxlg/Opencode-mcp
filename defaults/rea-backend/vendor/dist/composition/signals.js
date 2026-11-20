import * as __reaScope from "../../../native/context.mjs";
import { SignalRecordingService } from "../application/signals/SignalRecordingService.js";
import { SigrokRecordingProvider, sigrokHostSupported, } from "../signals/SigrokRecordingProvider.js";
export { sigrokHostSupported };
export const createSignalRecordingService = (environment = __reaScope.backendEnvironment()) => new SignalRecordingService(new SigrokRecordingProvider(environment));
