// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostTelemetry.ts
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0019.mjs";
import { localize } from "./module-0015.mjs";
import { TelemetryLogGroup, cleanData, cleanRemoteAuthority } from "./module-0164.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";
import { ILoggerService } from "./module-0045.mjs";
import { mixin } from "./module-0055.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/api/common/extHostTelemetry.ts
var ExtHostTelemetry = class extends Disposable {
  constructor(isWorker, initData, loggerService) {
    super();
    this.initData = initData;
    this._onDidChangeTelemetryEnabled = this._register(new Emitter());
    this.onDidChangeTelemetryEnabled = this._onDidChangeTelemetryEnabled.event;
    this._onDidChangeTelemetryConfiguration = this._register(new Emitter());
    this.onDidChangeTelemetryConfiguration = this._onDidChangeTelemetryConfiguration.event;
    this._productConfig = { usage: true, error: true };
    this._level = 0 /* NONE */;
    this._inLoggingOnlyMode = false;
    this._telemetryLoggers = /* @__PURE__ */ new Map();
    this._inLoggingOnlyMode = this.initData.environment.isExtensionTelemetryLoggingOnly;
    const id2 = initData.remote.isRemote ? "remoteExtHostTelemetry" : isWorker ? "workerExtHostTelemetry" : "extHostTelemetry";
    this._outputLogger = this._register(loggerService.createLogger(
      id2,
      {
        name: localize(5890, null, this._inLoggingOnlyMode ? " (Not Sent)" : ""),
        hidden: true,
        group: TelemetryLogGroup
      }
    ));
  }
  getTelemetryConfiguration() {
    return this._level === 3 /* USAGE */;
  }
  getTelemetryDetails() {
    return {
      isCrashEnabled: this._level >= 1 /* CRASH */,
      isErrorsEnabled: this._productConfig.error ? this._level >= 2 /* ERROR */ : false,
      isUsageEnabled: this._productConfig.usage ? this._level >= 3 /* USAGE */ : false
    };
  }
  instantiateLogger(extension, sender, options2) {
    const telemetryDetails = this.getTelemetryDetails();
    const logger = new ExtHostTelemetryLogger(
      sender,
      options2,
      extension,
      this._outputLogger,
      this._inLoggingOnlyMode,
      this.getBuiltInCommonProperties(extension),
      { isUsageEnabled: telemetryDetails.isUsageEnabled, isErrorsEnabled: telemetryDetails.isErrorsEnabled }
    );
    const loggers = this._telemetryLoggers.get(extension.identifier.value) ?? [];
    this._telemetryLoggers.set(extension.identifier.value, [...loggers, logger]);
    return logger.apiTelemetryLogger;
  }
  $initializeTelemetryLevel(level, supportsTelemetry, productConfig) {
    this._level = level;
    this._productConfig = productConfig ?? { usage: true, error: true };
  }
  getBuiltInCommonProperties(extension) {
    const commonProperties = /* @__PURE__ */ Object.create(null);
    commonProperties["common.extname"] = `${extension.publisher}.${extension.name}`;
    commonProperties["common.extversion"] = extension.version;
    commonProperties["common.vscodemachineid"] = this.initData.telemetryInfo.machineId;
    commonProperties["common.vscodesessionid"] = this.initData.telemetryInfo.sessionId;
    commonProperties["common.vscodecommithash"] = this.initData.commit;
    commonProperties["common.sqmid"] = this.initData.telemetryInfo.sqmId;
    commonProperties["common.devDeviceId"] = this.initData.telemetryInfo.devDeviceId ?? this.initData.telemetryInfo.machineId;
    commonProperties["common.vscodeversion"] = this.initData.version;
    commonProperties["common.vscodereleasedate"] = this.initData.date;
    commonProperties["common.isnewappinstall"] = isNewAppInstall(this.initData.telemetryInfo.firstSessionDate);
    commonProperties["common.product"] = this.initData.environment.appHost;
    switch (this.initData.uiKind) {
      case 2 /* Web */:
        commonProperties["common.uikind"] = "web";
        break;
      case 1 /* Desktop */:
        commonProperties["common.uikind"] = "desktop";
        break;
      default:
        commonProperties["common.uikind"] = "unknown";
    }
    commonProperties["common.remotename"] = cleanRemoteAuthority(this.initData.remote.authority, this.initData);
    if (this.initData.environment.isSessionsWindow) {
      commonProperties["common.isAgentsWindow"] = true;
    }
    return commonProperties;
  }
  $onDidChangeTelemetryLevel(level) {
    this._oldTelemetryEnablement = this.getTelemetryConfiguration();
    this._level = level;
    const telemetryDetails = this.getTelemetryDetails();
    this._telemetryLoggers.forEach((loggers, key) => {
      const newLoggers = loggers.filter((l) => !l.isDisposed);
      if (newLoggers.length === 0) {
        this._telemetryLoggers.delete(key);
      } else {
        this._telemetryLoggers.set(key, newLoggers);
      }
    });
    this._telemetryLoggers.forEach((loggers) => {
      for (const logger of loggers) {
        logger.updateTelemetryEnablements(telemetryDetails.isUsageEnabled, telemetryDetails.isErrorsEnabled);
      }
    });
    if (this._oldTelemetryEnablement !== this.getTelemetryConfiguration()) {
      this._onDidChangeTelemetryEnabled.fire(this.getTelemetryConfiguration());
    }
    this._onDidChangeTelemetryConfiguration.fire(this.getTelemetryDetails());
  }
  onExtensionError(extension, error) {
    const loggers = this._telemetryLoggers.get(extension.value);
    const nonDisposedLoggers = loggers?.filter((l) => !l.isDisposed);
    if (!nonDisposedLoggers) {
      this._telemetryLoggers.delete(extension.value);
      return false;
    }
    let errorEmitted = false;
    for (const logger of nonDisposedLoggers) {
      if (logger.ignoreUnhandledExtHostErrors) {
        continue;
      }
      logger.logError(error);
      errorEmitted = true;
    }
    return errorEmitted;
  }
};

ExtHostTelemetry = __decorateClass([
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, ILoggerService)
], ExtHostTelemetry);

var ExtHostTelemetryLogger = class {
  constructor(sender, options2, _extension, _logger, _inLoggingOnlyMode, _commonProperties, telemetryEnablements) {
    this._extension = _extension;
    this._logger = _logger;
    this._inLoggingOnlyMode = _inLoggingOnlyMode;
    this._commonProperties = _commonProperties;
    this._onDidChangeEnableStates = new Emitter();
    this.ignoreUnhandledExtHostErrors = options2?.ignoreUnhandledErrors ?? false;
    this._ignoreBuiltinCommonProperties = options2?.ignoreBuiltInCommonProperties ?? false;
    this._additionalCommonProperties = options2?.additionalCommonProperties;
    this._sender = sender;
    this._telemetryEnablements = { isUsageEnabled: telemetryEnablements.isUsageEnabled, isErrorsEnabled: telemetryEnablements.isErrorsEnabled };
  }
  static validateSender(sender) {
    if (typeof sender !== "object") {
      throw new TypeError("TelemetrySender argument is invalid");
    }
    if (typeof sender.sendEventData !== "function") {
      throw new TypeError("TelemetrySender.sendEventData must be a function");
    }
    if (typeof sender.sendErrorData !== "function") {
      throw new TypeError("TelemetrySender.sendErrorData must be a function");
    }
    if (typeof sender.flush !== "undefined" && typeof sender.flush !== "function") {
      throw new TypeError("TelemetrySender.flush must be a function or undefined");
    }
  }
  updateTelemetryEnablements(isUsageEnabled, isErrorsEnabled) {
    if (this._apiObject) {
      this._telemetryEnablements = { isUsageEnabled, isErrorsEnabled };
      this._onDidChangeEnableStates.fire(this._apiObject);
    }
  }
  mixInCommonPropsAndCleanData(data2) {
    let updatedData = data2.properties ? data2.properties ?? {} : data2;
    updatedData = cleanData(updatedData, []);
    if (this._additionalCommonProperties) {
      updatedData = mixin(updatedData, this._additionalCommonProperties);
    }
    if (!this._ignoreBuiltinCommonProperties) {
      updatedData = mixin(updatedData, this._commonProperties);
    }
    if (data2.properties) {
      data2.properties = updatedData;
    } else {
      data2 = updatedData;
    }
    return data2;
  }
  logEvent(eventName, data2) {
    if (!this._sender) {
      return;
    }
    if (this._extension.publisher === "vscode") {
      eventName = this._extension.name + "/" + eventName;
    } else {
      eventName = this._extension.identifier.value + "/" + eventName;
    }
    data2 = this.mixInCommonPropsAndCleanData(data2 || {});
    if (!this._inLoggingOnlyMode) {
      this._sender?.sendEventData(eventName, data2);
    }
    this._logger.trace(eventName, data2);
  }
  logUsage(eventName, data2) {
    if (!this._telemetryEnablements.isUsageEnabled) {
      return;
    }
    this.logEvent(eventName, data2);
  }
  logError(eventNameOrException, data2) {
    if (!this._telemetryEnablements.isErrorsEnabled || !this._sender) {
      return;
    }
    if (typeof eventNameOrException === "string") {
      this.logEvent(eventNameOrException, data2);
    } else {
      const errorData = {
        name: eventNameOrException.name,
        message: eventNameOrException.message,
        stack: eventNameOrException.stack,
        cause: eventNameOrException.cause
      };
      const cleanedErrorData = cleanData(errorData, []);
      const cleanedError = new Error(typeof cleanedErrorData.message === "string" ? cleanedErrorData.message : void 0, {
        cause: cleanedErrorData.cause
      });
      cleanedError.stack = typeof cleanedErrorData.stack === "string" ? cleanedErrorData.stack : void 0;
      cleanedError.name = typeof cleanedErrorData.name === "string" ? cleanedErrorData.name : "unknown";
      data2 = this.mixInCommonPropsAndCleanData(data2 || {});
      if (!this._inLoggingOnlyMode) {
        this._sender.sendErrorData(cleanedError, data2);
      }
      this._logger.trace("exception", data2);
    }
  }
  get apiTelemetryLogger() {
    if (!this._apiObject) {
      const that = this;
      const obj = {
        logUsage: that.logUsage.bind(that),
        get isUsageEnabled() {
          return that._telemetryEnablements.isUsageEnabled;
        },
        get isErrorsEnabled() {
          return that._telemetryEnablements.isErrorsEnabled;
        },
        logError: that.logError.bind(that),
        dispose: that.dispose.bind(that),
        onDidChangeEnableStates: that._onDidChangeEnableStates.event.bind(that)
      };
      this._apiObject = Object.freeze(obj);
    }
    return this._apiObject;
  }
  get isDisposed() {
    return !this._sender;
  }
  dispose() {
    if (this._sender?.flush) {
      let tempSender = this._sender;
      this._sender = void 0;
      Promise.resolve(tempSender.flush()).then(tempSender = void 0);
      this._apiObject = void 0;
    } else {
      this._sender = void 0;
    }
    this._onDidChangeEnableStates.dispose();
  }
};

function isNewAppInstall(firstSessionDate) {
  const installAge = Date.now() - new Date(firstSessionDate).getTime();
  return isNaN(installAge) ? false : installAge < 1e3 * 60 * 60 * 24;
}

var IExtHostTelemetry = createDecorator("IExtHostTelemetry");
export { isNewAppInstall, ExtHostTelemetry, ExtHostTelemetryLogger, IExtHostTelemetry };
