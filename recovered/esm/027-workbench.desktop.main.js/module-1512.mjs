// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/developerActions.ts
import { Action2, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { DisposableStore, DisposableTracker, dispose, setDisposableTracker, toDisposable } from "./module-0012.mjs";
import { createCSSRule, createStyleSheet } from "./module-0224.mjs";
import { $, append, getActiveDocument, getDomNodePagePosition, getWindows, onDidRegisterWindow } from "./module-0075.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Color } from "./module-0197.mjs";
import { clamp } from "./module-0040.mjs";
import { RunOnceScheduler, raceTimeout } from "./module-0036.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { IWorkingCopyBackupService } from "./module-1121.mjs";
import { ILogService } from "./module-0095.mjs";
import { IOutputService } from "./module-1245.mjs";
import { windowLogId } from "./module-1509.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ByteSize } from "./module-0269.mjs";
import { IEditorService } from "./module-0934.mjs";
import { markdownDetails, markdownJsonBlock, markdownTable, markdownText } from "./module-1511.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IProductService } from "./module-0873.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IAuthenticationAccessService } from "./module-0968.mjs";
import { IPolicyService } from "./module-0956.mjs";
import { APPROVED_ACCOUNT_ORGANIZATIONS_POLICY_NAME, IAccountPolicyGateService } from "./module-0957.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IAgentHostEnablementService } from "./module-0963.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IProgressService } from "./module-0446.mjs";
import { COPILOT_ENABLED_PLUGINS_KEY, COPILOT_EXTRA_MARKETPLACES_KEY, COPILOT_STRICT_MARKETPLACES_KEY, IFileManagedSettingsService, INativeManagedSettingsService, normalizeManagedSettings, pickManagedSettings, projectManagedSettings } from "./module-0955.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { isObject } from "./module-0010.mjs";
import { adaptManagedSettings, appendManagedSettingsClientIdentity } from "./module-1510.mjs";
import { parse5 } from "./module-0883.mjs";
import { getParseErrorMessage } from "./module-0888.mjs";
import { isVirtualWorkspace } from "./module-0936.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isManagedSettingsFreshnessBlocking } from "./module-0740.mjs";
import { product_default } from "./module-0139.mjs";


// src/vs/workbench/browser/actions/developerActions.ts
var InspectContextKeysAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.inspectContextKeys",
      title: localize2(5920, "Inspect Context Keys"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const contextKeyService = accessor.get(IContextKeyService);
    const disposables = new DisposableStore();
    const stylesheet = createStyleSheet(void 0, void 0, disposables);
    createCSSRule("*", "cursor: crosshair !important;", stylesheet);
    const hoverFeedback = document.createElement("div");
    const activeDocument = getActiveDocument();
    activeDocument.body.appendChild(hoverFeedback);
    disposables.add(toDisposable(() => hoverFeedback.remove()));
    hoverFeedback.style.position = "absolute";
    hoverFeedback.style.pointerEvents = "none";
    hoverFeedback.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    hoverFeedback.style.zIndex = "1000";
    const onMouseMove = disposables.add(new DomEmitter(activeDocument, "mousemove", true));
    disposables.add(onMouseMove.event((e) => {
      const target = e.target;
      const position2 = getDomNodePagePosition(target);
      hoverFeedback.style.top = `${position2.top}px`;
      hoverFeedback.style.left = `${position2.left}px`;
      hoverFeedback.style.width = `${position2.width}px`;
      hoverFeedback.style.height = `${position2.height}px`;
    }));
    const onMouseDown = disposables.add(new DomEmitter(activeDocument, "mousedown", true));
    Event2.once(onMouseDown.event)((e) => {
      e.preventDefault();
      e.stopPropagation();
    }, null, disposables);
    const onMouseUp = disposables.add(new DomEmitter(activeDocument, "mouseup", true));
    Event2.once(onMouseUp.event)((e) => {
      e.preventDefault();
      e.stopPropagation();
      const context2 = contextKeyService.getContext(e.target);
      console.log(context2.collectAllValues());
      dispose(disposables);
    }, null, disposables);
  }
};

var ToggleScreencastModeAction = class _ToggleScreencastModeAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleScreencastMode",
      title: localize2(5960, "Toggle Screencast Mode"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    if (_ToggleScreencastModeAction.disposable) {
      _ToggleScreencastModeAction.disposable.dispose();
      _ToggleScreencastModeAction.disposable = void 0;
      return;
    }
    const layoutService = accessor.get(ILayoutService);
    const configurationService = accessor.get(IConfigurationService);
    const keybindingService = accessor.get(IKeybindingService);
    const disposables = new DisposableStore();
    const container3 = layoutService.activeContainer;
    const mouseMarker = append(container3, $(".screencast-mouse"));
    disposables.add(toDisposable(() => mouseMarker.remove()));
    const keyboardMarker = append(container3, $(".screencast-keyboard"));
    disposables.add(toDisposable(() => keyboardMarker.remove()));
    const onMouseDown = disposables.add(new Emitter());
    const onMouseUp = disposables.add(new Emitter());
    const onMouseMove = disposables.add(new Emitter());
    function registerContainerListeners(container4, windowDisposables) {
      const listeners = new DisposableStore();
      listeners.add(listeners.add(new DomEmitter(container4, "mousedown", true)).event((e) => onMouseDown.fire(e)));
      listeners.add(listeners.add(new DomEmitter(container4, "mouseup", true)).event((e) => onMouseUp.fire(e)));
      listeners.add(listeners.add(new DomEmitter(container4, "mousemove", true)).event((e) => onMouseMove.fire(e)));
      windowDisposables.add(listeners);
      disposables.add(toDisposable(() => windowDisposables.delete(listeners)));
      disposables.add(listeners);
    }
    for (const { window: window2, disposables: disposables2 } of getWindows()) {
      registerContainerListeners(layoutService.getContainer(window2), disposables2);
    }
    disposables.add(onDidRegisterWindow(({ window: window2, disposables: disposables2 }) => registerContainerListeners(layoutService.getContainer(window2), disposables2)));
    disposables.add(layoutService.onDidChangeActiveContainer(() => {
      layoutService.activeContainer.appendChild(mouseMarker);
      layoutService.activeContainer.appendChild(keyboardMarker);
    }));
    const updateMouseIndicatorColor = () => {
      mouseMarker.style.borderColor = Color.fromHex(configurationService.getValue("screencastMode.mouseIndicatorColor")).toString();
    };
    let mouseIndicatorSize;
    const updateMouseIndicatorSize = () => {
      mouseIndicatorSize = clamp(configurationService.getValue("screencastMode.mouseIndicatorSize") || 20, 20, 100);
      mouseMarker.style.height = `${mouseIndicatorSize}px`;
      mouseMarker.style.width = `${mouseIndicatorSize}px`;
    };
    updateMouseIndicatorColor();
    updateMouseIndicatorSize();
    disposables.add(onMouseDown.event((e) => {
      mouseMarker.style.top = `${e.clientY - mouseIndicatorSize / 2}px`;
      mouseMarker.style.left = `${e.clientX - mouseIndicatorSize / 2}px`;
      mouseMarker.style.display = "block";
      mouseMarker.style.transform = `scale(${1})`;
      mouseMarker.style.transition = "transform 0.1s";
      const mouseMoveListener = onMouseMove.event((e2) => {
        mouseMarker.style.top = `${e2.clientY - mouseIndicatorSize / 2}px`;
        mouseMarker.style.left = `${e2.clientX - mouseIndicatorSize / 2}px`;
        mouseMarker.style.transform = `scale(${0.8})`;
      });
      Event2.once(onMouseUp.event)(() => {
        mouseMarker.style.display = "none";
        mouseMoveListener.dispose();
      });
    }));
    const updateKeyboardFontSize = () => {
      keyboardMarker.style.fontSize = `${clamp(configurationService.getValue("screencastMode.fontSize") || 56, 20, 100)}px`;
    };
    const updateKeyboardMarker = () => {
      keyboardMarker.style.bottom = `${clamp(configurationService.getValue("screencastMode.verticalOffset") || 0, 0, 90)}%`;
    };
    let keyboardMarkerTimeout;
    const updateKeyboardMarkerTimeout = () => {
      keyboardMarkerTimeout = clamp(configurationService.getValue("screencastMode.keyboardOverlayTimeout") || 800, 500, 5e3);
    };
    updateKeyboardFontSize();
    updateKeyboardMarker();
    updateKeyboardMarkerTimeout();
    disposables.add(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("screencastMode.verticalOffset")) {
        updateKeyboardMarker();
      }
      if (e.affectsConfiguration("screencastMode.fontSize")) {
        updateKeyboardFontSize();
      }
      if (e.affectsConfiguration("screencastMode.keyboardOverlayTimeout")) {
        updateKeyboardMarkerTimeout();
      }
      if (e.affectsConfiguration("screencastMode.mouseIndicatorColor")) {
        updateMouseIndicatorColor();
      }
      if (e.affectsConfiguration("screencastMode.mouseIndicatorSize")) {
        updateMouseIndicatorSize();
      }
    }));
    const onKeyDown = disposables.add(new Emitter());
    const onCompositionStart = disposables.add(new Emitter());
    const onCompositionUpdate = disposables.add(new Emitter());
    const onCompositionEnd = disposables.add(new Emitter());
    function registerWindowListeners(window2, windowDisposables) {
      const listeners = new DisposableStore();
      listeners.add(listeners.add(new DomEmitter(window2, "keydown", true)).event((e) => onKeyDown.fire(e)));
      listeners.add(listeners.add(new DomEmitter(window2, "compositionstart", true)).event((e) => onCompositionStart.fire(e)));
      listeners.add(listeners.add(new DomEmitter(window2, "compositionupdate", true)).event((e) => onCompositionUpdate.fire(e)));
      listeners.add(listeners.add(new DomEmitter(window2, "compositionend", true)).event((e) => onCompositionEnd.fire(e)));
      windowDisposables.add(listeners);
      disposables.add(toDisposable(() => windowDisposables.delete(listeners)));
      disposables.add(listeners);
    }
    for (const { window: window2, disposables: disposables2 } of getWindows()) {
      registerWindowListeners(window2, disposables2);
    }
    disposables.add(onDidRegisterWindow(({ window: window2, disposables: disposables2 }) => registerWindowListeners(window2, disposables2)));
    let length = 0;
    let composing = void 0;
    let imeBackSpace = false;
    const clearKeyboardScheduler = disposables.add(new RunOnceScheduler(() => {
      keyboardMarker.textContent = "";
      composing = void 0;
      length = 0;
    }, keyboardMarkerTimeout));
    disposables.add(onCompositionStart.event((e) => {
      imeBackSpace = true;
    }));
    disposables.add(onCompositionUpdate.event((e) => {
      if (e.data && imeBackSpace) {
        if (length > 20) {
          keyboardMarker.innerText = "";
          length = 0;
        }
        composing = composing ?? append(keyboardMarker, $("span.key"));
        composing.textContent = e.data;
      } else if (imeBackSpace) {
        keyboardMarker.innerText = "";
        append(keyboardMarker, $("span.key", {}, `Backspace`));
      }
      clearKeyboardScheduler.schedule(keyboardMarkerTimeout);
    }));
    disposables.add(onCompositionEnd.event((e) => {
      composing = void 0;
      length++;
    }));
    disposables.add(onKeyDown.event((e) => {
      if (e.key === "Process" || /[\uac00-\ud787\u3131-\u314e\u314f-\u3163\u3041-\u3094\u30a1-\u30f4\u30fc\u3005\u3006\u3024\u4e00-\u9fa5]/u.test(e.key)) {
        if (e.code === "Backspace") {
          imeBackSpace = true;
        } else if (!e.code.includes("Key")) {
          composing = void 0;
          imeBackSpace = false;
        } else {
          imeBackSpace = true;
        }
        clearKeyboardScheduler.schedule(keyboardMarkerTimeout);
        return;
      }
      if (e.isComposing) {
        return;
      }
      const options3 = configurationService.getValue("screencastMode.keyboardOptions");
      const event = new StandardKeyboardEvent(e);
      const shortcut = keybindingService.softDispatch(event, event.target);
      if (shortcut.kind === 2 /* KbFound */ && shortcut.commandId && !(options3.showSingleEditorCursorMoves ?? true) && ["cursorLeft", "cursorRight", "cursorUp", "cursorDown"].includes(shortcut.commandId)) {
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || length > 20 || event.keyCode === 1 /* Backspace */ || event.keyCode === 9 /* Escape */ || event.keyCode === 16 /* UpArrow */ || event.keyCode === 18 /* DownArrow */ || event.keyCode === 15 /* LeftArrow */ || event.keyCode === 17 /* RightArrow */) {
        keyboardMarker.innerText = "";
        length = 0;
      }
      const keybinding = keybindingService.resolveKeyboardEvent(event);
      const commandDetails = this._isKbFound(shortcut) && shortcut.commandId ? this.getCommandDetails(shortcut.commandId) : void 0;
      let commandAndGroupLabel = commandDetails?.title;
      let keyLabel = keybinding.getLabel();
      if (commandDetails) {
        if ((options3.showCommandGroups ?? false) && commandDetails.category) {
          commandAndGroupLabel = `${commandDetails.category}: ${commandAndGroupLabel} `;
        }
        if (this._isKbFound(shortcut) && shortcut.commandId) {
          const keybindings = keybindingService.lookupKeybindings(shortcut.commandId).filter((k) => k.getLabel()?.endsWith(keyLabel ?? ""));
          if (keybindings.length > 0) {
            keyLabel = keybindings[keybindings.length - 1].getLabel();
          }
        }
      }
      if ((options3.showCommands ?? true) && commandAndGroupLabel) {
        append(keyboardMarker, $("span.title", {}, `${commandAndGroupLabel} `));
      }
      if ((options3.showKeys ?? true) || (options3.showKeybindings ?? true) && this._isKbFound(shortcut)) {
        keyLabel = keyLabel?.replace("UpArrow", "\u2191")?.replace("DownArrow", "\u2193")?.replace("LeftArrow", "\u2190")?.replace("RightArrow", "\u2192");
        append(keyboardMarker, $("span.key", {}, keyLabel ?? ""));
      }
      length++;
      clearKeyboardScheduler.schedule(keyboardMarkerTimeout);
    }));
    _ToggleScreencastModeAction.disposable = disposables;
  }
  _isKbFound(resolutionResult) {
    return resolutionResult.kind === 2 /* KbFound */;
  }
  getCommandDetails(commandId) {
    const fromMenuRegistry = MenuRegistry.getCommand(commandId);
    if (fromMenuRegistry) {
      return {
        title: typeof fromMenuRegistry.title === "string" ? fromMenuRegistry.title : fromMenuRegistry.title.value,
        category: fromMenuRegistry.category ? typeof fromMenuRegistry.category === "string" ? fromMenuRegistry.category : fromMenuRegistry.category.value : void 0
      };
    }
    const fromCommandsRegistry = CommandsRegistry.getCommand(commandId);
    if (fromCommandsRegistry?.metadata?.description) {
      return { title: typeof fromCommandsRegistry.metadata.description === "string" ? fromCommandsRegistry.metadata.description : fromCommandsRegistry.metadata.description.value };
    }
    return void 0;
  }
};

var LogStorageAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.logStorage",
      title: localize2(5922, "Log Storage Database Contents"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const storageService = accessor.get(IStorageService);
    const dialogService = accessor.get(IDialogService);
    storageService.log();
    dialogService.info(localize(5954, null), localize(5953, null));
  }
};

var LogWorkingCopiesAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.logWorkingCopies",
      title: localize2(5923, "Log Working Copies"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const workingCopyService = accessor.get(IWorkingCopyService);
    const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
    const logService = accessor.get(ILogService);
    const outputService = accessor.get(IOutputService);
    const backups = await workingCopyBackupService.getBackups();
    const msg = [
      ``,
      `[Working Copies]`,
      ...workingCopyService.workingCopies.length > 0 ? workingCopyService.workingCopies.map((workingCopy) => `${workingCopy.isDirty() ? "\u25CF " : ""}${workingCopy.resource.toString(true)} (typeId: ${workingCopy.typeId || "<no typeId>"})`) : ["<none>"],
      ``,
      `[Backups]`,
      ...backups.length > 0 ? backups.map((backup) => `${backup.resource.toString(true)} (typeId: ${backup.typeId || "<no typeId>"})`) : ["<none>"]
    ];
    logService.info(msg.join("\n"));
    outputService.showChannel(windowLogId, true);
  }
};

var RemoveLargeStorageEntriesAction = class _RemoveLargeStorageEntriesAction extends Action2 {
  static {
    this.SIZE_THRESHOLD = 1024 * 16;
  }
  // 16kb
  constructor() {
    super({
      id: "workbench.action.removeLargeStorageDatabaseEntries",
      title: localize2(5931, "Remove Large Storage Database Entries..."),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const storageService = accessor.get(IStorageService);
    const quickInputService = accessor.get(IQuickInputService);
    const userDataProfileService = accessor.get(IUserDataProfileService);
    const dialogService = accessor.get(IDialogService);
    const environmentService = accessor.get(IEnvironmentService);
    const items = [];
    for (const scope of [-1 /* APPLICATION */, 0 /* PROFILE */, 1 /* WORKSPACE */]) {
      if (scope === 0 /* PROFILE */ && userDataProfileService.currentProfile.isDefault) {
        continue;
      }
      for (const target of [1 /* MACHINE */, 0 /* USER */]) {
        for (const key3 of storageService.keys(scope, target)) {
          const value2 = storageService.get(key3, scope);
          if (value2 && (!environmentService.isBuilt || value2.length > _RemoveLargeStorageEntriesAction.SIZE_THRESHOLD)) {
            items.push({
              key: key3,
              scope,
              target,
              size: value2.length,
              label: key3,
              description: ByteSize.formatSize(value2.length),
              detail: localize(5921, null, scope === -1 /* APPLICATION */ ? localize(5919, null) : scope === 0 /* PROFILE */ ? localize(5930, null) : localize(5962, null), target === 1 /* MACHINE */ ? localize(5924, null) : localize(5961, null))
            });
          }
        }
      }
    }
    items.sort((itemA, itemB) => itemB.size - itemA.size);
    const selectedItems = await new Promise((resolve3) => {
      const disposables = new DisposableStore();
      const picker = disposables.add(quickInputService.createQuickPick());
      picker.items = items;
      picker.canSelectMany = true;
      picker.ok = false;
      picker.customButton = true;
      picker.hideCheckAll = true;
      picker.customLabel = localize(5935, null);
      picker.placeholder = localize(5937, null);
      if (items.length === 0) {
        picker.description = localize(5936, null);
      }
      picker.show();
      disposables.add(picker.onDidCustom(() => {
        resolve3(picker.selectedItems);
        picker.hide();
      }));
      disposables.add(picker.onDidHide(() => disposables.dispose()));
    });
    if (selectedItems.length === 0) {
      return;
    }
    const { confirmed } = await dialogService.confirm({
      type: "warning",
      message: localize(5933, null),
      detail: localize(5934, null, selectedItems.map((item) => item.label).join("\n")),
      primaryButton: localize(5932, null)
    });
    if (!confirmed) {
      return;
    }
    const scopesToOptimize = /* @__PURE__ */ new Set();
    for (const item of selectedItems) {
      storageService.remove(item.key, item.scope);
      scopesToOptimize.add(item.scope);
    }
    for (const scope of scopesToOptimize) {
      await storageService.optimize(scope);
    }
  }
};

var tracker = void 0;

var trackedDisposables = /* @__PURE__ */ new Set();

var DisposablesSnapshotStateContext = new RawContextKey("dirtyWorkingCopies", "stopped");

var StartTrackDisposables = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.startTrackDisposables",
      title: localize2(5951, "Start Tracking Disposables"),
      category: Categories.Developer,
      f1: true,
      precondition: ContextKeyExpr.and(DisposablesSnapshotStateContext.isEqualTo("pending").negate(), DisposablesSnapshotStateContext.isEqualTo("started").negate())
    });
  }
  run(accessor) {
    const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(IContextKeyService));
    disposablesSnapshotStateContext.set("started");
    trackedDisposables.clear();
    tracker = new DisposableTracker();
    setDisposableTracker(tracker);
  }
};

var SnapshotTrackedDisposables = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.snapshotTrackedDisposables",
      title: localize2(5950, "Snapshot Tracked Disposables"),
      category: Categories.Developer,
      f1: true,
      precondition: DisposablesSnapshotStateContext.isEqualTo("started")
    });
  }
  run(accessor) {
    const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(IContextKeyService));
    disposablesSnapshotStateContext.set("pending");
    trackedDisposables = new Set(tracker?.computeLeakingDisposables(1e3)?.leaks.map((disposable) => disposable.value));
  }
};

var StopTrackDisposables = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.stopTrackDisposables",
      title: localize2(5952, "Stop Tracking Disposables"),
      category: Categories.Developer,
      f1: true,
      precondition: DisposablesSnapshotStateContext.isEqualTo("pending")
    });
  }
  run(accessor) {
    const editorService = accessor.get(IEditorService);
    const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(IContextKeyService));
    disposablesSnapshotStateContext.set("stopped");
    if (tracker) {
      const disposableLeaks = /* @__PURE__ */ new Set();
      for (const disposable of new Set(tracker.computeLeakingDisposables(1e3)?.leaks) ?? []) {
        if (trackedDisposables.has(disposable.value)) {
          disposableLeaks.add(disposable);
        }
      }
      const leaks = tracker.computeLeakingDisposables(1e3, Array.from(disposableLeaks));
      if (leaks) {
        editorService.openEditor({ resource: void 0, contents: leaks.details });
      }
    }
    setDisposableTracker(null);
    tracker = void 0;
    trackedDisposables.clear();
  }
};

function managedSettingsSourceLabel(source) {
  switch (source) {
    case "server":
      return "GitHub Server API";
    case "nativeMdm":
      return "Native MDM";
    case "file":
      return "File (managed-settings.json)";
    case "none":
      return "None (no managed settings active)";
  }
}

function managedSettingsSourceShortLabel(source) {
  switch (source) {
    case "server":
      return "Server";
    case "nativeMdm":
      return "Native MDM";
    case "file":
      return "File";
    case "none":
      return "None";
  }
}

function policyValueSourceLabel(source) {
  switch (source) {
    case "device" /* Device */:
      return "Device";
    case "nativeMdm" /* NativeMdm */:
      return "Managed Settings: Native MDM";
    case "serverManagedSettings" /* ServerManagedSettings */:
      return "Managed Settings: Server";
    case "fileManagedSettings" /* FileManagedSettings */:
      return "Managed Settings: File";
    case "mixedManagedSettings" /* MixedManagedSettings */:
      return "Managed Settings: Mixed";
    case "account" /* Account */:
      return "Account";
    case "accountGate" /* AccountGate */:
      return "Account Policy Gate";
    case void 0:
      return "Unknown";
  }
}

function managedSettingsPipeline(rawLabel, raw, normalized, projected, rawUnavailableMessage) {
  let content2 = `**${markdownText(rawLabel)}**

`;
  content2 += raw === void 0 ? `*${markdownText(rawUnavailableMessage ?? "Unavailable")}*

` : markdownJsonBlock(raw);
  content2 += "**Normalized bag**\n\n";
  content2 += markdownJsonBlock(normalized);
  content2 += "**VS Code policy projection**\n\n";
  content2 += markdownJsonBlock(projected);
  return markdownDetails("Source, normalized, and VS Code projection", content2);
}

function formatDiagnosticValue(value2) {
  return JSON.stringify(value2) ?? String(value2);
}

var AGENT_RUNTIME_DIAGNOSTICS_TIMEOUT = 6e3;

var PolicyDiagnosticsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.showPolicyDiagnostics",
      title: localize2(5925, "Policy Diagnostics"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const commandService = accessor.get(ICommandService);
    const notificationService = accessor.get(INotificationService);
    const configurationService = accessor.get(IConfigurationService);
    const productService = accessor.get(IProductService);
    const defaultAccountService = accessor.get(IDefaultAccountService);
    const authenticationService = accessor.get(IAuthenticationService);
    const authenticationAccessService = accessor.get(IAuthenticationAccessService);
    const policyService = accessor.get(IPolicyService);
    const accountPolicyGateService = accessor.get(IAccountPolicyGateService);
    const agentHostService = accessor.get(IAgentHostService);
    const agentHostEnablementService = accessor.get(IAgentHostEnablementService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const progressService = accessor.get(IProgressService);
    let nativeManagedSettingsService;
    try {
      nativeManagedSettingsService = accessor.get(INativeManagedSettingsService);
    } catch {
    }
    let fileManagedSettingsService;
    try {
      fileManagedSettingsService = accessor.get(IFileManagedSettingsService);
    } catch {
    }
    return progressService.withProgress({
      location: 15 /* Notification */,
      title: localize(5929, null),
      type: "loading"
    }, () => this.openPolicyDiagnostics({
      editorService,
      commandService,
      notificationService,
      configurationService,
      productService,
      defaultAccountService,
      authenticationService,
      authenticationAccessService,
      policyService,
      accountPolicyGateService,
      agentHostService,
      agentHostEnablementService,
      workspaceContextService,
      nativeManagedSettingsService,
      fileManagedSettingsService
    }));
  }
  async openPolicyDiagnostics(services) {
    const {
      editorService,
      commandService,
      notificationService,
      configurationService,
      productService,
      defaultAccountService,
      authenticationService,
      authenticationAccessService,
      policyService,
      accountPolicyGateService,
      agentHostService,
      agentHostEnablementService,
      workspaceContextService,
      nativeManagedSettingsService,
      fileManagedSettingsService
    } = services;
    const configurationRegistry30 = Registry.as(Extensions4.Configuration);
    const summary = {
      accountPolicyGate: "Unavailable",
      managedSettingsSources: "Unavailable",
      effectiveManagedSettings: "Unavailable",
      managedSettingsIssues: "Unavailable",
      agentRuntime: "Unavailable",
      chatHarnessEnforcement: "Unavailable",
      policyControlledSettings: "Unavailable"
    };
    let content2 = "";
    content2 += "## System Information\n\n";
    content2 += markdownTable(
      ["Property", "Value"],
      [
        ["Generated", (/* @__PURE__ */ new Date()).toISOString()],
        ["Product", `${productService.nameLong} ${productService.version}`],
        ["Commit", productService.commit || "n/a"]
      ]
    );
    content2 += "## Account Information\n\n";
    try {
      const account = await defaultAccountService.getDefaultAccount();
      const sensitiveKeys = ["sessionId", "analytics_tracking_id"];
      if (account) {
        let username = "Unknown";
        let accountLabel = "Unknown";
        try {
          const providerIds = authenticationService.getProviderIds();
          for (const providerId of providerIds) {
            const sessions = await authenticationService.getSessions(providerId);
            const matchingSession = sessions.find((session) => session.id === account.sessionId);
            if (matchingSession) {
              username = matchingSession.account.id;
              accountLabel = matchingSession.account.label;
              break;
            }
          }
        } catch (error) {
        }
        content2 += "### Default Account Summary\n\n";
        content2 += markdownTable(
          ["Property", "Value"],
          [
            ["Account ID/Username", username],
            ["Account Label", accountLabel]
          ]
        );
        const accountPropertyRows = [];
        for (const [key3, value2] of Object.entries(account)) {
          if (value2 !== void 0 && value2 !== null) {
            const displayValue = sensitiveKeys.includes(key3) ? "***" : typeof value2 === "object" ? formatDiagnosticValue(value2) : String(value2);
            accountPropertyRows.push([key3, displayValue]);
          }
        }
        const policyData = defaultAccountService.policyData;
        accountPropertyRows.push(["policyData", policyData ? formatDiagnosticValue(policyData) : "No Policy Data"]);
        content2 += markdownDetails(
          "Detailed account properties",
          markdownTable(["Property", "Value"], accountPropertyRows)
        );
      } else {
        content2 += "*No default account configured*\n\n";
      }
    } catch (error) {
      content2 += `*Error retrieving account information: ${markdownText(getErrorMessage(error))}*

`;
    }
    content2 += "## Account Policy Gate\n\n";
    try {
      const gateInfo = accountPolicyGateService.gateInfo;
      const approvedOrgsRaw = policyService.getPolicyValue(APPROVED_ACCOUNT_ORGANIZATIONS_POLICY_NAME);
      summary.accountPolicyGate = gateInfo.reason ? `${gateInfo.state} (${gateInfo.reason})` : gateInfo.state;
      content2 += markdownTable(
        ["Property", "Value"],
        [
          ["State", gateInfo.state],
          ["Reason", gateInfo.reason ?? "n/a"],
          [APPROVED_ACCOUNT_ORGANIZATIONS_POLICY_NAME, approvedOrgsRaw !== void 0 ? String(approvedOrgsRaw) : "not set"]
        ]
      );
      content2 += "**Legend**\n\n";
      content2 += "- `inactive`: gate disabled (no approved orgs configured) \u2014 policies behave as account data dictates.\n";
      content2 += "- `satisfied`: gate active and approved \u2014 account policy values flow normally.\n";
      content2 += "- `restricted`: gate active and not satisfied \u2014 opted-in policies forced to their restricted value.\n";
      content2 += "  - `noAccount`: no default account signed in.\n";
      content2 += "  - `wrongProvider`: signed in with a non-GitHub provider.\n";
      content2 += "  - `orgNotApproved`: signed in but account is not a member of any approved organization.\n";
      content2 += "  - `policyNotResolved`: signed in to an approved org but account-side policy data has not yet been fetched.\n\n";
    } catch (error) {
      content2 += `*Error retrieving account policy gate info: ${markdownText(getErrorMessage(error))}*

`;
    }
    content2 += "## Managed Settings\n\n";
    try {
      const policyData = defaultAccountService.policyData;
      const serverManagedSettings = policyData?.managedSettings ?? {};
      const nativeManagedSettings = nativeManagedSettingsService?.managedSettings ?? {};
      const fileManagedSettings = fileManagedSettingsService?.managedSettings ?? {};
      const fileRawManagedSettings = fileManagedSettingsService?.rawManagedSettings;
      const declaredDefinitions = {};
      for (const property of [...Object.values(configurationRegistry30.getConfigurationProperties()), ...Object.values(configurationRegistry30.getExcludedConfigurationProperties())]) {
        const declared = property.policy?.managedSettings;
        if (declared) {
          Object.assign(declaredDefinitions, declared);
        }
      }
      const pick = pickManagedSettings(nativeManagedSettings, serverManagedSettings, fileManagedSettings);
      const parseErrors = [];
      const projectChannel = (channel, values) => projectManagedSettings(
        values,
        declaredDefinitions,
        (message) => parseErrors.push({ stage: `${channel}: project`, message })
      );
      const channelContributes = (channel) => pick.activeSources.includes(channel);
      const nativeProjected = projectChannel("nativeMdm", nativeManagedSettings);
      const serverProjected = projectChannel("server", serverManagedSettings);
      const fileProjected = projectChannel("file", fileManagedSettings);
      const effective = projectManagedSettings(pick.values, declaredDefinitions, (message) => parseErrors.push({ stage: "effective: project", message }));
      const rawResponse = defaultAccountService.managedSettingsRawResponse;
      if (isObject(rawResponse)) {
        adaptManagedSettings(rawResponse, (message) => parseErrors.push({ stage: "adapt", message }));
      }
      if (fileRawManagedSettings) {
        normalizeManagedSettings(fileRawManagedSettings, (message) => parseErrors.push({ stage: "file: normalize", message }));
      }
      for (const key3 of [COPILOT_ENABLED_PLUGINS_KEY, COPILOT_STRICT_MARKETPLACES_KEY, COPILOT_EXTRA_MARKETPLACES_KEY]) {
        const value2 = effective[key3];
        if (typeof value2 !== "string") {
          continue;
        }
        const jsonErrors = [];
        parse5(value2, jsonErrors);
        for (const error of jsonErrors) {
          parseErrors.push({ stage: "parse", message: `${key3} @ offset ${error.offset}: ${getParseErrorMessage(error.error)}` });
        }
      }
      const activeSources = pick.activeSources.length > 0 ? pick.activeSources.map(managedSettingsSourceLabel).join(", ") : managedSettingsSourceLabel("none");
      const effectiveKeyCount = Object.keys(effective).length;
      summary.managedSettingsSources = activeSources;
      summary.effectiveManagedSettings = `${effectiveKeyCount} ${effectiveKeyCount === 1 ? "key" : "keys"}`;
      summary.managedSettingsIssues = `${parseErrors.length} ${parseErrors.length === 1 ? "issue" : "issues"}`;
      content2 += markdownTable(
        ["Property", "Value"],
        [
          ["Active sources (precedence order)", activeSources],
          ["Supplied keys", String(pick.resolutions.size)],
          ["Effective VS Code policy keys", String(effectiveKeyCount)]
        ]
      );
      content2 += "*Precedence is resolved per key: native MDM wins over the server endpoint, which wins over the file on disk. A key left unset by a higher channel is still filled in by a lower one.*\n\n";
      content2 += "### Effective Resolution\n\n";
      if (pick.resolutions.size > 0) {
        const resolutions = [...pick.resolutions.entries()].sort(([first2], [second]) => first2.localeCompare(second));
        content2 += markdownTable(
          ["Key", "Effective Value", "Winning Source"],
          resolutions.map(([key3, resolution]) => [
            key3,
            formatDiagnosticValue(resolution.value),
            managedSettingsSourceShortLabel(resolution.source)
          ])
        );
        const contributionRows = resolutions.flatMap(([key3, resolution]) => resolution.contributions.map((contribution) => [
          key3,
          managedSettingsSourceShortLabel(contribution.channel),
          formatDiagnosticValue(contribution.value),
          contribution.channel === resolution.source ? "Effective" : "Overridden"
        ]));
        content2 += markdownDetails(
          "Per-channel contributions",
          markdownTable(["Key", "Source", "Value", "Status"], contributionRows)
        );
      } else {
        content2 += "*No managed-settings keys are supplied by any channel.*\n\n";
      }
      content2 += markdownDetails("Merged normalized bag", markdownJsonBlock(pick.values));
      content2 += markdownDetails("Effective VS Code policy bag", markdownJsonBlock(effective));
      content2 += `### Normalization and Parse Issues (${parseErrors.length})

`;
      if (parseErrors.length > 0) {
        content2 += markdownTable(
          ["Stage", "Message"],
          parseErrors.map(({ stage, message }) => [stage, message])
        );
      } else {
        content2 += "*None.*\n\n";
      }
      content2 += "### Delivery Channel Details\n\n";
      content2 += "#### Native MDM\n\n";
      content2 += markdownTable(
        ["Property", "Value"],
        [
          ["Available", nativeManagedSettingsService ? "yes" : "no"],
          ["Contributes winning keys", channelContributes("nativeMdm") ? "yes" : "no"]
        ]
      );
      if (nativeManagedSettingsService) {
        content2 += "*The native policy watcher exposes only declared scalar keys, so its source values are already definition-scoped and canonical.*\n\n";
        content2 += managedSettingsPipeline("Source values (definition-scoped)", nativeManagedSettings, nativeManagedSettings, nativeProjected);
      }
      const fetchStatus = defaultAccountService.managedSettingsFetchStatus;
      const fetchedAt = defaultAccountService.managedSettingsFetchedAt;
      const clientIdentity = appendManagedSettingsClientIdentity("https://api.github.com/copilot_internal/managed_settings", productService);
      const compatibilityError = defaultAccountService.managedSettingsCompatibilityError;
      const freshness = defaultAccountService.managedSettingsFreshness;
      const freshnessScope = freshness.state === "notRequired" ? void 0 : freshness.scope;
      const freshnessFailure = freshness.state === "blocked" ? freshness.failure === "httpError" ? `${freshness.failure} (${freshness.httpStatus})` : freshness.failure : "none";
      content2 += "#### GitHub Server API\n\n";
      content2 += markdownTable(
        ["Property", "Value"],
        [
          ["Endpoint", "/copilot_internal/managed_settings"],
          ["Last fetch", fetchStatus === null ? "never" : `${fetchStatus}${fetchedAt ? ` at ${new Date(fetchedAt).toLocaleString()}` : ""}`],
          ["Freshness", freshness.state],
          ["Freshness source", freshness.state === "notRequired" ? "none" : freshness.source],
          ["Last freshness attempt", freshness.state !== "notRequired" && freshness.lastAttemptAt ? new Date(freshness.lastAttemptAt).toLocaleString() : "never"],
          ["Freshness failure", freshnessFailure],
          ["Freshness scope", freshnessScope ? `${freshnessScope.authenticationProviderId} at ${freshnessScope.endpointOrigin}` : "none"],
          ["Client identity", new URL(clientIdentity).search.replace(/^\?/, "")],
          ["Compatibility", compatibilityError ? `update required (${compatibilityError.clientVersion ?? "?"} \u2192 ${compatibilityError.minimumClientVersion ?? "?"})` : "compatible or not evaluated"],
          ["Contributes winning keys", channelContributes("server") ? "yes" : "no"]
        ]
      );
      content2 += managedSettingsPipeline(
        "Raw response (last successful fetch)",
        isObject(rawResponse) ? rawResponse : void 0,
        serverManagedSettings,
        serverProjected,
        "No successful managed-settings response has been captured."
      );
      content2 += "#### File (managed-settings.json)\n\n";
      content2 += markdownTable(
        ["Property", "Value"],
        [
          ["Available", fileManagedSettingsService ? "yes" : "no"],
          ["Contributes winning keys", channelContributes("file") ? "yes" : "no"]
        ]
      );
      if (fileManagedSettingsService) {
        content2 += managedSettingsPipeline("Raw parsed file", fileRawManagedSettings, fileManagedSettings, fileProjected);
      }
      content2 += markdownDetails(
        "VS Code managed-settings schema",
        "*Only keys declared here can reach VS Code policy callbacks. Runtime-owned keys may still be enforced by the Copilot runtime even when absent from the projections above.*\n\n" + markdownJsonBlock(declaredDefinitions)
      );
      content2 += "### Agent Runtime Resolution\n\n";
      content2 += "*Resolved independently by each provider through its own SDK/runtime. This may include runtime-owned keys that VS Code does not declare as configuration policies.*\n\n";
      if (!agentHostEnablementService.enabled.get()) {
        summary.agentRuntime = "Agent Host disabled";
        content2 += "*Agent Host is disabled; runtime managed-settings diagnostics were not queried.*\n\n";
      } else {
        try {
          const runtimeDiagnostics = await raceTimeout(agentHostService.getManagedSettingsDiagnostics(), AGENT_RUNTIME_DIAGNOSTICS_TIMEOUT);
          if (!runtimeDiagnostics) {
            summary.agentRuntime = "Timed out";
            content2 += "*The Agent Host did not return provider diagnostics within 6 seconds. The report continued without a runtime snapshot; check the Agent Host log for a stalled provider.*\n\n";
          } else if (runtimeDiagnostics.length === 0) {
            summary.agentRuntime = "No provider diagnostics";
            content2 += "*No agent provider exposes managed-settings diagnostics.*\n\n";
          } else {
            const failedProviderCount = runtimeDiagnostics.filter((diagnostic) => diagnostic.error).length;
            summary.agentRuntime = `${runtimeDiagnostics.length} ${runtimeDiagnostics.length === 1 ? "provider" : "providers"}, ${failedProviderCount} failed`;
            for (const diagnostic of runtimeDiagnostics) {
              content2 += `#### ${markdownText(diagnostic.provider)}

`;
              if (diagnostic.error) {
                content2 += `*Probe failed: ${markdownText(diagnostic.error)}*

`;
              } else {
                content2 += markdownDetails("Resolved settings snapshot", markdownJsonBlock(diagnostic.snapshot));
              }
            }
          }
        } catch (error) {
          const message = getErrorMessage(error);
          summary.agentRuntime = `Unavailable (${message})`;
          content2 += `*Agent runtime diagnostics unavailable: ${markdownText(message)}*

`;
        }
      }
    } catch (error) {
      content2 += `*Error rendering managed settings diagnostics: ${markdownText(getErrorMessage(error))}*

`;
    }
    content2 += "## Policy-Controlled Settings\n\n";
    const policyConfigurations = configurationRegistry30.getPolicyConfigurations();
    const policyReferenceConfigurations = configurationRegistry30.getPolicyReferenceConfigurations();
    const configurationProperties = configurationRegistry30.getConfigurationProperties();
    const excludedProperties = configurationRegistry30.getExcludedConfigurationProperties();
    if (policyConfigurations.size > 0 || policyReferenceConfigurations.size > 0) {
      const appliedPolicy = [];
      const notAppliedPolicy = [];
      const collectPolicySetting = (policyName, settingKey) => {
        const property = configurationProperties[settingKey] ?? excludedProperties[settingKey];
        if (property) {
          const inspectValue2 = configurationService.inspect(settingKey);
          const settingInfo = {
            name: policyName,
            key: settingKey,
            property,
            inspection: inspectValue2
          };
          if (inspectValue2.policyValue !== void 0) {
            appliedPolicy.push(settingInfo);
          } else {
            notAppliedPolicy.push(settingInfo);
          }
        }
      };
      for (const [policyName, settingKey] of policyConfigurations) {
        collectPolicySetting(policyName, settingKey);
      }
      for (const [policyName, settingKeys] of policyReferenceConfigurations) {
        for (const settingKey of settingKeys) {
          collectPolicySetting(policyName, settingKey);
        }
      }
      const getPolicySource = (policyName) => policyValueSourceLabel(policyService.getPolicyValueSource(policyName));
      content2 += "### Applied Policy\n\n";
      appliedPolicy.sort((a, b) => getPolicySource(a.name).localeCompare(getPolicySource(b.name)) || a.name.localeCompare(b.name));
      notAppliedPolicy.sort((a, b) => a.name.localeCompare(b.name) || a.key.localeCompare(b.key));
      summary.policyControlledSettings = `${appliedPolicy.length} applied, ${notAppliedPolicy.length} not applied`;
      if (appliedPolicy.length > 0) {
        content2 += markdownTable(
          ["Setting Key", "Policy Name", "Policy Source"],
          appliedPolicy.map((setting) => [
            setting.key,
            setting.name,
            getPolicySource(setting.name)
          ])
        );
        let policyDetails = "";
        for (const setting of appliedPolicy) {
          const managedSettingsKeys = setting.property.policy?.managedSettings ? Object.keys(setting.property.policy.managedSettings).join(", ") : "";
          policyDetails += `**${markdownText(setting.key)}**

`;
          policyDetails += markdownTable(
            ["Property", "Value"],
            [
              ["Policy name", setting.name],
              ["Policy source", getPolicySource(setting.name)],
              ["Managed settings", managedSettingsKeys || "n/a"],
              ["Default value", formatDiagnosticValue(setting.property.default)],
              ["Current value", formatDiagnosticValue(setting.inspection.value)],
              ["Policy value", formatDiagnosticValue(setting.inspection.policyValue)]
            ]
          );
        }
        content2 += markdownDetails("Applied policy values and configuration details", policyDetails);
      } else {
        content2 += "*No settings are currently controlled by policies*\n\n";
      }
      content2 += "### Non-applied Policy\n\n";
      if (notAppliedPolicy.length > 0) {
        content2 += markdownTable(
          ["Setting Key", "Policy Name"],
          notAppliedPolicy.map((setting) => [setting.key, setting.name])
        );
      } else {
        content2 += "*All policy-controllable settings are currently being enforced*\n\n";
      }
    } else {
      summary.policyControlledSettings = "No policy-controlled settings found";
      content2 += "*No policy-controlled settings found*\n\n";
    }
    content2 += "## Chat Harness Enforcement\n\n";
    try {
      const sandboxEnforced = agentHostEnablementService.managedSandboxEnforced.get();
      const virtualWorkspace = isVirtualWorkspace(workspaceContextService.getWorkspace());
      const agentHostEnabled = agentHostEnablementService.enabled.get();
      if (!sandboxEnforced) {
        summary.chatHarnessEnforcement = "Not enforced";
      } else if (virtualWorkspace) {
        summary.chatHarnessEnforcement = "Mandated, not applied (virtual workspace)";
      } else if (!agentHostEnabled) {
        summary.chatHarnessEnforcement = "Mandated, not applied (Agent Host disabled)";
      } else {
        summary.chatHarnessEnforcement = "Local harness hidden, new chats use the Agent Host Copilot SDK";
      }
      content2 += `**Effective decision:** ${summary.chatHarnessEnforcement}.

`;
    } catch (error) {
      const message = getErrorMessage(error);
      summary.chatHarnessEnforcement = `Unavailable (${message})`;
      content2 += `*Error resolving chat harness enforcement: ${markdownText(message)}*

`;
    }
    content2 += "## Authentication Information\n\n";
    try {
      const providerIds = authenticationService.getProviderIds();
      if (providerIds.length > 0) {
        content2 += "### Authentication Providers\n\n";
        const providerRows = [];
        let sessionDetails = "";
        for (const providerId of providerIds) {
          try {
            const sessions = await authenticationService.getSessions(providerId);
            const accounts = sessions.map((session) => session.account);
            const uniqueAccounts = Array.from(new Set(accounts.map((account) => account.label)));
            providerRows.push([providerId, String(sessions.length), uniqueAccounts.join(", ") || "None"]);
            if (sessions.length > 0) {
              sessionDetails += `**${markdownText(providerId)}**

`;
              const sessionRows = [];
              for (const session of sessions) {
                const accountName = session.account.label;
                const scopes = session.scopes.join(", ") || "Default";
                try {
                  const allowedExtensions = authenticationAccessService.readAllowedExtensions(providerId, accountName);
                  const extensionNames = allowedExtensions.filter((ext) => ext.allowed !== false).map((ext) => `${ext.name}${ext.trusted ? " (trusted)" : ""}`).join(", ") || "None";
                  sessionRows.push([accountName, scopes, extensionNames]);
                } catch (error) {
                  sessionRows.push([accountName, scopes, `Error: ${getErrorMessage(error)}`]);
                }
              }
              sessionDetails += markdownTable(["Account", "Scopes", "Extensions with Access"], sessionRows);
            }
          } catch (error) {
            const message = getErrorMessage(error);
            providerRows.push([providerId, "Error", message]);
            sessionDetails += `**${markdownText(providerId)}**

*Error retrieving sessions: ${markdownText(message)}*

`;
          }
        }
        content2 += markdownTable(["Provider ID", "Sessions", "Accounts"], providerRows);
        if (sessionDetails) {
          content2 += markdownDetails("Detailed session information", sessionDetails);
        }
      } else {
        content2 += "*No authentication providers found*\n\n";
      }
    } catch (error) {
      content2 += `*Error retrieving authentication information: ${markdownText(getErrorMessage(error))}*

`;
    }
    const report = "# VS Code Policy Diagnostics\n\n*WARNING: This file may contain sensitive information.*\n\n## Summary\n\n" + markdownTable(
      ["Diagnostic", "Result"],
      [
        ["Account policy gate", summary.accountPolicyGate],
        ["Managed-settings sources", summary.managedSettingsSources],
        ["Effective managed settings", summary.effectiveManagedSettings],
        ["Managed-settings issues", summary.managedSettingsIssues],
        ["Agent Runtime", summary.agentRuntime],
        ["Chat harness enforcement", summary.chatHarnessEnforcement],
        ["Policy-controlled settings", summary.policyControlledSettings]
      ]
    ) + content2;
    const resource = URI.from({
      scheme: Schemas.untitled,
      path: localize(5926, null),
      query: generateUuid()
    });
    const editorPane = await editorService.openEditor({
      resource,
      contents: report,
      languageId: "markdown",
      options: { pinned: true }
    });
    if (!editorPane) {
      notificationService.warn(localize(
        5928,
        null
      ));
      return;
    }
    try {
      await commandService.executeCommand("markdown.reopenAsPreview");
    } catch (error) {
      notificationService.warn(localize(
        5927,
        null,
        getErrorMessage(error)
      ));
    }
  }
};

var SyncAccountPolicyAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.syncAccountPolicy",
      title: localize2(5955, "Sync Account Policy"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const defaultAccountService = accessor.get(IDefaultAccountService);
    const dialogService = accessor.get(IDialogService);
    const logService = accessor.get(ILogService);
    try {
      logService.info("[DefaultAccount] Manually syncing account policy");
      await defaultAccountService.refresh({ forceRefresh: true, retryManagedSettings: true });
      if (isManagedSettingsFreshnessBlocking(defaultAccountService.managedSettingsFreshness)) {
        logService.warn("[DefaultAccount] Account policy sync completed without satisfying managed settings freshness");
        await dialogService.error(localize(5956, null), localize(5957, null));
        return;
      }
      await dialogService.info(localize(5959, null));
    } catch (error) {
      logService.error("[DefaultAccount] Failed to sync account policy", error);
      await dialogService.error(
        localize(5958, null),
        error instanceof Error ? error.message : String(error)
      );
    }
  }
};

registerAction2(InspectContextKeysAction);

registerAction2(ToggleScreencastModeAction);

registerAction2(LogStorageAction);

registerAction2(LogWorkingCopiesAction);

registerAction2(RemoveLargeStorageEntriesAction);

registerAction2(PolicyDiagnosticsAction);

registerAction2(SyncAccountPolicyAction);

if (!product_default.commit) {
  registerAction2(StartTrackDisposables);
  registerAction2(SnapshotTrackedDisposables);
  registerAction2(StopTrackDisposables);
}

var configurationRegistry6 = Registry.as(Extensions4.Configuration);

configurationRegistry6.registerConfiguration({
  id: "screencastMode",
  order: 9,
  title: localize(5949, null),
  type: "object",
  properties: {
    "screencastMode.verticalOffset": {
      type: "number",
      default: 20,
      minimum: 0,
      maximum: 90,
      description: localize(5946, null)
    },
    "screencastMode.fontSize": {
      type: "number",
      default: 56,
      minimum: 20,
      maximum: 100,
      description: localize(5938, null)
    },
    "screencastMode.keyboardOptions": {
      type: "object",
      description: localize(5939, null),
      properties: {
        "showKeys": {
          type: "boolean",
          default: true,
          description: localize(5943, null)
        },
        "showKeybindings": {
          type: "boolean",
          default: true,
          description: localize(5942, null)
        },
        "showCommands": {
          type: "boolean",
          default: true,
          description: localize(5941, null)
        },
        "showCommandGroups": {
          type: "boolean",
          default: false,
          description: localize(5940, null)
        },
        "showSingleEditorCursorMoves": {
          type: "boolean",
          default: true,
          description: localize(5944, null)
        }
      },
      default: {
        "showKeys": true,
        "showKeybindings": true,
        "showCommands": true,
        "showCommandGroups": false,
        "showSingleEditorCursorMoves": true
      },
      additionalProperties: false
    },
    "screencastMode.keyboardOverlayTimeout": {
      type: "number",
      default: 800,
      minimum: 500,
      maximum: 5e3,
      description: localize(5945, null)
    },
    "screencastMode.mouseIndicatorColor": {
      type: "string",
      format: "color-hex",
      default: "#FF0000",
      description: localize(5947, null)
    },
    "screencastMode.mouseIndicatorSize": {
      type: "number",
      default: 20,
      minimum: 20,
      maximum: 100,
      description: localize(5948, null)
    }
  }
});
export { managedSettingsSourceLabel, managedSettingsSourceShortLabel, policyValueSourceLabel, managedSettingsPipeline, formatDiagnosticValue, InspectContextKeysAction, ToggleScreencastModeAction, LogStorageAction, LogWorkingCopiesAction, RemoveLargeStorageEntriesAction, tracker, trackedDisposables, DisposablesSnapshotStateContext, StartTrackDisposables, SnapshotTrackedDisposables, StopTrackDisposables, AGENT_RUNTIME_DIAGNOSTICS_TIMEOUT, PolicyDiagnosticsAction, SyncAccountPolicyAction, configurationRegistry6 };
