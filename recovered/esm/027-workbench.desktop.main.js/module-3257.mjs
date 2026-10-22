// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/output/browser/output.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ACTIVE_OUTPUT_CHANNEL_CONTEXT, CONTEXT_ACTIVE_LOG_FILE_OUTPUT, CONTEXT_ACTIVE_OUTPUT_LEVEL, CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT, CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE, CONTEXT_IN_OUTPUT, CONTEXT_OUTPUT_SCROLL_LOCK, Extensions15, IOutputService, LOG_MIME, LOG_MODE_ID, OUTPUT_FILTER_FOCUS_CONTEXT, OUTPUT_MIME, OUTPUT_MODE_ID, OUTPUT_VIEW_ID, SHOW_DEBUG_FILTER_CONTEXT, SHOW_ERROR_FILTER_CONTEXT, SHOW_INFO_FILTER_CONTEXT, SHOW_TRACE_FILTER_CONTEXT, SHOW_WARNING_FILTER_CONTEXT, isSingleSourceOutputChannelDescriptor } from "./module-1245.mjs";
import { OutputService } from "./module-3254.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { OutputAccessibilityHelp } from "./module-3256.mjs";
import { ModesRegistry } from "./module-0141.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { OutputViewPane } from "./module-3255.mjs";
import { KeyChord } from "./module-0019.mjs";
import { Disposable, dispose, toDisposable } from "./module-0012.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { INotificationService } from "./module-0336.mjs";
import { Categories } from "./module-0847.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { IViewsService } from "./module-1246.mjs";
import { AUX_WINDOW_GROUP, IEditorService } from "./module-0934.mjs";
import { ILoggerService, LogLevelToLocalizedString, LogLevelToString } from "./module-0095.mjs";
import { IDefaultLogLevelsService } from "./module-1810.mjs";
import { ViewAction } from "./module-1335.mjs";
import { viewFilterSubmenu } from "./module-1333.mjs";
import { hasKey } from "./module-0010.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { basename2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { IsWindowsContext } from "./module-0635.mjs";
import { FocusedViewContext } from "./module-0949.mjs";


// src/vs/workbench/contrib/output/browser/output.contribution.ts
var IMPORTED_LOG_ID_PREFIX = "importedLog.";

registerSingleton(IOutputService, OutputService, 1 /* Delayed */);

AccessibleViewRegistry.register(new OutputAccessibilityHelp());

ModesRegistry.registerLanguage({
  id: OUTPUT_MODE_ID,
  extensions: [],
  mimetypes: [OUTPUT_MIME]
});

ModesRegistry.registerLanguage({
  id: LOG_MODE_ID,
  extensions: [],
  mimetypes: [LOG_MIME]
});

var outputViewIcon = registerIcon("output-view-icon", Codicon.output, localize(17996, null));

var VIEW_CONTAINER5 = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: OUTPUT_VIEW_ID,
  title: localize2(17991, "Output"),
  icon: outputViewIcon,
  order: 1,
  ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [OUTPUT_VIEW_ID, { mergeViewWithContainerWhenSingleView: true }]),
  storageId: OUTPUT_VIEW_ID,
  hideIfEmpty: true,
  windowEnablement: 3 /* Both */
}, 1 /* Panel */, { doNotRegisterOpenCommand: true });

Registry.as(Extensions13.ViewsRegistry).registerViews([{
  id: OUTPUT_VIEW_ID,
  name: localize2(17991, "Output"),
  containerIcon: outputViewIcon,
  canMoveView: true,
  canToggleVisibility: true,
  ctorDescriptor: new SyncDescriptor(OutputViewPane),
  openCommandActionDescriptor: {
    id: "workbench.action.output.toggleOutput",
    mnemonicTitle: localize(17986, null),
    keybindings: {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 51 /* KeyU */,
      linux: {
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 38 /* KeyH */)
        // On Ubuntu Ctrl+Shift+U is taken by some global OS command
      }
    },
    order: 1
  },
  windowEnablement: 3 /* Both */
}], VIEW_CONTAINER5);

var OutputContribution = class extends Disposable {
  constructor(outputService, editorService) {
    super();
    this.outputService = outputService;
    this.editorService = editorService;
    this.registerActions();
  }
  registerActions() {
    this.registerSwitchOutputAction();
    this.registerAddCompoundLogAction();
    this.registerRemoveLogAction();
    this.registerShowOutputChannelsAction();
    this.registerClearOutputAction();
    this.registerToggleAutoScrollAction();
    this.registerOpenActiveOutputFileAction();
    this.registerOpenActiveOutputFileInAuxWindowAction();
    this.registerSaveActiveOutputAsAction();
    this.registerShowLogsAction();
    this.registerOpenLogFileAction();
    this.registerConfigureActiveOutputLogLevelAction();
    this.registerLogLevelFilterActions();
    this.registerClearFilterActions();
    this.registerExportLogsAction();
    this.registerImportLogAction();
  }
  registerSwitchOutputAction() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.output.action.switchBetweenOutputs`,
          title: localize(18004, null)
        });
      }
      async run(accessor, channelId) {
        if (channelId) {
          accessor.get(IOutputService).showChannel(channelId, true);
        }
      }
    }));
    const switchOutputMenu = new MenuId("workbench.output.menu.switchOutput");
    this._register(MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
      submenu: switchOutputMenu,
      title: localize(18005, null),
      group: "navigation",
      when: ContextKeyExpr.equals("view", OUTPUT_VIEW_ID),
      order: 1,
      isSelection: true
    }));
    const registeredChannels = /* @__PURE__ */ new Map();
    this._register(toDisposable(() => dispose(registeredChannels.values())));
    const registerOutputChannels = (channels) => {
      for (const channel of channels) {
        const title = channel.label;
        const group2 = channel.user ? "2_user_outputchannels" : channel.extensionId ? "0_ext_outputchannels" : "1_core_outputchannels";
        registeredChannels.set(channel.id, registerAction2(class extends Action2 {
          constructor() {
            super({
              id: `workbench.action.output.show.${channel.id}`,
              title,
              toggled: ACTIVE_OUTPUT_CHANNEL_CONTEXT.isEqualTo(channel.id),
              menu: {
                id: switchOutputMenu,
                group: group2
              }
            });
          }
          async run(accessor) {
            return accessor.get(IOutputService).showChannel(channel.id, true);
          }
        }));
      }
    };
    registerOutputChannels(this.outputService.getChannelDescriptors());
    const outputChannelRegistry2 = Registry.as(Extensions15.OutputChannels);
    this._register(outputChannelRegistry2.onDidRegisterChannel((e) => {
      const channel = this.outputService.getChannelDescriptor(e);
      if (channel) {
        registerOutputChannels([channel]);
      }
    }));
    this._register(outputChannelRegistry2.onDidRemoveChannel((e) => {
      registeredChannels.get(e.id)?.dispose();
      registeredChannels.delete(e.id);
    }));
  }
  registerAddCompoundLogAction() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.output.addCompoundLog",
          title: localize2(17975, "Add Compound Log..."),
          category: localize2(17991, "Output"),
          f1: true,
          menu: [{
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", OUTPUT_VIEW_ID),
            group: "2_add"
          }]
        });
      }
      async run(accessor) {
        const outputService = accessor.get(IOutputService);
        const quickInputService = accessor.get(IQuickInputService);
        const extensionLogs = [], logs = [];
        for (const channel of outputService.getChannelDescriptors()) {
          if (channel.log && !channel.user) {
            if (channel.extensionId) {
              extensionLogs.push(channel);
            } else {
              logs.push(channel);
            }
          }
        }
        const entries2 = [];
        for (const log4 of logs.sort((a, b) => a.label.localeCompare(b.label))) {
          entries2.push(log4);
        }
        if (extensionLogs.length && logs.length) {
          entries2.push({ type: "separator", label: localize(17979, null) });
        }
        for (const log4 of extensionLogs.sort((a, b) => a.label.localeCompare(b.label))) {
          entries2.push(log4);
        }
        const result = await quickInputService.pick(entries2, { placeHolder: localize(17999, null), canPickMany: true });
        if (result?.length) {
          outputService.showChannel(outputService.registerCompoundLogChannel(result));
        }
      }
    }));
  }
  registerRemoveLogAction() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.output.remove",
          title: localize2(17997, "Remove Output..."),
          category: localize2(17991, "Output"),
          f1: true
        });
      }
      async run(accessor) {
        const outputService = accessor.get(IOutputService);
        const quickInputService = accessor.get(IQuickInputService);
        const notificationService = accessor.get(INotificationService);
        const entries2 = outputService.getChannelDescriptors().filter((channel) => channel.user);
        if (entries2.length === 0) {
          notificationService.info(localize(17987, null));
          return;
        }
        const result = await quickInputService.pick(entries2, { placeHolder: localize(17999, null), canPickMany: true });
        if (!result?.length) {
          return;
        }
        const outputChannelRegistry2 = Registry.as(Extensions15.OutputChannels);
        for (const channel of result) {
          outputChannelRegistry2.removeChannel(channel.id);
        }
      }
    }));
  }
  registerShowOutputChannelsAction() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.showOutputChannels",
          title: localize2(18003, "Show Output Channels..."),
          category: localize2(17991, "Output"),
          f1: true
        });
      }
      async run(accessor) {
        const outputService = accessor.get(IOutputService);
        const quickInputService = accessor.get(IQuickInputService);
        const extensionChannels = [], coreChannels = [];
        for (const channel of outputService.getChannelDescriptors()) {
          if (channel.extensionId) {
            extensionChannels.push(channel);
          } else {
            coreChannels.push(channel);
          }
        }
        const entries2 = [];
        for (const { id: id2, label: label3 } of extensionChannels) {
          entries2.push({ id: id2, label: label3 });
        }
        if (extensionChannels.length && coreChannels.length) {
          entries2.push({ type: "separator" });
        }
        for (const { id: id2, label: label3 } of coreChannels) {
          entries2.push({ id: id2, label: label3 });
        }
        const entry = await quickInputService.pick(entries2, { placeHolder: localize(18001, null) });
        if (entry) {
          return outputService.showChannel(entry.id);
        }
      }
    }));
  }
  registerClearOutputAction() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.output.action.clearOutput`,
          title: localize2(17977, "Clear Output"),
          category: Categories.View,
          menu: [{
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", OUTPUT_VIEW_ID),
            group: "navigation",
            order: 2
          }, {
            id: MenuId.CommandPalette
          }, {
            id: MenuId.EditorContext,
            when: CONTEXT_IN_OUTPUT
          }],
          icon: Codicon.clearAll
        });
      }
      async run(accessor) {
        const outputService = accessor.get(IOutputService);
        const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
        const activeChannel = outputService.getActiveChannel();
        if (activeChannel) {
          activeChannel.clear();
          accessibilitySignalService.playSignal(AccessibilitySignal.clear);
        }
      }
    }));
  }
  registerToggleAutoScrollAction() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.output.action.toggleAutoScroll`,
          title: localize2(18006, "Toggle Auto Scrolling"),
          tooltip: localize(17994, null),
          menu: {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", OUTPUT_VIEW_ID)),
            group: "navigation",
            order: 3
          },
          icon: Codicon.lock,
          toggled: {
            condition: CONTEXT_OUTPUT_SCROLL_LOCK,
            icon: Codicon.unlock,
            tooltip: localize(17995, null)
          }
        });
      }
      async run(accessor) {
        const outputView = accessor.get(IViewsService).getActiveViewWithId(OUTPUT_VIEW_ID);
        outputView.scrollLock = !outputView.scrollLock;
      }
    }));
  }
  registerOpenActiveOutputFileAction() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.action.openActiveLogOutputFile`,
          title: localize2(17988, "Open Output in Editor"),
          menu: [{
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", OUTPUT_VIEW_ID),
            group: "navigation",
            order: 4,
            isHiddenByDefault: true
          }],
          icon: Codicon.goToFile
        });
      }
      async run() {
        that.openActiveOutput();
      }
    }));
  }
  registerOpenActiveOutputFileInAuxWindowAction() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.action.openActiveLogOutputFileInNewWindow`,
          title: localize2(17989, "Open Output in New Window"),
          menu: [{
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", OUTPUT_VIEW_ID),
            group: "navigation",
            order: 5,
            isHiddenByDefault: true
          }],
          icon: Codicon.emptyWindow
        });
      }
      async run() {
        that.openActiveOutput(AUX_WINDOW_GROUP);
      }
    }));
  }
  registerSaveActiveOutputAsAction() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.action.saveActiveLogOutputAs`,
          title: localize2(17998, "Save Output As..."),
          menu: [{
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", OUTPUT_VIEW_ID),
            group: "1_export",
            order: 1
          }]
        });
      }
      async run(accessor) {
        const outputService = accessor.get(IOutputService);
        const channel = outputService.getActiveChannel();
        if (channel) {
          const descriptor = outputService.getChannelDescriptors().find((c) => c.id === channel.id);
          if (descriptor) {
            await outputService.saveOutputAs(void 0, descriptor);
          }
        }
      }
    }));
  }
  async openActiveOutput(group2) {
    const channel = this.outputService.getActiveChannel();
    if (channel) {
      await this.editorService.openEditor({
        resource: channel.uri,
        options: {
          pinned: true
        }
      }, group2);
    }
  }
  registerConfigureActiveOutputLogLevelAction() {
    const logLevelMenu = new MenuId("workbench.output.menu.logLevel");
    this._register(MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
      submenu: logLevelMenu,
      title: localize(17984, null),
      group: "navigation",
      when: ContextKeyExpr.and(ContextKeyExpr.equals("view", OUTPUT_VIEW_ID), CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE),
      icon: Codicon.gear,
      order: 6
    }));
    let order = 0;
    const registerLogLevel = (logLevel) => {
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: `workbench.action.output.activeOutputLogLevel.${logLevel}`,
            title: LogLevelToLocalizedString(logLevel).value,
            toggled: CONTEXT_ACTIVE_OUTPUT_LEVEL.isEqualTo(LogLevelToString(logLevel)),
            menu: {
              id: logLevelMenu,
              order: order++,
              group: "0_level"
            }
          });
        }
        async run(accessor) {
          const outputService = accessor.get(IOutputService);
          const channel = outputService.getActiveChannel();
          if (channel) {
            const channelDescriptor = outputService.getChannelDescriptor(channel.id);
            if (channelDescriptor) {
              outputService.setLogLevel(channelDescriptor, logLevel);
            }
          }
        }
      }));
    };
    registerLogLevel(1 /* Trace */);
    registerLogLevel(2 /* Debug */);
    registerLogLevel(3 /* Info */);
    registerLogLevel(4 /* Warning */);
    registerLogLevel(5 /* Error */);
    registerLogLevel(0 /* Off */);
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.action.output.activeOutputLogLevelDefault`,
          title: localize(17985, null),
          menu: {
            id: logLevelMenu,
            order,
            group: "1_default"
          },
          precondition: CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT.negate()
        });
      }
      async run(accessor) {
        const outputService = accessor.get(IOutputService);
        const loggerService = accessor.get(ILoggerService);
        const defaultLogLevelsService = accessor.get(IDefaultLogLevelsService);
        const channel = outputService.getActiveChannel();
        if (channel) {
          const channelDescriptor = outputService.getChannelDescriptor(channel.id);
          if (channelDescriptor && isSingleSourceOutputChannelDescriptor(channelDescriptor)) {
            const logLevel = loggerService.getLogLevel(channelDescriptor.source.resource);
            return await defaultLogLevelsService.setDefaultLogLevel(logLevel, channelDescriptor.extensionId);
          }
        }
      }
    }));
  }
  registerShowLogsAction() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.showLogs",
          title: localize2(18002, "Show Logs..."),
          category: Categories.Developer,
          menu: {
            id: MenuId.CommandPalette
          }
        });
      }
      async run(accessor) {
        const outputService = accessor.get(IOutputService);
        const quickInputService = accessor.get(IQuickInputService);
        const extensionLogs = [], logs = [];
        for (const channel of outputService.getChannelDescriptors()) {
          if (channel.log) {
            if (channel.extensionId) {
              extensionLogs.push(channel);
            } else {
              logs.push(channel);
            }
          }
        }
        const entries2 = [];
        for (const { id: id2, label: label3 } of logs) {
          entries2.push({ id: id2, label: label3 });
        }
        if (extensionLogs.length && logs.length) {
          entries2.push({ type: "separator", label: localize(17979, null) });
        }
        for (const { id: id2, label: label3 } of extensionLogs) {
          entries2.push({ id: id2, label: label3 });
        }
        const entry = await quickInputService.pick(entries2, { placeHolder: localize(17999, null) });
        if (entry) {
          return outputService.showChannel(entry.id);
        }
      }
    }));
  }
  registerOpenLogFileAction() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openLogFile",
          title: localize2(17990, "Open Log..."),
          category: Categories.Developer,
          menu: {
            id: MenuId.CommandPalette
          },
          metadata: {
            description: "workbench.action.openLogFile",
            args: [{
              name: "logFile",
              schema: {
                markdownDescription: localize(17982, null),
                type: "string"
              }
            }]
          }
        });
      }
      async run(accessor, args2) {
        const outputService = accessor.get(IOutputService);
        const quickInputService = accessor.get(IQuickInputService);
        const editorService = accessor.get(IEditorService);
        let entry;
        const argName = args2 && typeof args2 === "string" ? args2 : void 0;
        const extensionChannels = [];
        const coreChannels = [];
        for (const c of outputService.getChannelDescriptors()) {
          if (c.log) {
            const e = { id: c.id, label: c.label };
            if (c.extensionId) {
              extensionChannels.push(e);
            } else {
              coreChannels.push(e);
            }
            if (e.id === argName) {
              entry = e;
            }
          }
        }
        if (!entry) {
          const entries2 = [...extensionChannels.sort((a, b) => a.label.localeCompare(b.label))];
          if (entries2.length && coreChannels.length) {
            entries2.push({ type: "separator" });
            entries2.push(...coreChannels.sort((a, b) => a.label.localeCompare(b.label)));
          }
          entry = await quickInputService.pick(entries2, { placeHolder: localize(18000, null) });
        }
        if (entry?.id) {
          const channel = outputService.getChannel(entry.id);
          if (channel) {
            await editorService.openEditor({
              resource: channel.uri,
              options: {
                pinned: true
              }
            });
          }
        }
      }
    }));
  }
  registerLogLevelFilterActions() {
    let order = 0;
    const registerLogLevel = (logLevel, toggled) => {
      this._register(registerAction2(class extends ViewAction {
        constructor() {
          super({
            id: `workbench.actions.${OUTPUT_VIEW_ID}.toggle.${LogLevelToString(logLevel)}`,
            title: LogLevelToLocalizedString(logLevel).value,
            metadata: {
              description: localize2(18007, "Show or hide {0} messages in the output", LogLevelToString(logLevel))
            },
            toggled,
            menu: {
              id: viewFilterSubmenu,
              group: "2_log_filter",
              when: ContextKeyExpr.and(ContextKeyExpr.equals("view", OUTPUT_VIEW_ID), CONTEXT_ACTIVE_LOG_FILE_OUTPUT),
              order: order++
            },
            viewId: OUTPUT_VIEW_ID
          });
        }
        async runInView(serviceAccessor, view) {
          this.toggleLogLevelFilter(serviceAccessor.get(IOutputService), logLevel);
        }
        toggleLogLevelFilter(outputService, logLevel2) {
          switch (logLevel2) {
            case 1 /* Trace */:
              outputService.filters.trace = !outputService.filters.trace;
              break;
            case 2 /* Debug */:
              outputService.filters.debug = !outputService.filters.debug;
              break;
            case 3 /* Info */:
              outputService.filters.info = !outputService.filters.info;
              break;
            case 4 /* Warning */:
              outputService.filters.warning = !outputService.filters.warning;
              break;
            case 5 /* Error */:
              outputService.filters.error = !outputService.filters.error;
              break;
          }
        }
      }));
    };
    registerLogLevel(1 /* Trace */, SHOW_TRACE_FILTER_CONTEXT);
    registerLogLevel(2 /* Debug */, SHOW_DEBUG_FILTER_CONTEXT);
    registerLogLevel(3 /* Info */, SHOW_INFO_FILTER_CONTEXT);
    registerLogLevel(4 /* Warning */, SHOW_WARNING_FILTER_CONTEXT);
    registerLogLevel(5 /* Error */, SHOW_ERROR_FILTER_CONTEXT);
  }
  registerClearFilterActions() {
    this._register(registerAction2(class extends ViewAction {
      constructor() {
        super({
          id: `workbench.actions.${OUTPUT_VIEW_ID}.clearFilterText`,
          title: localize(17976, null),
          keybinding: {
            when: OUTPUT_FILTER_FOCUS_CONTEXT,
            weight: 200 /* WorkbenchContrib */,
            primary: 9 /* Escape */
          },
          viewId: OUTPUT_VIEW_ID
        });
      }
      async runInView(serviceAccessor, outputView) {
        outputView.clearFilterText();
      }
    }));
  }
  registerExportLogsAction() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.action.exportLogs`,
          title: localize2(17978, "Export Logs..."),
          f1: true,
          category: Categories.Developer,
          menu: [{
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", OUTPUT_VIEW_ID),
            group: "1_export",
            order: 2
          }]
        });
      }
      async run(accessor, arg) {
        const outputService = accessor.get(IOutputService);
        const quickInputService = accessor.get(IQuickInputService);
        const extensionLogs = [], logs = [], userLogs = [];
        for (const channel of outputService.getChannelDescriptors()) {
          if (channel.log) {
            if (channel.extensionId) {
              extensionLogs.push(channel);
            } else if (channel.user) {
              userLogs.push(channel);
            } else {
              logs.push(channel);
            }
          }
        }
        const entries2 = [];
        for (const log4 of logs.sort((a, b) => a.label.localeCompare(b.label))) {
          entries2.push(log4);
        }
        if (extensionLogs.length && logs.length) {
          entries2.push({ type: "separator", label: localize(17979, null) });
        }
        for (const log4 of extensionLogs.sort((a, b) => a.label.localeCompare(b.label))) {
          entries2.push(log4);
        }
        if (userLogs.length && (extensionLogs.length || logs.length)) {
          entries2.push({ type: "separator", label: localize(18008, null) });
        }
        for (const log4 of userLogs.sort((a, b) => a.label.localeCompare(b.label))) {
          entries2.push(log4);
        }
        let selectedOutputChannels;
        if (arg?.outputChannelIds) {
          const requestedIdsNormalized = arg.outputChannelIds.map((id2) => id2.trim().toLowerCase());
          const candidates = entries2.filter((e) => {
            const isSeparator = hasKey(e, { type: true }) && e.type === "separator";
            return !isSeparator;
          });
          if (requestedIdsNormalized.includes("*")) {
            selectedOutputChannels = candidates;
          } else {
            selectedOutputChannels = candidates.filter((candidate) => requestedIdsNormalized.includes(candidate.id.toLowerCase()));
          }
        } else {
          selectedOutputChannels = await quickInputService.pick(entries2, { placeHolder: localize(17999, null), canPickMany: true });
        }
        if (selectedOutputChannels?.length) {
          await outputService.saveOutputAs(arg?.outputPath, ...selectedOutputChannels);
        }
      }
    }));
  }
  registerImportLogAction() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.action.importLog`,
          title: localize2(17980, "Import Log..."),
          f1: true,
          category: Categories.Developer,
          menu: [{
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", OUTPUT_VIEW_ID),
            group: "2_add",
            order: 2
          }]
        });
      }
      async run(accessor) {
        const outputService = accessor.get(IOutputService);
        const fileDialogService = accessor.get(IFileDialogService);
        const result = await fileDialogService.showOpenDialog({
          title: localize(17981, null),
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: true,
          filters: [{
            name: localize(17983, null),
            extensions: ["log"]
          }]
        });
        if (result?.length) {
          const channelName = basename2(result[0]);
          const channelId = `${IMPORTED_LOG_ID_PREFIX}${Date.now()}`;
          Registry.as(Extensions15.OutputChannels).registerChannel({
            id: channelId,
            label: channelName,
            log: true,
            user: true,
            source: result.length === 1 ? { resource: result[0] } : result.map((resource) => ({ resource, name: basename2(resource).split(".")[0] }))
          });
          outputService.showChannel(channelId);
        }
      }
    }));
  }
};

OutputContribution = __decorateClass([
  __decorateParam(0, IOutputService),
  __decorateParam(1, IEditorService)
], OutputContribution);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(OutputContribution, 3 /* Restored */);

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "output",
  order: 30,
  title: localize(17992, null),
  type: "object",
  properties: {
    "output.smartScroll.enabled": {
      type: "boolean",
      description: localize(17993, null),
      default: true,
      scope: 4 /* WINDOW */,
      tags: ["output"]
    }
  }
});

KeybindingsRegistry.registerKeybindingRule({
  id: "cursorWordAccessibilityLeft",
  when: ContextKeyExpr.and(EditorContextKeys.textInputFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, IsWindowsContext, ContextKeyExpr.equals(FocusedViewContext.key, OUTPUT_VIEW_ID)),
  primary: 2048 /* CtrlCmd */ | 15 /* LeftArrow */,
  weight: 200 /* WorkbenchContrib */
});

KeybindingsRegistry.registerKeybindingRule({
  id: "cursorWordAccessibilityLeftSelect",
  when: ContextKeyExpr.and(EditorContextKeys.textInputFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, IsWindowsContext, ContextKeyExpr.equals(FocusedViewContext.key, OUTPUT_VIEW_ID)),
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 15 /* LeftArrow */,
  weight: 200 /* WorkbenchContrib */
});

KeybindingsRegistry.registerKeybindingRule({
  id: "cursorWordAccessibilityRight",
  when: ContextKeyExpr.and(EditorContextKeys.textInputFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, IsWindowsContext, ContextKeyExpr.equals(FocusedViewContext.key, OUTPUT_VIEW_ID)),
  primary: 2048 /* CtrlCmd */ | 17 /* RightArrow */,
  weight: 200 /* WorkbenchContrib */
});

KeybindingsRegistry.registerKeybindingRule({
  id: "cursorWordAccessibilityRightSelect",
  when: ContextKeyExpr.and(EditorContextKeys.textInputFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, IsWindowsContext, ContextKeyExpr.equals(FocusedViewContext.key, OUTPUT_VIEW_ID)),
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 17 /* RightArrow */,
  weight: 200 /* WorkbenchContrib */
});
export { IMPORTED_LOG_ID_PREFIX, outputViewIcon, VIEW_CONTAINER5, OutputContribution };
