import * as __reaScope from "../../../native/context.mjs";
import { PcapProvider } from "../pcap/PcapProvider.js";
/** Construct one pcap provider bound to the caller-selected tools. */
export const createPcapAnalysisProvider = (environment = __reaScope.backendEnvironment()) => new PcapProvider({ environment });
