// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/xterm/decorationAddon.ts
import { Disposable, DisposableMap, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { getTerminalCommandDecorationState, getTerminalDecorationHoverContent, updateLayout } from "./module-2352.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { terminalDecorationMark } from "./module-2351.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { Separator } from "./module-0082.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { isString } from "./module-0010.mjs";
import { getTerminalUri, parseTerminalUri } from "./module-2158.mjs";
import { TerminalContext } from "./module-2167.mjs";
import { TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR, TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR, TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR } from "./module-1174.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IChatContextPickService } from "./module-1453.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/terminal/browser/xterm/decorationAddon.ts
var DecorationAddon = class extends Disposable {
  constructor(_resource, _capabilities, _clipboardService, _contextMenuService, _configurationService, _themeService, _openerService, _quickInputService, _commandService, _accessibilitySignalService, _notificationService, _hoverService, _contextPickService, _chatWidgetService, _instantiationService) {
    super();
    this._resource = _resource;
    this._capabilities = _capabilities;
    this._clipboardService = _clipboardService;
    this._contextMenuService = _contextMenuService;
    this._configurationService = _configurationService;
    this._themeService = _themeService;
    this._openerService = _openerService;
    this._quickInputService = _quickInputService;
    this._commandService = _commandService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._notificationService = _notificationService;
    this._hoverService = _hoverService;
    this._contextPickService = _contextPickService;
    this._chatWidgetService = _chatWidgetService;
    this._instantiationService = _instantiationService;
    this._capabilityDisposables = this._register(new DisposableMap());
    this._decorations = /* @__PURE__ */ new Map();
    this._registeredMenuItems = /* @__PURE__ */ new Map();
    this._onDidRequestRunCommand = this._register(new Emitter());
    this.onDidRequestRunCommand = this._onDidRequestRunCommand.event;
    this._onDidRequestCopyAsHtml = this._register(new Emitter());
    this.onDidRequestCopyAsHtml = this._onDidRequestCopyAsHtml.event;
    this._register(toDisposable(() => this._dispose()));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminal.integrated.fontSize" /* FontSize */) || e.affectsConfiguration("terminal.integrated.lineHeight" /* LineHeight */)) {
        this.refreshLayouts();
      } else if (e.affectsConfiguration("workbench.colorCustomizations")) {
        this._refreshStyles(true);
      } else if (e.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled" /* ShellIntegrationDecorationsEnabled */)) {
        this._removeCapabilityDisposables(2 /* CommandDetection */);
        this._updateDecorationVisibility();
      }
    }));
    this._register(this._themeService.onDidColorThemeChange(() => this._refreshStyles(true)));
    this._updateDecorationVisibility();
    this._register(this._capabilities.onDidAddCapability((c) => this._createCapabilityDisposables(c.id)));
    this._register(this._capabilities.onDidRemoveCapability((c) => this._removeCapabilityDisposables(c.id)));
  }
  _createCapabilityDisposables(c) {
    const capability = this._capabilities.get(c);
    if (!capability || this._capabilityDisposables.has(c)) {
      return;
    }
    const store = new DisposableStore();
    switch (capability.type) {
      case 4 /* BufferMarkDetection */:
        store.add(capability.onMarkAdded((mark2) => this.registerMarkDecoration(mark2)));
        break;
      case 2 /* CommandDetection */: {
        const disposables = this._getCommandDetectionListeners(capability);
        for (const d of disposables) {
          store.add(d);
        }
        break;
      }
    }
    this._capabilityDisposables.set(c, store);
  }
  _removeCapabilityDisposables(c) {
    this._capabilityDisposables.deleteAndDispose(c);
  }
  registerMarkDecoration(mark2) {
    if (!this._terminal || !this._showGutterDecorations && !this._showOverviewRulerDecorations) {
      return void 0;
    }
    if (mark2.hidden) {
      return void 0;
    }
    return this.registerCommandDecoration(void 0, void 0, mark2);
  }
  _updateDecorationVisibility() {
    const showDecorations = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* ShellIntegrationDecorationsEnabled */);
    this._showGutterDecorations = showDecorations === "both" || showDecorations === "gutter";
    this._showOverviewRulerDecorations = showDecorations === "both" || showDecorations === "overviewRuler";
    this._disposeAllDecorations();
    if (this._showGutterDecorations || this._showOverviewRulerDecorations) {
      this._attachToCommandCapability();
      this._updateGutterDecorationVisibility();
    }
    const currentCommand = this._capabilities.get(2 /* CommandDetection */)?.executingCommandObject;
    if (currentCommand) {
      this.registerCommandDecoration(currentCommand, true);
    }
  }
  _disposeAllDecorations() {
    this._placeholderDecoration?.dispose();
    for (const value2 of this._decorations.values()) {
      value2.decoration.dispose();
      dispose(value2.disposables);
    }
  }
  _updateGutterDecorationVisibility() {
    const commandDecorationElements = this._terminal?.element?.querySelectorAll("terminal-command-decoration" /* CommandDecoration */);
    if (commandDecorationElements) {
      for (const commandDecorationElement of commandDecorationElements) {
        this._updateCommandDecorationVisibility(commandDecorationElement);
      }
    }
  }
  _updateCommandDecorationVisibility(commandDecorationElement) {
    if (this._showGutterDecorations) {
      commandDecorationElement.classList.remove("hide" /* Hide */);
    } else {
      commandDecorationElement.classList.add("hide" /* Hide */);
    }
  }
  refreshLayouts() {
    updateLayout(this._configurationService, this._placeholderDecoration?.element);
    for (const decoration3 of this._decorations) {
      updateLayout(this._configurationService, decoration3[1].decoration.element);
    }
  }
  _refreshStyles(refreshOverviewRulerColors) {
    if (refreshOverviewRulerColors) {
      for (const decoration3 of this._decorations.values()) {
        const color2 = this._getDecorationCssColor(decoration3.command)?.toString() ?? "";
        if (decoration3.decoration.options?.overviewRulerOptions) {
          decoration3.decoration.options.overviewRulerOptions.color = color2;
        } else if (decoration3.decoration.options) {
          decoration3.decoration.options.overviewRulerOptions = { color: color2 };
        }
      }
    }
    this._updateClasses(this._placeholderDecoration?.element);
    for (const decoration3 of this._decorations.values()) {
      this._updateClasses(decoration3.decoration.element, decoration3.command, decoration3.markProperties);
    }
  }
  _dispose() {
    for (const disposable of this._capabilityDisposables.values()) {
      dispose(disposable);
    }
    this.clearDecorations();
  }
  _clearPlaceholder() {
    this._placeholderDecoration?.dispose();
    this._placeholderDecoration = void 0;
  }
  clearDecorations() {
    this._placeholderDecoration?.marker.dispose();
    this._clearPlaceholder();
    this._disposeAllDecorations();
    this._decorations.clear();
  }
  _attachToCommandCapability() {
    if (this._capabilities.has(2 /* CommandDetection */)) {
      const capability = this._capabilities.get(2 /* CommandDetection */);
      const disposables = this._getCommandDetectionListeners(capability);
      const store = new DisposableStore();
      for (const d of disposables) {
        store.add(d);
      }
      this._capabilityDisposables.set(2 /* CommandDetection */, store);
    }
  }
  _getCommandDetectionListeners(capability) {
    this._removeCapabilityDisposables(2 /* CommandDetection */);
    const commandDetectionListeners = [];
    if (capability.executingCommandObject?.marker) {
      this.registerCommandDecoration(capability.executingCommandObject, true);
    }
    commandDetectionListeners.push(capability.onCommandStarted((command4) => this.registerCommandDecoration(command4, true)));
    for (const command4 of capability.commands) {
      this.registerCommandDecoration(command4);
    }
    commandDetectionListeners.push(capability.onCommandFinished((command4) => {
      const buffer = this._terminal?.buffer?.active;
      const marker = command4.promptStartMarker;
      const shouldRegisterDecoration = command4.exitCode === void 0 || // Only register decoration if the cursor is at or below the promptStart marker.
      buffer && marker && buffer.baseY + buffer.cursorY >= marker.line;
      if (shouldRegisterDecoration) {
        this.registerCommandDecoration(command4);
      }
      if (command4.exitCode) {
        this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalCommandFailed);
      } else {
        this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalCommandSucceeded);
      }
    }));
    commandDetectionListeners.push(capability.onCommandInvalidated((commands) => {
      for (const command4 of commands) {
        const id2 = command4.marker?.id;
        if (id2) {
          const match2 = this._decorations.get(id2);
          if (match2) {
            match2.decoration.dispose();
            dispose(match2.disposables);
          }
        }
      }
    }));
    commandDetectionListeners.push(capability.onCurrentCommandInvalidated((request2) => {
      if (request2.reason === "noProblemsReported" /* NoProblemsReported */) {
        const lastDecoration = Array.from(this._decorations.entries())[this._decorations.size - 1];
        lastDecoration?.[1].decoration.dispose();
      } else if (request2.reason === "windows" /* Windows */) {
        this._clearPlaceholder();
      }
    }));
    return commandDetectionListeners;
  }
  activate(terminal2) {
    this._terminal = terminal2;
    this._attachToCommandCapability();
  }
  registerCommandDecoration(command4, beforeCommandExecution, markProperties) {
    if (!this._terminal || beforeCommandExecution && !command4 || !this._showGutterDecorations && !this._showOverviewRulerDecorations) {
      return void 0;
    }
    const marker = command4?.marker || markProperties?.marker;
    if (!marker) {
      throw new Error(`cannot add a decoration for a command ${JSON.stringify(command4)} with no marker`);
    }
    this._clearPlaceholder();
    const color2 = this._getDecorationCssColor(command4)?.toString() ?? "";
    const decoration3 = this._terminal.registerDecoration({
      marker,
      overviewRulerOptions: this._showOverviewRulerDecorations ? beforeCommandExecution ? { color: color2, position: "left" } : { color: color2, position: command4?.exitCode ? "right" : "left" } : void 0
    });
    if (!decoration3) {
      return void 0;
    }
    if (beforeCommandExecution) {
      this._placeholderDecoration = decoration3;
    }
    decoration3.onRender((element) => {
      if (element.classList.contains(".xterm-decoration-overview-ruler" /* OverviewRuler */)) {
        return;
      }
      if (!this._decorations.get(decoration3.marker.id)) {
        decoration3.onDispose(() => {
          const disposableDecoration = this._decorations.get(decoration3.marker.id);
          if (disposableDecoration) {
            dispose(disposableDecoration.disposables);
            this._decorations.delete(decoration3.marker.id);
          }
        });
        this._decorations.set(
          decoration3.marker.id,
          {
            decoration: decoration3,
            disposables: this._createDisposables(element, command4, markProperties),
            command: command4,
            markProperties: command4?.markProperties || markProperties
          }
        );
      }
      if (!element.classList.contains("codicon" /* Codicon */) || command4?.marker?.line === 0) {
        updateLayout(this._configurationService, element);
        this._updateClasses(element, command4, command4?.markProperties || markProperties);
      }
    });
    return decoration3;
  }
  registerMenuItems(command4, items) {
    const existingItems = this._registeredMenuItems.get(command4);
    if (existingItems) {
      existingItems.push(...items);
    } else {
      this._registeredMenuItems.set(command4, [...items]);
    }
    return toDisposable(() => {
      const commandItems = this._registeredMenuItems.get(command4);
      if (commandItems) {
        for (const item of items.values()) {
          const index2 = commandItems.indexOf(item);
          if (index2 !== -1) {
            commandItems.splice(index2, 1);
          }
        }
      }
    });
  }
  _createDisposables(element, command4, markProperties) {
    if (command4?.exitCode === void 0 && !command4?.markProperties) {
      return [];
    } else if (command4?.markProperties || markProperties) {
      return [this._createHover(element, command4 || markProperties, markProperties?.hoverMessage)];
    }
    return [...this._createContextMenu(element, command4), this._createHover(element, command4)];
  }
  _createHover(element, command4, hoverMessage) {
    return this._hoverService.setupDelayedHover(element, () => ({
      content: new MarkdownString(getTerminalDecorationHoverContent(command4, hoverMessage, true))
    }));
  }
  _updateClasses(element, command4, markProperties) {
    if (!element) {
      return;
    }
    for (const classes2 of element.classList) {
      element.classList.remove(classes2);
    }
    element.classList.add("terminal-command-decoration" /* CommandDecoration */, "codicon" /* Codicon */, "xterm-decoration" /* XtermDecoration */);
    if (markProperties) {
      element.classList.add("default-color" /* DefaultColor */, ...ThemeIcon.asClassNameArray(terminalDecorationMark));
      if (!markProperties.hoverMessage) {
        element.classList.add("default" /* Default */);
      }
    } else {
      const state = getTerminalCommandDecorationState(command4);
      this._updateCommandDecorationVisibility(element);
      for (const className2 of state.classNames) {
        element.classList.add(className2);
      }
      element.classList.add(...ThemeIcon.asClassNameArray(state.icon));
    }
    element.removeAttribute("title");
    element.removeAttribute("aria-label");
  }
  _createContextMenu(element, command4) {
    return [
      addDisposableListener(element, EventType.MOUSE_DOWN, async (e) => {
        e.stopImmediatePropagation();
      }),
      addDisposableListener(element, EventType.CLICK, async (e) => {
        e.stopImmediatePropagation();
        const actions = await this._getCommandActions(command4);
        this._contextMenuService.showContextMenu({ getAnchor: () => element, getActions: () => actions });
      }),
      addDisposableListener(element, EventType.CONTEXT_MENU, async (e) => {
        e.stopImmediatePropagation();
        const chatActions = await this._getCommandActions(command4);
        const actions = this._getContextMenuActions();
        this._contextMenuService.showContextMenu({ getAnchor: () => element, getActions: () => [...actions, ...chatActions] });
      })
    ];
  }
  _getContextMenuActions() {
    const label3 = localize(20113, null);
    return [
      {
        class: void 0,
        tooltip: label3,
        id: "terminal.toggleVisibility",
        label: label3,
        enabled: true,
        run: async () => {
          this._showToggleVisibilityQuickPick();
        }
      }
    ];
  }
  async _getCommandActions(command4) {
    const actions = [];
    const registeredMenuItems = this._registeredMenuItems.get(command4);
    if (registeredMenuItems?.length) {
      actions.push(...registeredMenuItems, new Separator());
    }
    const attachToChatAction = this._createAttachToChatAction(command4);
    if (attachToChatAction) {
      actions.push(attachToChatAction, new Separator());
    }
    if (command4.command !== "") {
      const labelRun = localize(20109, null);
      actions.push({
        class: void 0,
        tooltip: labelRun,
        id: "terminal.rerunCommand",
        label: labelRun,
        enabled: true,
        run: async () => {
          if (command4.command === "") {
            return;
          }
          if (!command4.isTrusted) {
            const shouldRun = await new Promise((r2) => {
              this._notificationService.prompt(Severity2.Info, localize(20102, null, command4.command), [{
                label: localize(20114, null),
                run: () => r2(true)
              }, {
                label: localize(20100, null),
                run: () => r2(false)
              }]);
            });
            if (!shouldRun) {
              return;
            }
          }
          this._onDidRequestRunCommand.fire({ command: command4 });
        }
      });
      actions.push(new Separator());
      const labelCopy = localize(20104, null);
      actions.push({
        class: void 0,
        tooltip: labelCopy,
        id: "terminal.copyCommand",
        label: labelCopy,
        enabled: true,
        run: () => this._clipboardService.writeText(command4.command)
      });
    }
    if (command4.hasOutput()) {
      const labelCopyCommandAndOutput = localize(20105, null);
      actions.push({
        class: void 0,
        tooltip: labelCopyCommandAndOutput,
        id: "terminal.copyCommandAndOutput",
        label: labelCopyCommandAndOutput,
        enabled: true,
        run: () => {
          const output = command4.getOutput();
          if (isString(output)) {
            this._clipboardService.writeText(`${command4.command !== "" ? command4.command + "\n" : ""}${output}`);
          }
        }
      });
      const labelText = localize(20106, null);
      actions.push({
        class: void 0,
        tooltip: labelText,
        id: "terminal.copyOutput",
        label: labelText,
        enabled: true,
        run: () => {
          const text2 = command4.getOutput();
          if (isString(text2)) {
            this._clipboardService.writeText(text2);
          }
        }
      });
      const labelHtml = localize(20107, null);
      actions.push({
        class: void 0,
        tooltip: labelHtml,
        id: "terminal.copyOutputAsHtml",
        label: labelHtml,
        enabled: true,
        run: () => this._onDidRequestCopyAsHtml.fire({ command: command4 })
      });
    }
    if (actions.length > 0) {
      actions.push(new Separator());
    }
    const labelRunRecent = localize(20112, null);
    actions.push({
      class: void 0,
      tooltip: labelRunRecent,
      id: "workbench.action.terminal.runRecentCommand",
      label: labelRunRecent,
      enabled: true,
      run: () => this._commandService.executeCommand("workbench.action.terminal.runRecentCommand")
    });
    const labelGoToRecent = localize(20111, null);
    actions.push({
      class: void 0,
      tooltip: labelRunRecent,
      id: "workbench.action.terminal.goToRecentDirectory",
      label: labelGoToRecent,
      enabled: true,
      run: () => this._commandService.executeCommand("workbench.action.terminal.goToRecentDirectory")
    });
    actions.push(new Separator());
    const labelAbout = localize(20108, null);
    actions.push({
      class: void 0,
      tooltip: labelAbout,
      id: "terminal.learnShellIntegration",
      label: labelAbout,
      enabled: true,
      run: () => this._openerService.open("https://code.visualstudio.com/docs/terminal/shell-integration")
    });
    return actions;
  }
  _createAttachToChatAction(command4) {
    const chatIsEnabled = this._chatWidgetService.getWidgetsByLocations("panel" /* Chat */).some((w) => w.attachmentCapabilities.supportsTerminalAttachments);
    if (!chatIsEnabled) {
      return void 0;
    }
    const labelAttachToChat = localize(20103, null);
    return {
      class: void 0,
      tooltip: labelAttachToChat,
      id: "terminal.attachToChat",
      label: labelAttachToChat,
      enabled: true,
      run: async () => {
        let widget = this._chatWidgetService.lastFocusedWidget ?? this._chatWidgetService.getWidgetsByLocations("panel" /* Chat */)?.find((w) => w.attachmentCapabilities.supportsTerminalAttachments);
        if (!widget) {
          widget = await this._chatWidgetService.revealWidget();
        }
        if (!widget) {
          return;
        }
        let terminalContext;
        if (this._resource) {
          const parsedUri = parseTerminalUri(this._resource);
          terminalContext = this._instantiationService.createInstance(TerminalContext, getTerminalUri(parsedUri.workspaceId, parsedUri.instanceId, void 0, command4.id));
        }
        if (terminalContext && widget.attachmentCapabilities.supportsTerminalAttachments) {
          try {
            const attachment = await terminalContext.asAttachment(widget);
            if (attachment) {
              widget.attachmentModel.addContext(attachment);
              widget.focusInput();
              return;
            }
          } catch (err) {
          }
          this._store.add(this._contextPickService.registerChatContextItem(terminalContext));
        }
      }
    };
  }
  _showToggleVisibilityQuickPick() {
    const quickPick = this._register(this._quickInputService.createQuickPick());
    quickPick.hideInput = true;
    quickPick.hideCheckAll = true;
    quickPick.canSelectMany = true;
    quickPick.title = localize(20110, null);
    const configValue = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* ShellIntegrationDecorationsEnabled */);
    const gutterIcon = {
      label: localize(20099, null),
      picked: configValue !== "never" && configValue !== "overviewRuler"
    };
    const overviewRulerIcon = {
      label: localize(20101, null),
      picked: configValue !== "never" && configValue !== "gutter"
    };
    quickPick.items = [gutterIcon, overviewRulerIcon];
    const selectedItems = [];
    if (configValue !== "never") {
      if (configValue !== "gutter") {
        selectedItems.push(gutterIcon);
      }
      if (configValue !== "overviewRuler") {
        selectedItems.push(overviewRulerIcon);
      }
    }
    quickPick.selectedItems = selectedItems;
    this._register(quickPick.onDidChangeSelection(async (e) => {
      let newValue = "never";
      if (e.includes(gutterIcon)) {
        if (e.includes(overviewRulerIcon)) {
          newValue = "both";
        } else {
          newValue = "gutter";
        }
      } else if (e.includes(overviewRulerIcon)) {
        newValue = "overviewRuler";
      }
      await this._configurationService.updateValue("terminal.integrated.shellIntegration.decorationsEnabled" /* ShellIntegrationDecorationsEnabled */, newValue);
    }));
    quickPick.ok = false;
    quickPick.show();
  }
  _getDecorationCssColor(command4) {
    let colorId;
    if (command4?.exitCode === void 0) {
      colorId = TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR;
    } else {
      colorId = command4.exitCode ? TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR : TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR;
    }
    return this._themeService.getColorTheme().getColor(colorId)?.toString();
  }
};

DecorationAddon = __decorateClass([
  __decorateParam(2, IClipboardService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IQuickInputService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, IAccessibilitySignalService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IChatContextPickService),
  __decorateParam(13, IChatWidgetService),
  __decorateParam(14, IInstantiationService)
], DecorationAddon);
export { DecorationAddon };
