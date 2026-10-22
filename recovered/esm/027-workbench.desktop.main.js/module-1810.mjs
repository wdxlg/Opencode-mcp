// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/log/common/defaultLogLevels.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { equals4 } from "./module-0098.mjs";
import { ILogService, ILoggerService, LogLevelToString, getLogLevel, parseLogLevel } from "./module-0095.mjs";
import { isString, isUndefined } from "./module-0010.mjs";
import { EXTENSION_IDENTIFIER_WITH_LOG_REGEX } from "./module-0914.mjs";
import { parse5 } from "./module-0883.mjs";
import { IFileService, toFileOperationResult } from "./module-0269.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IJSONEditingService } from "./module-1643.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/log/common/defaultLogLevels.ts
var IDefaultLogLevelsService = createDecorator("IDefaultLogLevelsService");

var DefaultLogLevelsService = class extends Disposable {
  constructor(environmentService, fileService, jsonEditingService, logService, loggerService) {
    super();
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.jsonEditingService = jsonEditingService;
    this.logService = logService;
    this.loggerService = loggerService;
    this._onDidChangeDefaultLogLevels = this._register(new Emitter());
    this.onDidChangeDefaultLogLevels = this._onDidChangeDefaultLogLevels.event;
    this._defaultLogLevels = {
      default: this._getDefaultLogLevelFromEnv(),
      extensions: this._getExtensionsDefaultLogLevelsFromEnv()
    };
    this._register(this.fileService.onDidFilesChange((e) => {
      if (e.contains(this.environmentService.argvResource)) {
        this.onDidChangeArgv();
      }
    }));
  }
  async onDidChangeArgv() {
    const defaultLogLevelsFromArgv = await this._parseLogLevelsFromArgv();
    this.updateDefaultLogLevels(defaultLogLevelsFromArgv);
  }
  get defaultLogLevels() {
    return this._defaultLogLevels;
  }
  updateDefaultLogLevels(defaultLogLevelsFromArgv) {
    const defaultLogLevels = {
      default: defaultLogLevelsFromArgv?.default ?? this._getDefaultLogLevelFromEnv(),
      extensions: defaultLogLevelsFromArgv?.extensions ?? this._getExtensionsDefaultLogLevelsFromEnv()
    };
    if (!equals4(this._defaultLogLevels, defaultLogLevels)) {
      this._defaultLogLevels = defaultLogLevels;
      this._onDidChangeDefaultLogLevels.fire(this._defaultLogLevels);
    }
  }
  getDefaultLogLevel(extensionId) {
    if (extensionId) {
      extensionId = extensionId.toLowerCase();
      return this._getDefaultLogLevel(this._defaultLogLevels, extensionId);
    } else {
      return this._getDefaultLogLevel(this._defaultLogLevels);
    }
  }
  async setDefaultLogLevel(defaultLogLevel, extensionId) {
    const defaultLogLevelsFromArgv = await this._parseLogLevelsFromArgv() ?? {};
    if (extensionId) {
      extensionId = extensionId.toLowerCase();
      const currentDefaultLogLevel = this._getDefaultLogLevel(defaultLogLevelsFromArgv, extensionId);
      defaultLogLevelsFromArgv.extensions = defaultLogLevelsFromArgv.extensions ?? [];
      const extension = defaultLogLevelsFromArgv.extensions.find(([extension2]) => extension2 === extensionId);
      if (extension) {
        extension[1] = defaultLogLevel;
      } else {
        defaultLogLevelsFromArgv.extensions.push([extensionId, defaultLogLevel]);
      }
      await this._writeLogLevelsToArgv(defaultLogLevelsFromArgv);
      const extensionLoggers = [...this.loggerService.getRegisteredLoggers()].filter((logger) => logger.extensionId && logger.extensionId.toLowerCase() === extensionId);
      for (const { resource } of extensionLoggers) {
        if (this.loggerService.getLogLevel(resource) === currentDefaultLogLevel) {
          this.loggerService.setLogLevel(resource, defaultLogLevel);
        }
      }
    } else {
      const currentLogLevel = this._getDefaultLogLevel(defaultLogLevelsFromArgv);
      defaultLogLevelsFromArgv.default = defaultLogLevel;
      await this._writeLogLevelsToArgv(defaultLogLevelsFromArgv);
      if (this.loggerService.getLogLevel() === currentLogLevel) {
        this.loggerService.setLogLevel(defaultLogLevel);
      }
    }
    this.updateDefaultLogLevels(defaultLogLevelsFromArgv);
  }
  _getDefaultLogLevel(argvLogLevels, extension) {
    if (extension) {
      const extensionLogLevel = argvLogLevels.extensions?.find(([extensionId]) => extensionId === extension);
      if (extensionLogLevel) {
        return extensionLogLevel[1];
      }
    }
    return argvLogLevels.default ?? getLogLevel(this.environmentService);
  }
  async _writeLogLevelsToArgv(logLevels) {
    const logLevelsValue = [];
    if (!isUndefined(logLevels.default)) {
      logLevelsValue.push(LogLevelToString(logLevels.default));
    }
    for (const [extension, logLevel] of logLevels.extensions ?? []) {
      logLevelsValue.push(`${extension}=${LogLevelToString(logLevel)}`);
    }
    await this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ["log-level"], value: logLevelsValue.length ? logLevelsValue : void 0 }], true);
  }
  async _parseLogLevelsFromArgv() {
    const result = { extensions: [] };
    const logLevels = await this._readLogLevelsFromArgv();
    for (const extensionLogLevel of logLevels) {
      const matches2 = EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(extensionLogLevel);
      if (matches2 && matches2[1] && matches2[2]) {
        const logLevel = parseLogLevel(matches2[2]);
        if (!isUndefined(logLevel)) {
          result.extensions?.push([matches2[1].toLowerCase(), logLevel]);
        }
      } else {
        const logLevel = parseLogLevel(extensionLogLevel);
        if (!isUndefined(logLevel)) {
          result.default = logLevel;
        }
      }
    }
    return !isUndefined(result.default) || result.extensions?.length ? result : void 0;
  }
  async _readLogLevelsFromArgv() {
    try {
      const content2 = await this.fileService.readFile(this.environmentService.argvResource);
      const argv = parse5(content2.value.toString());
      return isString(argv["log-level"]) ? [argv["log-level"]] : Array.isArray(argv["log-level"]) ? argv["log-level"] : [];
    } catch (error) {
      if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
        this.logService.error(error);
      }
    }
    return [];
  }
  _getDefaultLogLevelFromEnv() {
    return getLogLevel(this.environmentService);
  }
  _getExtensionsDefaultLogLevelsFromEnv() {
    const result = [];
    for (const [extension, logLevelValue] of this.environmentService.extensionLogLevel ?? []) {
      const logLevel = parseLogLevel(logLevelValue);
      if (!isUndefined(logLevel)) {
        result.push([extension, logLevel]);
      }
    }
    return result;
  }
};

DefaultLogLevelsService = __decorateClass([
  __decorateParam(0, IWorkbenchEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IJSONEditingService),
  __decorateParam(3, ILogService),
  __decorateParam(4, ILoggerService)
], DefaultLogLevelsService);

registerSingleton(IDefaultLogLevelsService, DefaultLogLevelsService, 1 /* Delayed */);
export { IDefaultLogLevelsService, DefaultLogLevelsService };
