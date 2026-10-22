// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalEditor.ts
import { EditorPane } from "./module-1089.mjs";
import { ITerminalConfigurationService, ITerminalEditorService, ITerminalService, terminalEditorId } from "./module-1149.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { IMenuService, MenuId, MenuItemAction } from "./module-0092.mjs";
import { $, addDisposableListener } from "./module-0075.mjs";
import { openContextMenu } from "./module-3268.mjs";
import { getTerminalActionBarArgs } from "./module-3275.mjs";
import { ACTIVE_GROUP } from "./module-0934.mjs";
import { DropdownWithPrimaryActionViewItem } from "./module-1932.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITerminalProfileResolverService, ITerminalProfileService } from "./module-1173.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalEditor.ts
var TerminalEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, _terminalEditorService, _terminalProfileResolverService, _terminalService, _terminalConfigurationService, contextKeyService, menuService, _instantiationService, _contextMenuService, _terminalProfileService, _workbenchLayoutService) {
    super(terminalEditorId, group2, telemetryService, themeService, storageService);
    this._terminalEditorService = _terminalEditorService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._terminalService = _terminalService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._instantiationService = _instantiationService;
    this._contextMenuService = _contextMenuService;
    this._terminalProfileService = _terminalProfileService;
    this._workbenchLayoutService = _workbenchLayoutService;
    this._editorInput = void 0;
    this._cancelContextMenu = false;
    this._newDropdown = this._register(new MutableDisposable());
    this._sessionDisposables = this._register(new DisposableStore());
    this._disposableStore = this._register(new DisposableStore());
    this._dropdownMenu = this._register(menuService.createMenu(MenuId.TerminalNewDropdownContext, contextKeyService));
    this._instanceMenu = this._register(menuService.createMenu(MenuId.TerminalInstanceContext, contextKeyService));
    this._register(this._terminalProfileService.onDidChangeAvailableProfiles((profiles2) => this._updateTabActionBar(profiles2)));
  }
  async setInput(newInput, options3, context2, token) {
    this._editorInput?.terminalInstance?.detachFromElement();
    this._editorInput = newInput;
    await super.setInput(newInput, options3, context2, token);
    this._editorInput.terminalInstance?.attachToElement(this._overflowGuardElement);
    if (this._lastDimension) {
      this.layout(this._lastDimension);
    }
    this._editorInput.terminalInstance?.setVisible(this.isVisible() && this._workbenchLayoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, this.window));
    if (this._editorInput.terminalInstance) {
      this._sessionDisposables.add(this._editorInput.terminalInstance.onDidFocus(() => this._setActiveInstance()));
      this._editorInput.setCopyLaunchConfig(this._editorInput.terminalInstance.shellLaunchConfig);
    }
  }
  clearInput() {
    super.clearInput();
    this._sessionDisposables.clear();
    if (this._overflowGuardElement && this._editorInput?.terminalInstance?.domElement.parentElement === this._overflowGuardElement) {
      this._editorInput.terminalInstance?.detachFromElement();
    }
    this._editorInput = void 0;
  }
  _setActiveInstance() {
    if (!this._editorInput?.terminalInstance) {
      return;
    }
    this._terminalEditorService.setActiveInstance(this._editorInput.terminalInstance);
  }
  focus() {
    super.focus();
    this._editorInput?.terminalInstance?.focus(true);
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  createEditor(parent) {
    this._editorInstanceElement = parent;
    this._overflowGuardElement = $(".terminal-overflow-guard.terminal-editor");
    this._editorInstanceElement.appendChild(this._overflowGuardElement);
    this._registerListeners();
  }
  _registerListeners() {
    if (!this._editorInstanceElement) {
      return;
    }
    this._register(addDisposableListener(this._editorInstanceElement, "mousedown", async (event) => {
      const terminal2 = this._terminalEditorService.activeInstance;
      if (this._terminalEditorService.instances.length > 0 && terminal2) {
        const result = await terminal2.handleMouseEvent(event, this._instanceMenu);
        if (typeof result === "object" && result.cancelContextMenu) {
          this._cancelContextMenu = true;
        }
      }
    }));
    this._register(addDisposableListener(this._editorInstanceElement, "contextmenu", (event) => {
      const rightClickBehavior = this._terminalConfigurationService.config.rightClickBehavior;
      if (rightClickBehavior === "nothing" && !event.shiftKey) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this._cancelContextMenu = false;
        return;
      } else if (!this._cancelContextMenu && rightClickBehavior !== "copyPaste" && rightClickBehavior !== "paste") {
        if (!this._cancelContextMenu) {
          openContextMenu(this.window, event, this._editorInput?.terminalInstance, this._instanceMenu, this._contextMenuService);
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        this._cancelContextMenu = false;
      }
    }));
  }
  _updateTabActionBar(profiles2) {
    this._disposableStore.clear();
    const actions = getTerminalActionBarArgs(2 /* Editor */, profiles2, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu, this._disposableStore);
    this._newDropdown.value?.update(actions.dropdownAction, actions.dropdownMenuActions);
  }
  layout(dimension) {
    const instance2 = this._editorInput?.terminalInstance;
    if (instance2) {
      instance2.attachToElement(this._overflowGuardElement);
      instance2.layout(dimension);
    }
    this._lastDimension = dimension;
  }
  setVisible(visible) {
    super.setVisible(visible);
    this._editorInput?.terminalInstance?.setVisible(visible && this._workbenchLayoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, this.window));
  }
  getActionViewItem(action, options3) {
    switch (action.id) {
      case "workbench.action.createTerminalEditorSameGroup" /* CreateTerminalEditorSameGroup */: {
        if (action instanceof MenuItemAction) {
          const location2 = { viewColumn: ACTIVE_GROUP };
          this._disposableStore.clear();
          const actions = getTerminalActionBarArgs(location2, this._terminalProfileService.availableProfiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu, this._disposableStore);
          this._newDropdown.value = this._instantiationService.createInstance(DropdownWithPrimaryActionViewItem, action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, { hoverDelegate: options3.hoverDelegate });
          this._newDropdown.value?.update(actions.dropdownAction, actions.dropdownMenuActions);
          return this._newDropdown.value;
        }
      }
    }
    return super.getActionViewItem(action, options3);
  }
  _getDefaultProfileName() {
    let defaultProfileName;
    try {
      defaultProfileName = this._terminalProfileService.getDefaultProfileName();
    } catch (e) {
      defaultProfileName = this._terminalProfileResolverService.defaultProfileName;
    }
    return defaultProfileName;
  }
};

TerminalEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, ITerminalEditorService),
  __decorateParam(5, ITerminalProfileResolverService),
  __decorateParam(6, ITerminalService),
  __decorateParam(7, ITerminalConfigurationService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IMenuService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, IContextMenuService),
  __decorateParam(12, ITerminalProfileService),
  __decorateParam(13, IWorkbenchLayoutService)
], TerminalEditor);
export { TerminalEditor };
