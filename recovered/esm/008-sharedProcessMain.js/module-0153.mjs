// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/telemetry/common/telemetryService.ts
import { DisposableStore } from "./module-0013.mjs";
import { escapeRegExpCharacters } from "./module-0022.mjs";
import { TelemetryTrustedValue, cleanData, getTelemetryLevel } from "./module-0090.mjs";
import { TELEMETRY_CRASH_REPORTER_SETTING_ID, TELEMETRY_OLD_SETTING_ID, TELEMETRY_SECTION_ID, TELEMETRY_SETTING_ID } from "./module-0085.mjs";
import { mixin } from "./module-0074.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { IProductService } from "./module-0045.mjs";
import { localize } from "./module-0007.mjs";
import { product_default } from "./module-0053.mjs";
import { isWeb } from "./module-0014.mjs";
import { Registry } from "./module-0051.mjs";
import { Extensions2 } from "./module-0054.mjs";


// src/vs/platform/telemetry/common/telemetryService.ts
var TelemetryService = class {
  constructor(config, configurationService, _productService) {
    this._productService = _productService;
    this._experimentProperties = {};
    this._pendingEvents = [];
    this._isExperimentPropertySet = false;
    this._disposables = new DisposableStore();
    this._cleanupPatterns = [];
    this._appenders = config.appenders;
    this._commonProperties = config.commonProperties ?? /* @__PURE__ */ Object.create(null);
    this.sessionId = this._commonProperties["sessionID"];
    this.machineId = this._commonProperties["common.machineId"];
    this.sqmId = this._commonProperties["common.sqmId"];
    this.devDeviceId = this._commonProperties["common.devDeviceId"];
    this.firstSessionDate = this._commonProperties["common.firstSessionDate"];
    this._piiPaths = config.piiPaths || [];
    this._telemetryLevel = 3 /* USAGE */;
    this._sendErrorTelemetry = !!config.sendErrorTelemetry;
    this._meteredConnectionService = config.meteredConnectionService;
    this._cleanupPatterns = [/(vscode-)?file:\/\/.*?\/resources\/app\//gi];
    for (const piiPath of this._piiPaths) {
      this._cleanupPatterns.push(new RegExp(escapeRegExpCharacters(piiPath), "gi"));
      if (piiPath.indexOf("\\") >= 0) {
        this._cleanupPatterns.push(new RegExp(escapeRegExpCharacters(piiPath.replace(/\\/g, "/")), "gi"));
      }
    }
    if (config.telemetryLevel !== void 0) {
      this._updateTelemetryLevel(config.telemetryLevel);
    } else {
      if (!configurationService) {
        throw new Error("TelemetryService requires a configuration service or a fixed telemetry level.");
      }
      this._updateTelemetryLevel(getTelemetryLevel(configurationService));
      this._disposables.add(configurationService.onDidChangeConfiguration((e) => {
        const affectsTelemetryConfig = e.affectsConfiguration(TELEMETRY_SETTING_ID) || e.affectsConfiguration(TELEMETRY_OLD_SETTING_ID) || e.affectsConfiguration(TELEMETRY_CRASH_REPORTER_SETTING_ID);
        if (affectsTelemetryConfig) {
          this._updateTelemetryLevel(getTelemetryLevel(configurationService));
        }
      }));
    }
    if (config.waitForExperimentProperties) {
      this._flushTimeout = setTimeout(() => this._flushPendingEvents(), TelemetryService.BUFFER_FLUSH_TIMEOUT);
    } else {
      this._isExperimentPropertySet = true;
    }
  }
  static {
    this.IDLE_START_EVENT_NAME = "UserIdleStart";
  }
  static {
    this.IDLE_STOP_EVENT_NAME = "UserIdleStop";
  }
  static {
    this.BUFFER_FLUSH_TIMEOUT = 1e4;
  }
  static {
    // 10 seconds
    this.MAX_BUFFER_SIZE = 1e3;
  }
  static createWithLevel(config, productService) {
    return new TelemetryService(config, void 0, productService);
  }
  setExperimentProperty(name, value) {
    this._experimentProperties[name] = new TelemetryTrustedValue(value);
    if (!this._isExperimentPropertySet) {
      this._flushPendingEvents();
    }
  }
  setCommonProperty(name, value) {
    this._commonProperties[name] = value;
  }
  _flushPendingEvents() {
    if (this._isExperimentPropertySet) {
      return;
    }
    this._isExperimentPropertySet = true;
    if (this._flushTimeout !== void 0) {
      clearTimeout(this._flushTimeout);
      this._flushTimeout = void 0;
    }
    for (const event of this._pendingEvents) {
      this._doLog(event.eventName, event.eventLevel, event.data);
    }
    this._pendingEvents = [];
  }
  _updateTelemetryLevel(level) {
    const collectableTelemetry = this._productService.enabledTelemetryLevels;
    if (collectableTelemetry) {
      this._sendErrorTelemetry = this.sendErrorTelemetry ? collectableTelemetry.error : false;
      const maxCollectableTelemetryLevel = collectableTelemetry.usage ? 3 /* USAGE */ : collectableTelemetry.error ? 2 /* ERROR */ : 0 /* NONE */;
      level = Math.min(level, maxCollectableTelemetryLevel);
    }
    this._telemetryLevel = level;
  }
  // Read live: an internal account can sign in after this service was created.
  get msftInternal() {
    return this._commonProperties["common.msftInternal"];
  }
  get sendErrorTelemetry() {
    return this._sendErrorTelemetry;
  }
  get telemetryLevel() {
    return this._telemetryLevel;
  }
  dispose() {
    this._flushPendingEvents();
    this._disposables.dispose();
  }
  _log(eventName, eventLevel, data) {
    if (this._telemetryLevel < eventLevel) {
      return;
    }
    if (this._meteredConnectionService?.isConnectionMetered) {
      return;
    }
    if (!this._isExperimentPropertySet) {
      if (this._pendingEvents.length < TelemetryService.MAX_BUFFER_SIZE) {
        this._pendingEvents.push({ eventName, eventLevel, data });
      }
      return;
    }
    this._doLog(eventName, eventLevel, data);
  }
  _doLog(eventName, eventLevel, data) {
    data = mixin(data, this._experimentProperties);
    data = cleanData(data, this._cleanupPatterns);
    data = mixin(data, this._commonProperties);
    if (eventLevel === 2 /* ERROR */) {
      data = { ...data, "isError": true };
    }
    this._appenders.forEach((a) => a.log(eventName, data ?? {}));
  }
  publicLog(eventName, data) {
    this._log(eventName, 3 /* USAGE */, data);
  }
  publicLog2(eventName, data) {
    this.publicLog(eventName, data);
  }
  publicLogError(errorEventName, data) {
    if (!this._sendErrorTelemetry) {
      return;
    }
    this._log(errorEventName, 2 /* ERROR */, data);
  }
  publicLogError2(eventName, data) {
    this.publicLogError(eventName, data);
  }
};

TelemetryService = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IProductService)
], TelemetryService);

function getTelemetryLevelSettingDescription() {
  const telemetryText = localize(3260, null, product_default.nameLong);
  const externalLinksStatement = !product_default.privacyStatementUrl ? localize(3247, null, "https://aka.ms/vscode-telemetry") : localize(3246, null, "https://aka.ms/vscode-telemetry", product_default.privacyStatementUrl);
  const restartString = !isWeb ? localize(3252, null) : "";
  const crashReportsHeader = localize(3245, null);
  const errorsHeader = localize(3250, null);
  const usageHeader = localize(3261, null);
  const telemetryTableDescription = localize(3259, null);
  const telemetryTable = `
|       | ${crashReportsHeader} | ${errorsHeader} | ${usageHeader} |
|:------|:-------------:|:---------------:|:----------:|
| all   |       \u2713       |        \u2713        |     \u2713      |
| error |       \u2713       |        \u2713        |     -      |
| crash |       \u2713       |        -        |     -      |
| off   |       -       |        -        |     -      |
`;
  const deprecatedSettingNote = localize(3255, null);
  const telemetryDescription = `
${telemetryText} ${externalLinksStatement} ${restartString}

&nbsp;

${telemetryTableDescription}
${telemetryTable}

&nbsp;

${deprecatedSettingNote}
`;
  return telemetryDescription;
}

var configurationRegistry2 = Registry.as(Extensions2.Configuration);

configurationRegistry2.registerConfiguration({
  "id": TELEMETRY_SECTION_ID,
  "order": 1,
  "type": "object",
  "title": localize(3262, null),
  "properties": {
    [TELEMETRY_SETTING_ID]: {
      "type": "string",
      "enum": ["all" /* ON */, "error" /* ERROR */, "crash" /* CRASH */, "off" /* OFF */],
      "enumDescriptions": [
        localize(3254, null),
        localize(3256, null),
        localize(3253, null),
        localize(3257, null)
      ],
      "markdownDescription": getTelemetryLevelSettingDescription(),
      "default": "all" /* ON */,
      "restricted": true,
      "scope": 1 /* APPLICATION */,
      "tags": ["usesOnlineServices", "telemetry"],
      "policy": {
        name: "TelemetryLevel",
        category: "Telemetry" /* Telemetry */,
        minimumVersion: "1.99",
        localization: {
          description: {
            key: "telemetry.telemetryLevel.policyDescription",
            value: localize(3258, null)
          },
          enumDescriptions: [
            {
              key: "telemetry.telemetryLevel.default",
              value: localize(3254, null)
            },
            {
              key: "telemetry.telemetryLevel.error",
              value: localize(3256, null)
            },
            {
              key: "telemetry.telemetryLevel.crash",
              value: localize(3253, null)
            },
            {
              key: "telemetry.telemetryLevel.off",
              value: localize(3257, null)
            }
          ]
        }
      }
    },
    "telemetry.feedback.enabled": {
      type: "boolean",
      default: true,
      description: localize(3251, null),
      policy: {
        name: "EnableFeedback",
        category: "Telemetry" /* Telemetry */,
        minimumVersion: "1.99",
        localization: { description: { key: "telemetry.feedback.enabled", value: localize(3251, null) } }
      }
    },
    // Deprecated telemetry setting
    [TELEMETRY_OLD_SETTING_ID]: {
      "type": "boolean",
      "markdownDescription": !product_default.privacyStatementUrl ? localize(3248, null, product_default.nameLong) : localize(3249, null, product_default.nameLong, product_default.privacyStatementUrl),
      "default": true,
      "restricted": true,
      "markdownDeprecationMessage": localize(3244, null, `\`#${TELEMETRY_SETTING_ID}#\``),
      "scope": 1 /* APPLICATION */,
      "tags": ["usesOnlineServices", "telemetry"]
    }
  }
});
export { getTelemetryLevelSettingDescription, TelemetryService, configurationRegistry2 };
