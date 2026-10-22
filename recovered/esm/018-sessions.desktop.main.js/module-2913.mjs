// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/logs/common/logs.contribution.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { SetLogLevelAction } from "./module-2912.mjs";
import { Categories } from "./module-0847.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IDefaultLogLevelsService } from "./module-1728.mjs";
import { Disposable } from "./module-0012.mjs";
import { CounterSet } from "./module-0008.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions15, IOutputService, isMultiSourceOutputChannelDescriptor, isSingleSourceOutputChannelDescriptor } from "./module-1245.mjs";
import { CONTEXT_LOG_LEVEL, ILoggerService, LogLevelToString, isLogLevel } from "./module-0095.mjs";
import { Event2 } from "./module-0017.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { Schemas } from "./module-0033.mjs";
import { showWindowLogActionId, windowLogId } from "./module-1501.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/logs/common/logs.contribution.ts
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SetLogLevelAction.ID,
      title: SetLogLevelAction.TITLE,
      category: Categories.Developer,
      f1: true
    });
  }
  run(servicesAccessor) {
    const action = servicesAccessor.get(IInstantiationService).createInstance(SetLogLevelAction, SetLogLevelAction.ID, SetLogLevelAction.TITLE.value);
    return action.run().finally(() => action.dispose());
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.setDefaultLogLevel",
      title: localize2(16586, "Set Default Log Level"),
      category: Categories.Developer
    });
  }
  run(servicesAccessor, logLevel, extensionId) {
    return servicesAccessor.get(IDefaultLogLevelsService).setDefaultLogLevel(logLevel, extensionId);
  }
});

var LogOutputChannels = class extends Disposable {
  constructor(loggerService, contextKeyService, uriIdentityService) {
    super();
    this.loggerService = loggerService;
    this.contextKeyService = contextKeyService;
    this.uriIdentityService = uriIdentityService;
    this.contextKeys = new CounterSet();
    this.outputChannelRegistry = Registry.as(Extensions15.OutputChannels);
    const contextKey = CONTEXT_LOG_LEVEL.bindTo(contextKeyService);
    contextKey.set(LogLevelToString(loggerService.getLogLevel()));
    this._register(loggerService.onDidChangeLogLevel((e4) => {
      if (isLogLevel(e4)) {
        contextKey.set(LogLevelToString(loggerService.getLogLevel()));
      }
    }));
    this.onDidAddLoggers(loggerService.getRegisteredLoggers());
    this._register(loggerService.onDidChangeLoggers(({ added, removed }) => {
      this.onDidAddLoggers(added);
      this.onDidRemoveLoggers(removed);
    }));
    this._register(loggerService.onDidChangeVisibility(([resource, visibility]) => {
      const logger = loggerService.getRegisteredLogger(resource);
      if (logger) {
        if (visibility) {
          this.registerLogChannel(logger);
        } else {
          this.deregisterLogChannel(logger);
        }
      }
    }));
    this.registerShowWindowLogAction();
    this._register(Event2.filter(contextKeyService.onDidChangeContext, (e4) => e4.affectsSome(this.contextKeys))(() => this.onDidChangeContext()));
  }
  onDidAddLoggers(loggers) {
    for (const logger of loggers) {
      if (logger.when) {
        const contextKeyExpr = ContextKeyExpr.deserialize(logger.when);
        if (contextKeyExpr) {
          for (const key3 of contextKeyExpr.keys()) {
            this.contextKeys.add(key3);
          }
          if (!this.contextKeyService.contextMatchesRules(contextKeyExpr)) {
            continue;
          }
        }
      }
      if (logger.hidden) {
        continue;
      }
      this.registerLogChannel(logger);
    }
  }
  onDidChangeContext() {
    for (const logger of this.loggerService.getRegisteredLoggers()) {
      if (logger.when) {
        if (this.contextKeyService.contextMatchesRules(ContextKeyExpr.deserialize(logger.when))) {
          this.registerLogChannel(logger);
        } else {
          this.deregisterLogChannel(logger);
        }
      }
    }
  }
  onDidRemoveLoggers(loggers) {
    for (const logger of loggers) {
      if (logger.when) {
        const contextKeyExpr = ContextKeyExpr.deserialize(logger.when);
        if (contextKeyExpr) {
          for (const key3 of contextKeyExpr.keys()) {
            this.contextKeys.delete(key3);
          }
        }
      }
      this.deregisterLogChannel(logger);
    }
  }
  registerLogChannel(logger) {
    if (logger.group) {
      this.registerCompoundLogChannel(logger.group.id, logger.group.name, logger);
      return;
    }
    const channel = this.outputChannelRegistry.getChannel(logger.id);
    if (channel && isSingleSourceOutputChannelDescriptor(channel) && this.uriIdentityService.extUri.isEqual(channel.source.resource, logger.resource)) {
      return;
    }
    const existingChannel = this.outputChannelRegistry.getChannel(logger.id);
    const remoteLogger = existingChannel && isSingleSourceOutputChannelDescriptor(existingChannel) && existingChannel.source.resource.scheme === Schemas.vscodeRemote ? this.loggerService.getRegisteredLogger(existingChannel.source.resource) : void 0;
    if (remoteLogger) {
      this.deregisterLogChannel(remoteLogger);
    }
    const hasToAppendRemote = existingChannel && logger.resource.scheme === Schemas.vscodeRemote;
    const id2 = hasToAppendRemote ? `${logger.id}.remote` : logger.id;
    const label3 = hasToAppendRemote ? localize(16585, null, logger.name ?? logger.id) : logger.name ?? logger.id;
    this.outputChannelRegistry.registerChannel({ id: id2, label: label3, source: { resource: logger.resource }, log: true, extensionId: logger.extensionId });
  }
  registerCompoundLogChannel(id2, name, logger) {
    const channel = this.outputChannelRegistry.getChannel(id2);
    const source = { resource: logger.resource, name: logger.name ?? logger.id };
    if (channel) {
      if (isMultiSourceOutputChannelDescriptor(channel) && !channel.source.some(({ resource }) => this.uriIdentityService.extUri.isEqual(resource, logger.resource))) {
        this.outputChannelRegistry.updateChannelSources(id2, [...channel.source, source]);
      }
    } else {
      this.outputChannelRegistry.registerChannel({ id: id2, label: name, log: true, source: [source] });
    }
  }
  deregisterLogChannel(logger) {
    if (logger.group) {
      const channel = this.outputChannelRegistry.getChannel(logger.group.id);
      if (channel && isMultiSourceOutputChannelDescriptor(channel)) {
        this.outputChannelRegistry.updateChannelSources(logger.group.id, channel.source.filter(({ resource }) => !this.uriIdentityService.extUri.isEqual(resource, logger.resource)));
      }
    } else {
      this.outputChannelRegistry.removeChannel(logger.id);
    }
  }
  registerShowWindowLogAction() {
    this._register(registerAction2(class ShowWindowLogAction extends Action2 {
      constructor() {
        super({
          id: showWindowLogActionId,
          title: localize2(16587, "Show Window Log"),
          category: Categories.Developer,
          f1: true
        });
      }
      async run(servicesAccessor) {
        const outputService = servicesAccessor.get(IOutputService);
        outputService.showChannel(windowLogId);
      }
    }));
  }
};

LogOutputChannels = __decorateClass([
  __decorateParam(0, ILoggerService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IUriIdentityService)
], LogOutputChannels);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(LogOutputChannels, 3 /* Restored */);
export { LogOutputChannels };
