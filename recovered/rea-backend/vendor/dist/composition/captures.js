import * as __reaScope from "../../../native/context.mjs";
import { PacketCaptureService } from "../application/captures/PacketCaptureService.js";
import { TsharkCaptureProvider, tsharkHostSupported, } from "../captures/TsharkCaptureProvider.js";
export { tsharkHostSupported };
export const createPacketCaptureService = (environment = __reaScope.backendEnvironment()) => new PacketCaptureService(new TsharkCaptureProvider(environment));
