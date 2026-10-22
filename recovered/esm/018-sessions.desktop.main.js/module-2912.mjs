// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/logs/common/logsActions.ts
import { Action } from "./module-0082.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ILoggerService, LogLevelToLocalizedString, isLogLevel } from "./module-0095.mjs";
import { IOutputService, isMultiSourceOutputChannelDescriptor, isSingleSourceOutputChannelDescriptor } from "./module-1245.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IDefaultLogLevelsService } from "./module-1728.mjs";
import { basename2, dirname2, isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/workbench/contrib/logs/common/logsActions.ts
var SetLogLevelAction = class extends Action {
  constructor(id2, label3, quickInputService, loggerService, outputService, defaultLogLevelsService) {
    super(id2, label3);
    this.quickInputService = quickInputService;
    this.loggerService = loggerService;
    this.outputService = outputService;
    this.defaultLogLevelsService = defaultLogLevelsService;
  }
  static {
    this.ID = "workbench.action.setLogLevel";
  }
  static {
    this.TITLE = localize2(16600, "Set Log Level...");
  }
  async run() {
    const logLevelOrChannel = await this.selectLogLevelOrChannel();
    if (logLevelOrChannel !== null) {
      if (isLogLevel(logLevelOrChannel)) {
        this.loggerService.setLogLevel(logLevelOrChannel);
      } else {
        await this.setLogLevelForChannel(logLevelOrChannel);
      }
    }
  }
  async selectLogLevelOrChannel() {
    const defaultLogLevels = this.defaultLogLevelsService.defaultLogLevels;
    const extensionLogs = [], logs = [];
    const logLevel = this.loggerService.getLogLevel();
    for (const channel of this.outputService.getChannelDescriptors()) {
      if (!this.outputService.canSetLogLevel(channel)) {
        continue;
      }
      const sources = isSingleSourceOutputChannelDescriptor(channel) ? [channel.source] : isMultiSourceOutputChannelDescriptor(channel) ? channel.source : [];
      if (!sources.length) {
        continue;
      }
      const channelLogLevel = sources.reduce((prev, curr) => Math.min(prev, this.loggerService.getLogLevel(curr.resource) ?? logLevel), logLevel);
      const item = {
        id: channel.id,
        label: channel.label,
        description: channelLogLevel !== logLevel ? this.getLabel(channelLogLevel) : void 0,
        channel
      };
      if (channel.extensionId) {
        extensionLogs.push(item);
      } else {
        logs.push(item);
      }
    }
    const entries2 = [];
    entries2.push({ type: "separator", label: localize(16588, null) });
    entries2.push(...this.getLogLevelEntries(defaultLogLevels.default, this.loggerService.getLogLevel(), true));
    if (extensionLogs.length) {
      entries2.push({ type: "separator", label: localize(16591, null) });
      entries2.push(...extensionLogs.sort((a, b) => a.label.localeCompare(b.label)));
    }
    entries2.push({ type: "separator", label: localize(16593, null) });
    entries2.push(...logs.sort((a, b) => a.label.localeCompare(b.label)));
    return new Promise((resolve3, reject) => {
      const disposables = new DisposableStore();
      const quickPick = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
      quickPick.placeholder = localize(16596, null);
      quickPick.items = entries2;
      let selectedItem;
      disposables.add(quickPick.onDidTriggerItemButton((e4) => {
        quickPick.hide();
        this.defaultLogLevelsService.setDefaultLogLevel(e4.item.level);
      }));
      disposables.add(quickPick.onDidAccept((e4) => {
        selectedItem = quickPick.selectedItems[0];
        quickPick.hide();
      }));
      disposables.add(quickPick.onDidHide(() => {
        const result = selectedItem ? selectedItem.level ?? selectedItem : null;
        disposables.dispose();
        resolve3(result);
      }));
      quickPick.show();
    });
  }
  async setLogLevelForChannel(logChannel) {
    const defaultLogLevels = this.defaultLogLevelsService.defaultLogLevels;
    const defaultLogLevel = defaultLogLevels.extensions.find((e4) => e4[0] === logChannel.channel.extensionId?.toLowerCase())?.[1] ?? defaultLogLevels.default;
    const entries2 = this.getLogLevelEntries(defaultLogLevel, this.outputService.getLogLevel(logChannel.channel) ?? defaultLogLevel, !!logChannel.channel.extensionId);
    return new Promise((resolve3, reject) => {
      const disposables = new DisposableStore();
      const quickPick = disposables.add(this.quickInputService.createQuickPick());
      quickPick.placeholder = logChannel ? localize(16598, null, logChannel?.label) : localize(16597, null);
      quickPick.items = entries2;
      quickPick.activeItems = entries2.filter((entry) => entry.level === this.loggerService.getLogLevel());
      let selectedItem;
      disposables.add(quickPick.onDidTriggerItemButton((e4) => {
        quickPick.hide();
        this.defaultLogLevelsService.setDefaultLogLevel(e4.item.level, logChannel.channel.extensionId);
      }));
      disposables.add(quickPick.onDidAccept((e4) => {
        selectedItem = quickPick.selectedItems[0];
        quickPick.hide();
      }));
      disposables.add(quickPick.onDidHide(() => {
        if (selectedItem) {
          this.outputService.setLogLevel(logChannel.channel, selectedItem.level);
        }
        disposables.dispose();
        resolve3();
      }));
      quickPick.show();
    });
  }
  getLogLevelEntries(defaultLogLevel, currentLogLevel, canSetDefaultLogLevel) {
    const button = canSetDefaultLogLevel ? { iconClass: ThemeIcon.asClassName(Codicon.checkAll), tooltip: localize(16595, null) } : void 0;
    return [
      { label: this.getLabel(1 /* Trace */, currentLogLevel), level: 1 /* Trace */, description: this.getDescription(1 /* Trace */, defaultLogLevel), buttons: button && defaultLogLevel !== 1 /* Trace */ ? [button] : void 0 },
      { label: this.getLabel(2 /* Debug */, currentLogLevel), level: 2 /* Debug */, description: this.getDescription(2 /* Debug */, defaultLogLevel), buttons: button && defaultLogLevel !== 2 /* Debug */ ? [button] : void 0 },
      { label: this.getLabel(3 /* Info */, currentLogLevel), level: 3 /* Info */, description: this.getDescription(3 /* Info */, defaultLogLevel), buttons: button && defaultLogLevel !== 3 /* Info */ ? [button] : void 0 },
      { label: this.getLabel(4 /* Warning */, currentLogLevel), level: 4 /* Warning */, description: this.getDescription(4 /* Warning */, defaultLogLevel), buttons: button && defaultLogLevel !== 4 /* Warning */ ? [button] : void 0 },
      { label: this.getLabel(5 /* Error */, currentLogLevel), level: 5 /* Error */, description: this.getDescription(5 /* Error */, defaultLogLevel), buttons: button && defaultLogLevel !== 5 /* Error */ ? [button] : void 0 },
      { label: this.getLabel(0 /* Off */, currentLogLevel), level: 0 /* Off */, description: this.getDescription(0 /* Off */, defaultLogLevel), buttons: button && defaultLogLevel !== 0 /* Off */ ? [button] : void 0 }
    ];
  }
  getLabel(level, current) {
    const label3 = LogLevelToLocalizedString(level).value;
    return level === current ? `$(check) ${label3}` : label3;
  }
  getDescription(level, defaultLogLevel) {
    return defaultLogLevel === level ? localize(16590, null) : void 0;
  }
};

SetLogLevelAction = __decorateClass([
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, ILoggerService),
  __decorateParam(4, IOutputService),
  __decorateParam(5, IDefaultLogLevelsService)
], SetLogLevelAction);

var OpenWindowSessionLogFileAction = class extends Action {
  constructor(id2, label3, environmentService, fileService, quickInputService, editorService) {
    super(id2, label3);
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.quickInputService = quickInputService;
    this.editorService = editorService;
  }
  static {
    this.ID = "workbench.action.openSessionLogFile";
  }
  static {
    this.TITLE = localize2(16594, "Open Window Log File (Session)...");
  }
  async run() {
    const sessionResult = await this.quickInputService.pick(
      this.getSessions().then((sessions) => sessions.map((s, index2) => ({
        id: s.toString(),
        label: basename2(s),
        description: index2 === 0 ? localize(16589, null) : void 0
      }))),
      {
        canPickMany: false,
        placeHolder: localize(16599, null)
      }
    );
    if (sessionResult) {
      const logFileResult = await this.quickInputService.pick(
        this.getLogFiles(URI.parse(sessionResult.id)).then((logFiles) => logFiles.map((s) => ({
          id: s.toString(),
          label: basename2(s)
        }))),
        {
          canPickMany: false,
          placeHolder: localize(16592, null)
        }
      );
      if (logFileResult) {
        return this.editorService.openEditor({ resource: URI.parse(logFileResult.id), options: { pinned: true } }).then(() => void 0);
      }
    }
  }
  async getSessions() {
    const logsPath = this.environmentService.logsHome.with({ scheme: this.environmentService.logFile.scheme });
    const result = [logsPath];
    const stat = await this.fileService.resolve(dirname2(logsPath));
    if (stat.children) {
      result.push(...stat.children.filter((stat2) => !isEqual2(stat2.resource, logsPath) && stat2.isDirectory && /^\d{8}T\d{6}$/.test(stat2.name)).sort().reverse().map((d) => d.resource));
    }
    return result;
  }
  async getLogFiles(session) {
    const stat = await this.fileService.resolve(session);
    if (stat.children) {
      return stat.children.filter((stat2) => !stat2.isDirectory).map((stat2) => stat2.resource);
    }
    return [];
  }
};

OpenWindowSessionLogFileAction = __decorateClass([
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, IEditorService)
], OpenWindowSessionLogFileAction);
export { SetLogLevelAction, OpenWindowSessionLogFileAction };
