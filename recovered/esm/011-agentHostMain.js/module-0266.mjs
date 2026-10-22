// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostTelemetryService.ts
import { Disposable, isDisposable, toDisposable } from "./module-0010.mjs";
import { AgentHostTelemetryLevelConfigKey, agentHostConfigValueToTelemetryLevel } from "./module-0057.mjs";
import { joinPath } from "./module-0025.mjs";
import { URI } from "./module-0023.mjs";
import { NullTelemetryService, getPiiPathsFromEnvironment, isLoggingOnly, supportsTelemetry } from "./module-0247.mjs";
import { AgentHostDevDeviceIdEnvKey, AgentHostMachineIdEnvKey, AgentHostSqmIdEnvKey, AgentHostTelemetryLevelEnvKey } from "./module-0273.mjs";
import { resolveCommonProperties, verifyMicrosoftInternalDomain } from "./module-0246.mjs";
import { TelemetryLogAppender } from "./module-0270.mjs";
import { OneDataSystemAppender } from "./module-0269.mjs";
import { getDevDeviceId, getMachineId, getSqmMachineId } from "./module-0169.mjs";
import { TelemetryService } from "./module-0272.mjs";
import { AgentHostInternalTelemetrySender } from "./module-0274.mjs";
import { AgentHostRestrictedTelemetrySender } from "./module-0251.mjs";


// src/vs/platform/agentHost/node/agentHostTelemetryService.ts
import { hostname, release as release2 } from "os";


// src/vs/platform/agentHost/node/agentHostTelemetryService.ts
var AgentHostTelemetryService = class extends Disposable {
  constructor(_delegate, _restricted, copilotSdkVersion, copilotRuntimeVersion, initialTelemetryLevel = 3 /* USAGE */) {
    super();
    this._delegate = _delegate;
    this._restricted = _restricted;
    /**
     * Whether `/copilot_internal/user` enables enhanced/restricted telemetry. Defaults to `false`
     * so nothing restricted is sent until the authenticated account confirms the opt-in.
     */
    this._restrictedTelemetryEnabled = false;
    this._internalTelemetryEnabled = false;
    this._telemetryLevel = initialTelemetryLevel;
    this._internalMachine = _delegate.msftInternal === true;
    if (isDisposable(_delegate)) {
      this._register(_delegate);
    }
    if (copilotSdkVersion) {
      this._delegate.setCommonProperty("common.copilotSdkVersion", copilotSdkVersion);
    }
    if (copilotRuntimeVersion) {
      this._delegate.setCommonProperty("common.copilotRuntimeVersion", copilotRuntimeVersion);
    }
  }
  get telemetryLevel() {
    return Math.min(this._delegate.telemetryLevel, this._telemetryLevel);
  }
  get sendErrorTelemetry() {
    return this.telemetryLevel >= 2 /* ERROR */ && this._delegate.sendErrorTelemetry;
  }
  get sessionId() {
    return this._delegate.sessionId;
  }
  get machineId() {
    return this._delegate.machineId;
  }
  get sqmId() {
    return this._delegate.sqmId;
  }
  get devDeviceId() {
    return this._delegate.devDeviceId;
  }
  get firstSessionDate() {
    return this._delegate.firstSessionDate;
  }
  get msftInternal() {
    return this._delegate.msftInternal;
  }
  publicLog(eventName, data) {
    if (this.telemetryLevel < 3 /* USAGE */) {
      return;
    }
    this._delegate.publicLog(eventName, data);
  }
  publicLogError(eventName, data) {
    if (this.telemetryLevel < 2 /* ERROR */) {
      return;
    }
    this._delegate.publicLogError(eventName, data);
  }
  publicLog2(eventName, data) {
    if (this.telemetryLevel < 3 /* USAGE */) {
      return;
    }
    this._delegate.publicLog2(eventName, data);
  }
  publicLogError2(eventName, data) {
    if (this.telemetryLevel < 2 /* ERROR */) {
      return;
    }
    this._delegate.publicLogError2(eventName, data);
  }
  sendGHTelemetryEvent(eventName, properties, measurements) {
    if (this.telemetryLevel < 3 /* USAGE */) {
      return;
    }
    this._restricted?.sendGHTelemetryEvent(eventName, properties, measurements);
  }
  sendEnhancedGHTelemetryEvent(eventName, properties, measurements) {
    if (this.telemetryLevel < 3 /* USAGE */ || !this._restrictedTelemetryEnabled) {
      return;
    }
    this._restricted?.sendEnhancedGHTelemetryEvent(eventName, properties, measurements);
  }
  sendEnhancedGHTelemetryEventForContext(context, eventName, properties, measurements) {
    if (this.telemetryLevel < 3 /* USAGE */ || !context.restrictedTelemetryEnabled) {
      return;
    }
    this._restricted?.sendEnhancedGHTelemetryEventForContext(context, eventName, properties, measurements);
  }
  sendInternalMSFTTelemetryEvent(eventName, properties, measurements) {
    if (this.telemetryLevel < 3 /* USAGE */ || !this._internalTelemetryEnabled) {
      return;
    }
    this._restricted?.sendInternalMSFTTelemetryEvent(eventName, properties, measurements);
  }
  sendInternalMSFTTelemetryEventForContext(context, eventName, properties, measurements) {
    if (this.telemetryLevel < 3 /* USAGE */ || !context.isInternal) {
      return;
    }
    this._restricted?.sendInternalMSFTTelemetryEventForContext(context, eventName, properties, measurements);
  }
  setCopilotTrackingId(trackingId) {
    this._restricted?.setCopilotTrackingId(trackingId);
  }
  setRestrictedTelemetryEndpoint(endpointUrl2) {
    this._restricted?.setRestrictedTelemetryEndpoint(endpointUrl2);
  }
  setRestrictedTelemetryEnabled(enabled) {
    this._restrictedTelemetryEnabled = enabled;
    this._restricted?.setRestrictedTelemetryEnabled(enabled);
  }
  setInternalTelemetryContext(context) {
    this._internalTelemetryEnabled = context?.isInternal === true;
    if (context) {
      this._delegate.setCommonProperty("common.msftInternal", this._internalMachine || this._internalTelemetryEnabled);
    }
    this._restricted?.setInternalTelemetryContext(context);
  }
  setExperimentProperty(name, value) {
    this._delegate.setExperimentProperty(name, value);
  }
  setCommonProperty(name, value) {
    this._delegate.setCommonProperty(name, value);
    this._restricted?.setCommonProperty(name, value);
  }
  updateTelemetryLevel(telemetryLevel) {
    this._telemetryLevel = Math.min(this._telemetryLevel, telemetryLevel);
  }
};

function updateAgentHostTelemetryLevelFromConfig(telemetryService, config) {
  const telemetryLevel = config?.[AgentHostTelemetryLevelConfigKey];
  const telemetryLevelValue = agentHostConfigValueToTelemetryLevel(telemetryLevel);
  if (!isAgentHostTelemetryService(telemetryService) || telemetryLevelValue === void 0) {
    return;
  }
  telemetryService.updateTelemetryLevel(telemetryLevelValue);
}

function isAgentHostTelemetryService(telemetryService) {
  return typeof telemetryService.updateTelemetryLevel === "function";
}

async function resolveCopilotExtensionVersion(environmentService, fileService, logService) {
  if (!environmentService.builtinExtensionsPath) {
    return void 0;
  }
  try {
    const manifest = JSON.parse((await fileService.readFile(joinPath(URI.file(environmentService.builtinExtensionsPath), "copilot", "package.json"))).value.toString());
    return typeof manifest.version === "string" ? manifest.version : void 0;
  } catch (error) {
    logService.debug(`[agentHostTelemetry] Failed to resolve Copilot extension version: ${error instanceof Error ? error.message : String(error)}`);
    return void 0;
  }
}

async function createAgentHostTelemetryService(options) {
  const { environmentService, productService, fileService, loggerService, logService, disposables } = options;
  if (options.disableTelemetry || !loggerService || !supportsTelemetry(productService, environmentService)) {
    return disposables.add(new AgentHostTelemetryService(NullTelemetryService));
  }
  const initialTelemetryLevel = Math.min(
    parseLaunchTelemetryLevel(environmentService.args?.["telemetry-level"]),
    parseLaunchTelemetryLevel((options.readTelemetryLevelEnvironment ?? (() => process.env[AgentHostTelemetryLevelEnvKey]))())
  );
  const internalTelemetry = verifyMicrosoftInternalDomain(productService.msftInternalDomains ?? []);
  const appenders = [
    disposables.add(new TelemetryLogAppender("", false, loggerService, environmentService, productService))
  ];
  const loggingOnly = isLoggingOnly(productService, environmentService);
  if (!loggingOnly && productService.aiConfig?.ariaKey) {
    const collectorAppender = new OneDataSystemAppender(options.requestService, internalTelemetry, "monacoworkbench", null, productService.aiConfig.ariaKey);
    disposables.add(toDisposable(() => {
      void collectorAppender.flush();
    }));
    appenders.push(collectorAppender);
  }
  const [machineId2, sqmId, devDeviceId] = await Promise.all([
    process.env[AgentHostMachineIdEnvKey] || getMachineId((error) => logService.error(error)),
    process.env[AgentHostSqmIdEnvKey] || getSqmMachineId((error) => logService.error(error)),
    process.env[AgentHostDevDeviceIdEnvKey] || getDevDeviceId((error) => logService.error(error))
  ]);
  const commonProperties = resolveCommonProperties(release2(), hostname(), process.arch, productService.commit, productService.version, machineId2, sqmId, devDeviceId, internalTelemetry, productService.date);
  const telemetryService = TelemetryService.createWithLevel({
    appenders,
    sendErrorTelemetry: true,
    commonProperties,
    piiPaths: getPiiPathsFromEnvironment(environmentService),
    telemetryLevel: initialTelemetryLevel
  }, productService);
  const extensionVersion = loggingOnly ? void 0 : await resolveCopilotExtensionVersion(environmentService, fileService, logService);
  const internalSender = loggingOnly ? void 0 : disposables.add(new AgentHostInternalTelemetrySender({ requestService: options.requestService, commonProperties, extensionVersion }));
  const restricted = loggingOnly ? void 0 : new AgentHostRestrictedTelemetrySender(commonProperties, logService, void 0, internalSender, options.fetchFn);
  return disposables.add(new AgentHostTelemetryService(telemetryService, restricted, productService.copilotVersions?.sdk, productService.copilotVersions?.runtime, initialTelemetryLevel));
}

function parseLaunchTelemetryLevel(value) {
  return value === void 0 ? 3 /* USAGE */ : agentHostConfigValueToTelemetryLevel(value) ?? 0 /* NONE */;
}
export { updateAgentHostTelemetryLevelFromConfig, isAgentHostTelemetryService, resolveCopilotExtensionVersion, createAgentHostTelemetryService, parseLaunchTelemetryLevel, hostname, release2, AgentHostTelemetryService };
