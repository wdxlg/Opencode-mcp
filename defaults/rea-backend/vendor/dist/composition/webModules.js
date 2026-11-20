import * as __reaScope from "../../../native/context.mjs";
import { WebModuleTraceService } from "../application/WebModuleTraceService.js";
import { LocalWebModuleArtifacts } from "../browser/modules/WebModuleArtifacts.js";
import { NativeModuleResolver } from "../browser/modules/NativeModuleResolver.js";
/** Assemble optional module tracing without acquiring a browser or reading files. */
export const createWebModuleTraceService = (environment = __reaScope.backendEnvironment()) => new WebModuleTraceService(new LocalWebModuleArtifacts(), new NativeModuleResolver(environment));
