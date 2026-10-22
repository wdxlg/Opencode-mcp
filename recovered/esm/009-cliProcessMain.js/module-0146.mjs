// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/telemetry/common/1dsAppender.ts
import { isWeb } from "./module-0014.mjs";
import { importAMDNodeModule } from "./module-0145.mjs";
import { onUnexpectedError } from "./module-0003.mjs";
import { mixin } from "./module-0037.mjs";
import { validateTelemetryData } from "./module-0070.mjs";


// src/vs/platform/telemetry/common/1dsAppender.ts
var endpointUrl = "https://mobile.events.data.microsoft.com/OneCollector/1.0";

var endpointHealthUrl = "https://mobile.events.data.microsoft.com/ping";

function applyEnvelopeDefaults(envelope, isInternalMachine) {
  envelope["ext"] = envelope["ext"] ?? {};
  envelope["ext"]["web"] = envelope["ext"]["web"] ?? {};
  envelope["ext"]["web"]["consentDetails"] = '{"GPC_DataSharingOptIn":false}';
  const baseData = envelope["baseData"];
  if (isInternalMachine || baseData?.measurements?.["common.msftInternal"] === 1) {
    envelope["ext"]["utc"] = envelope["ext"]["utc"] ?? {};
    envelope["ext"]["utc"]["flags"] = 8462029;
  }
}

async function getClient(instrumentationKey, addInternalFlag, xhrOverride) {
  const oneDs = isWeb ? await importAMDNodeModule("@microsoft/1ds-core-js", "bundle/ms.core.min.js") : await import("@microsoft/1ds-core-js");
  const postPlugin = isWeb ? await importAMDNodeModule("@microsoft/1ds-post-js", "bundle/ms.post.min.js") : await import("@microsoft/1ds-post-js");
  const appInsightsCore = new oneDs.AppInsightsCore();
  const collectorChannelPlugin = new postPlugin.PostChannel();
  const coreConfig = {
    instrumentationKey,
    endpointUrl,
    loggingLevelTelemetry: 0,
    loggingLevelConsole: 0,
    disableCookiesUsage: true,
    disableDbgExt: true,
    disableInstrumentationKeyValidation: true,
    channels: [[
      collectorChannelPlugin
    ]]
  };
  if (xhrOverride) {
    coreConfig.extensionConfig = {};
    const channelConfig = {
      alwaysUseXhrOverride: true,
      ignoreMc1Ms0CookieProcessing: true,
      httpXHROverride: xhrOverride
    };
    coreConfig.extensionConfig[collectorChannelPlugin.identifier] = channelConfig;
  }
  appInsightsCore.initialize(coreConfig, []);
  appInsightsCore.addTelemetryInitializer((envelope) => applyEnvelopeDefaults(envelope, addInternalFlag));
  return appInsightsCore;
}

var AbstractOneDataSystemAppender = class {
  constructor(_isInternalTelemetry, _eventPrefix, _defaultData, iKeyOrClientFactory, _xhrOverride) {
    this._isInternalTelemetry = _isInternalTelemetry;
    this._eventPrefix = _eventPrefix;
    this._defaultData = _defaultData;
    this._xhrOverride = _xhrOverride;
    this.endPointUrl = endpointUrl;
    this.endPointHealthUrl = endpointHealthUrl;
    if (!this._defaultData) {
      this._defaultData = {};
    }
    if (typeof iKeyOrClientFactory === "function") {
      this._aiCoreOrKey = iKeyOrClientFactory();
    } else {
      this._aiCoreOrKey = iKeyOrClientFactory;
    }
    this._asyncAiCore = null;
  }
  _withAIClient(callback) {
    if (!this._aiCoreOrKey) {
      return;
    }
    if (typeof this._aiCoreOrKey !== "string") {
      callback(this._aiCoreOrKey);
      return;
    }
    if (!this._asyncAiCore) {
      this._asyncAiCore = getClient(this._aiCoreOrKey, this._isInternalTelemetry, this._xhrOverride);
    }
    this._asyncAiCore.then(
      (aiClient) => {
        callback(aiClient);
      },
      (err) => {
        onUnexpectedError(err);
        console.error(err);
      }
    );
  }
  log(eventName, data) {
    if (!this._aiCoreOrKey) {
      return;
    }
    data = mixin(data, this._defaultData);
    const validatedData = validateTelemetryData(data);
    const name = this._eventPrefix + "/" + eventName;
    try {
      this._withAIClient((aiClient) => {
        aiClient.pluginVersionString = validatedData?.properties.version ?? "Unknown";
        aiClient.track({
          name,
          baseData: { name, properties: validatedData?.properties, measurements: validatedData?.measurements }
        });
      });
    } catch {
    }
  }
  flush() {
    if (this._aiCoreOrKey) {
      return new Promise((resolve3) => {
        this._withAIClient((aiClient) => {
          aiClient.unload(true, () => {
            this._aiCoreOrKey = void 0;
            resolve3(void 0);
          });
        });
      });
    }
    return Promise.resolve(void 0);
  }
};
export { applyEnvelopeDefaults, getClient, endpointUrl, endpointHealthUrl, AbstractOneDataSystemAppender };
