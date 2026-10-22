// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalEditorInput.ts
import { EditorInput } from "./module-0928.mjs";
import { Emitter } from "./module-0017.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { ITerminalInstanceService, terminalEditorId } from "./module-1149.mjs";
import { severity_default } from "./module-0266.mjs";
import { localize } from "./module-0001.mjs";
import { dispose, toDisposable } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getColorClass, getUriClasses } from "./module-1175.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalEditorInput.ts
var TerminalEditorInput = class extends EditorInput {
  constructor(resource, _terminalInstance, _themeService, _terminalInstanceService, _instantiationService, _configurationService, _lifecycleService, _contextKeyService, _dialogService) {
    super();
    this.resource = resource;
    this._terminalInstance = _terminalInstance;
    this._themeService = _themeService;
    this._terminalInstanceService = _terminalInstanceService;
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._lifecycleService = _lifecycleService;
    this._contextKeyService = _contextKeyService;
    this._dialogService = _dialogService;
    this.closeHandler = this;
    this._isDetached = false;
    this._isShuttingDown = false;
    this._isReverted = false;
    this._onDidRequestAttach = this._register(new Emitter());
    this.onDidRequestAttach = this._onDidRequestAttach.event;
    this._terminalEditorFocusContextKey = TerminalContextKeys.editorFocus.bindTo(_contextKeyService);
    if (_terminalInstance) {
      this._setupInstanceListeners();
    }
  }
  static {
    this.ID = "workbench.editors.terminal";
  }
  setGroup(group2) {
    this._group = group2;
    if (group2?.scopedContextKeyService) {
      this._terminalInstance?.setParentContextKeyService(group2.scopedContextKeyService);
    }
  }
  get group() {
    return this._group;
  }
  get typeId() {
    return TerminalEditorInput.ID;
  }
  get editorId() {
    return terminalEditorId;
  }
  get capabilities() {
    return 2 /* Readonly */ | 1024 /* ForceReveal */ | 128 /* CanDropIntoEditor */ | 64 /* ForceDescription */;
  }
  setTerminalInstance(instance2) {
    if (this._terminalInstance) {
      throw new Error("cannot set instance that has already been set");
    }
    this._terminalInstance = instance2;
    this._setupInstanceListeners();
  }
  copy() {
    const instance2 = this._terminalInstanceService.createInstance(this._copyLaunchConfig || {}, 2 /* Editor */);
    instance2.focusWhenReady();
    this._copyLaunchConfig = void 0;
    return this._instantiationService.createInstance(TerminalEditorInput, instance2.resource, instance2);
  }
  /**
   * Sets the launch config to use for the next call to EditorInput.copy, which will be used when
   * the editor's split command is run.
   */
  setCopyLaunchConfig(launchConfig) {
    this._copyLaunchConfig = launchConfig;
  }
  /**
   * Returns the terminal instance for this input if it has not yet been detached from the input.
   */
  get terminalInstance() {
    return this._isDetached ? void 0 : this._terminalInstance;
  }
  showConfirm() {
    if (this._isReverted) {
      return false;
    }
    const confirmOnKill = this._configurationService.getValue("terminal.integrated.confirmOnKill" /* ConfirmOnKill */);
    if (confirmOnKill === "editor" || confirmOnKill === "always") {
      return this._terminalInstance?.hasChildProcesses || false;
    }
    return false;
  }
  async confirm(terminals) {
    const { confirmed } = await this._dialogService.confirm({
      type: severity_default.Warning,
      message: localize(19983, null),
      primaryButton: localize(19981, null),
      detail: terminals.length > 1 ? terminals.map((terminal2) => terminal2.editor.getName()).join("\n") + "\n\n" + localize(19984, null) : localize(19982, null)
    });
    return confirmed ? 1 /* DONT_SAVE */ : 2 /* CANCEL */;
  }
  async revert() {
    this._isReverted = true;
  }
  _setupInstanceListeners() {
    const instance2 = this._terminalInstance;
    if (!instance2) {
      return;
    }
    const instanceOnDidFocusListener = instance2.onDidFocus(() => this._terminalEditorFocusContextKey.set(true));
    const instanceOnDidBlurListener = instance2.onDidBlur(() => this._terminalEditorFocusContextKey.reset());
    const disposeListeners = [
      instance2.onExit((e) => {
        if (!instance2.waitOnExit) {
          this.dispose();
        }
      }),
      instance2.onDisposed(() => this.dispose()),
      instance2.onTitleChanged(() => this._onDidChangeLabel.fire()),
      instance2.onIconChanged(() => this._onDidChangeLabel.fire()),
      instanceOnDidFocusListener,
      instanceOnDidBlurListener,
      instance2.statusList.onDidChangePrimaryStatus(() => this._onDidChangeLabel.fire())
    ];
    this._register(toDisposable(() => {
      if (!this._isDetached && !this._isShuttingDown) {
        instance2.dispose(3 /* User */);
      }
      dispose(disposeListeners);
      dispose([instanceOnDidFocusListener, instanceOnDidBlurListener]);
    }));
    this._register(this._lifecycleService.onWillShutdown((e) => {
      this._isShuttingDown = true;
      dispose(disposeListeners);
      const shouldPersistTerminals = this._configurationService.getValue("terminal.integrated.enablePersistentSessions" /* EnablePersistentSessions */) && e.reason === 3 /* RELOAD */;
      if (shouldPersistTerminals) {
        instance2.detachProcessAndDispose(1 /* Shutdown */);
      } else {
        instance2.dispose(1 /* Shutdown */);
      }
    }));
  }
  getName() {
    return this._terminalInstance?.title || this.resource.fragment;
  }
  getIcon() {
    if (!this._terminalInstance || !ThemeIcon.isThemeIcon(this._terminalInstance.icon)) {
      return void 0;
    }
    return this._terminalInstance.icon;
  }
  getLabelExtraClasses() {
    if (!this._terminalInstance) {
      return [];
    }
    const extraClasses = ["terminal-tab", "predefined-file-icon"];
    const colorClass = getColorClass(this._terminalInstance);
    if (colorClass) {
      extraClasses.push(colorClass);
    }
    const uriClasses = getUriClasses(this._terminalInstance, this._themeService.getColorTheme().type);
    if (uriClasses) {
      extraClasses.push(...uriClasses);
    }
    return extraClasses;
  }
  /**
   * Detach the instance from the input such that when the input is disposed it will not dispose
   * of the terminal instance/process.
   */
  detachInstance() {
    if (!this._isShuttingDown) {
      this._terminalInstance?.detachFromElement();
      this._terminalInstance?.setParentContextKeyService(this._contextKeyService);
      this._isDetached = true;
    }
  }
  getDescription() {
    return this._terminalInstance?.description;
  }
  toUntyped() {
    return {
      resource: this.resource,
      options: {
        override: terminalEditorId,
        pinned: true,
        forceReload: true
      }
    };
  }
  canReopen() {
    return false;
  }
};

TerminalEditorInput = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, ITerminalInstanceService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ILifecycleService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IDialogService)
], TerminalEditorInput);
export { TerminalEditorInput };
