// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostOutput.ts
import { AbstractMessageLogger, ILogService, ILoggerService, log } from "./module-0045.mjs";
import { DisposableStore, toDisposable } from "./module-0011.mjs";
import { VSBuffer } from "./module-0013.mjs";
import { ResourceMap } from "./module-0006.mjs";
import { MainContext } from "./module-0025.mjs";
import { toLocalISOString } from "./module-0271.mjs";
import { isString } from "./module-0009.mjs";
import { ExtensionIdentifier } from "./module-0040.mjs";
import { toFileSystemProviderErrorCode } from "./module-0057.mjs";
import { Emitter } from "./module-0019.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";
import { IExtHostConsumerFileSystem } from "./module-0252.mjs";
import { IExtHostFileSystemInfo } from "./module-0061.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/api/common/extHostOutput.ts
var ExtHostOutputChannel = class extends AbstractMessageLogger {
  constructor(id2, name2, logger, proxy, extension) {
    super();
    this.id = id2;
    this.name = name2;
    this.logger = logger;
    this.proxy = proxy;
    this.extension = extension;
    this.offset = 0;
    this.visible = false;
    this.setLevel(logger.getLevel());
    this._register(logger.onDidChangeLogLevel((level) => this.setLevel(level)));
    this._register(toDisposable(() => this.proxy.$dispose(this.id)));
  }
  get logLevel() {
    return this.getLevel();
  }
  appendLine(value) {
    this.append(value + "\n");
  }
  append(value) {
    this.info(value);
  }
  clear() {
    const till = this.offset;
    this.logger.flush();
    this.proxy.$update(this.id, 3 /* Clear */, till);
  }
  replace(value) {
    const till = this.offset;
    this.info(value);
    this.proxy.$update(this.id, 2 /* Replace */, till);
    if (this.visible) {
      this.logger.flush();
    }
  }
  show(columnOrPreserveFocus, preserveFocus) {
    this.logger.flush();
    this.proxy.$reveal(this.id, !!(typeof columnOrPreserveFocus === "boolean" ? columnOrPreserveFocus : preserveFocus));
  }
  hide() {
    this.proxy.$close(this.id);
  }
  log(level, message) {
    this.offset += VSBuffer.fromString(message).byteLength;
    log(this.logger, level, message);
    if (this.visible) {
      this.logger.flush();
      this.proxy.$update(this.id, 1 /* Append */);
    }
  }
};

var ExtHostLogOutputChannel = class extends ExtHostOutputChannel {
  appendLine(value) {
    this.append(value);
  }
};

var ExtHostOutputService = class {
  constructor(extHostRpc, initData, extHostFileSystem, extHostFileSystemInfo, loggerService, logService) {
    this.initData = initData;
    this.extHostFileSystem = extHostFileSystem;
    this.extHostFileSystemInfo = extHostFileSystemInfo;
    this.loggerService = loggerService;
    this.logService = logService;
    this.extensionLogDirectoryCreationPromise = new ResourceMap();
    this.logOutputChannels = new ResourceMap();
    this.namePool = 1;
    this.channels = /* @__PURE__ */ new Map();
    this.visibleChannelId = null;
    this.proxy = extHostRpc.getProxy(MainContext.MainThreadOutputService);
    this.outputsLocation = this.extHostFileSystemInfo.extUri.joinPath(initData.logsLocation, `output_logging_${toLocalISOString(/* @__PURE__ */ new Date()).replace(/-|:|\.\d+Z$/g, "")}`);
  }
  $setVisibleChannel(visibleChannelId) {
    this.visibleChannelId = visibleChannelId;
    for (const [id2, channel] of this.channels) {
      channel.visible = id2 === this.visibleChannelId;
    }
  }
  createOutputChannel(name2, options2, extension) {
    name2 = name2.trim();
    if (!name2) {
      throw new Error("illegal argument `name`. must not be falsy");
    }
    const log2 = typeof options2 === "object" && options2.log;
    const languageId = isString(options2) ? options2 : void 0;
    if (isString(languageId) && !languageId.trim()) {
      throw new Error("illegal argument `languageId`. must not be empty");
    }
    const channelDisposables = new DisposableStore();
    let extHostOutputChannelPromise;
    let logLevel = this.initData.environment.extensionLogLevel?.find(([identifier]) => ExtensionIdentifier.equals(extension.identifier, identifier))?.[1];
    let logFile;
    if (log2) {
      const extensionLogDirectory = this.extHostFileSystemInfo.extUri.joinPath(this.initData.logsLocation, extension.identifier.value);
      logFile = this.extHostFileSystemInfo.extUri.joinPath(extensionLogDirectory, `${name2.replace(/[\\/:\*\?"<>\|]/g, "")}.log`);
      const existingOutputChannel = this.logOutputChannels.get(logFile);
      if (existingOutputChannel) {
        return existingOutputChannel;
      }
      const registeredLogger = this.loggerService.getRegisteredLogger(logFile);
      if (registeredLogger?.logLevel !== void 0) {
        logLevel = registeredLogger.logLevel;
      }
      extHostOutputChannelPromise = this.doCreateLogOutputChannel(name2, logFile, logLevel, extension, channelDisposables);
    } else {
      extHostOutputChannelPromise = this.doCreateOutputChannel(name2, languageId, extension, channelDisposables);
    }
    extHostOutputChannelPromise.then((channel) => {
      this.channels.set(channel.id, channel);
      channel.visible = channel.id === this.visibleChannelId;
      channelDisposables.add(toDisposable(() => {
        this.channels.delete(channel.id);
        if (logFile) {
          this.logOutputChannels.delete(logFile);
        }
      }));
    });
    if (logFile) {
      const logOutputChannel = this.createExtHostLogOutputChannel(name2, logLevel ?? this.logService.getLevel(), extHostOutputChannelPromise, channelDisposables);
      this.logOutputChannels.set(logFile, logOutputChannel);
      return logOutputChannel;
    }
    return this.createExtHostOutputChannel(name2, extHostOutputChannelPromise, channelDisposables);
  }
  async doCreateOutputChannel(name2, languageId, extension, channelDisposables) {
    if (!this.outputDirectoryPromise) {
      this.outputDirectoryPromise = this.extHostFileSystem.value.createDirectory(this.outputsLocation).then(() => this.outputsLocation);
    }
    const outputDir = await this.outputDirectoryPromise;
    const file = this.extHostFileSystemInfo.extUri.joinPath(outputDir, `${this.namePool++}-${name2.replace(/[\\/:\*\?"<>\|]/g, "")}.log`);
    const logger = channelDisposables.add(this.loggerService.createLogger(file, { logLevel: "always", donotRotate: true, donotUseFormatters: true, hidden: true }));
    const id2 = await this.proxy.$register(name2, file, languageId, extension.identifier.value);
    channelDisposables.add(toDisposable(() => this.loggerService.deregisterLogger(file)));
    return new ExtHostOutputChannel(id2, name2, logger, this.proxy, extension);
  }
  async doCreateLogOutputChannel(name2, file, logLevel, extension, channelDisposables) {
    await this.createExtensionLogDirectory(file);
    const id2 = `${extension.identifier.value}.${this.extHostFileSystemInfo.extUri.basename(file)}`;
    const logger = channelDisposables.add(this.loggerService.createLogger(file, { id: id2, name: name2, logLevel, extensionId: extension.identifier.value }));
    channelDisposables.add(toDisposable(() => this.loggerService.deregisterLogger(file)));
    return new ExtHostLogOutputChannel(id2, name2, logger, this.proxy, extension);
  }
  createExtensionLogDirectory(file) {
    const extensionLogDirectory = this.extHostFileSystemInfo.extUri.dirname(file);
    let extensionLogDirectoryPromise = this.extensionLogDirectoryCreationPromise.get(extensionLogDirectory);
    if (!extensionLogDirectoryPromise) {
      this.extensionLogDirectoryCreationPromise.set(extensionLogDirectory, extensionLogDirectoryPromise = (async () => {
        try {
          await this.extHostFileSystem.value.createDirectory(extensionLogDirectory);
        } catch (err) {
          if (toFileSystemProviderErrorCode(err) !== "EntryExists" /* FileExists */) {
            throw err;
          }
        }
      })());
    }
    return extensionLogDirectoryPromise;
  }
  createExtHostOutputChannel(name2, channelPromise, channelDisposables) {
    const validate = () => {
      if (channelDisposables.isDisposed) {
        throw new Error("Channel has been closed");
      }
    };
    channelPromise.then((channel) => channelDisposables.add(channel));
    return {
      get name() {
        return name2;
      },
      append(value) {
        validate();
        channelPromise.then((channel) => channel.append(value));
      },
      appendLine(value) {
        validate();
        channelPromise.then((channel) => channel.appendLine(value));
      },
      clear() {
        validate();
        channelPromise.then((channel) => channel.clear());
      },
      replace(value) {
        validate();
        channelPromise.then((channel) => channel.replace(value));
      },
      show(columnOrPreserveFocus, preserveFocus) {
        validate();
        channelPromise.then((channel) => channel.show(columnOrPreserveFocus, preserveFocus));
      },
      hide() {
        validate();
        channelPromise.then((channel) => channel.hide());
      },
      dispose() {
        channelDisposables.dispose();
      }
    };
  }
  createExtHostLogOutputChannel(name2, logLevel, channelPromise, channelDisposables) {
    const validate = () => {
      if (channelDisposables.isDisposed) {
        throw new Error("Channel has been closed");
      }
    };
    const onDidChangeLogLevel = channelDisposables.add(new Emitter());
    function setLogLevel(newLogLevel) {
      logLevel = newLogLevel;
      onDidChangeLogLevel.fire(newLogLevel);
    }
    channelPromise.then((channel) => {
      if (channel.logLevel !== logLevel) {
        setLogLevel(channel.logLevel);
      }
      channelDisposables.add(channel.onDidChangeLogLevel((e) => setLogLevel(e)));
    });
    return {
      ...this.createExtHostOutputChannel(name2, channelPromise, channelDisposables),
      get logLevel() {
        return logLevel;
      },
      onDidChangeLogLevel: onDidChangeLogLevel.event,
      trace(value, ...args) {
        validate();
        channelPromise.then((channel) => channel.trace(value, ...args));
      },
      debug(value, ...args) {
        validate();
        channelPromise.then((channel) => channel.debug(value, ...args));
      },
      info(value, ...args) {
        validate();
        channelPromise.then((channel) => channel.info(value, ...args));
      },
      warn(value, ...args) {
        validate();
        channelPromise.then((channel) => channel.warn(value, ...args));
      },
      error(value, ...args) {
        validate();
        channelPromise.then((channel) => channel.error(value, ...args));
      }
    };
  }
};

ExtHostOutputService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, IExtHostConsumerFileSystem),
  __decorateParam(3, IExtHostFileSystemInfo),
  __decorateParam(4, ILoggerService),
  __decorateParam(5, ILogService)
], ExtHostOutputService);

var IExtHostOutputService = createDecorator("IExtHostOutputService");
export { ExtHostOutputChannel, ExtHostLogOutputChannel, ExtHostOutputService, IExtHostOutputService };
