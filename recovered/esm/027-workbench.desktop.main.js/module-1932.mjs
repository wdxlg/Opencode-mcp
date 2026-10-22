// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/actions/browser/dropdownWithPrimaryActionViewItem.ts
import { BaseActionViewItem } from "./module-0476.mjs";
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { DropdownMenuActionViewItem } from "./module-0502.mjs";
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/platform/actions/browser/dropdownWithPrimaryActionViewItem.ts
var DropdownWithPrimaryActionViewItem = class extends BaseActionViewItem {
  constructor(primaryAction, dropdownAction, dropdownMenuActions, className2, _options, _contextMenuProvider, _keybindingService, _notificationService, _contextKeyService, _themeService, _accessibilityService) {
    super(null, primaryAction, { hoverDelegate: _options?.hoverDelegate });
    this._options = _options;
    this._contextMenuProvider = _contextMenuProvider;
    this._container = null;
    this._dropdownContainer = null;
    this._primaryAction = new MenuEntryActionViewItem(primaryAction, { hoverDelegate: _options?.hoverDelegate }, _keybindingService, _notificationService, _contextKeyService, _themeService, _contextMenuProvider, _accessibilityService);
    if (_options?.actionRunner) {
      this._primaryAction.actionRunner = _options.actionRunner;
    }
    this._dropdown = new DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
      menuAsChild: _options?.menuAsChild ?? true,
      classNames: className2 ? ["codicon", "codicon-chevron-down", className2] : ["codicon", "codicon-chevron-down"],
      menuClassName: _options?.menuClassName,
      closeAnimation: _options?.closeAnimation,
      getAnchor: _options?.getAnchor,
      actionRunner: this._options?.actionRunner,
      keybindingProvider: this._options?.getKeyBinding ?? ((action) => _keybindingService.lookupKeybinding(action.id)),
      hoverDelegate: _options?.hoverDelegate,
      skipTelemetry: _options?.skipTelemetry
    });
  }
  get onDidChangeDropdownVisibility() {
    return this._dropdown.onDidChangeVisibility;
  }
  set actionRunner(actionRunner) {
    super.actionRunner = actionRunner;
    this._primaryAction.actionRunner = actionRunner;
    this._dropdown.actionRunner = actionRunner;
  }
  get actionRunner() {
    return super.actionRunner;
  }
  setActionContext(newContext) {
    super.setActionContext(newContext);
    this._primaryAction.setActionContext(newContext);
    this._dropdown.setActionContext(newContext);
  }
  render(container3) {
    this._container = container3;
    super.render(this._container);
    this._container.classList.add("monaco-dropdown-with-primary");
    const primaryContainer = $(".action-container");
    primaryContainer.role = "button";
    primaryContainer.ariaDisabled = String(!this.action.enabled);
    this._primaryAction.render(append(this._container, primaryContainer));
    this._dropdownContainer = $(".dropdown-action-container");
    this._dropdown.render(append(this._container, this._dropdownContainer));
    this._register(addDisposableListener(primaryContainer, EventType.KEY_DOWN, (e) => {
      if (!this.action.enabled) {
        return;
      }
      const event = new StandardKeyboardEvent(e);
      if (event.equals(17 /* RightArrow */)) {
        this._primaryAction.element.tabIndex = -1;
        this._dropdown.focus();
        event.stopPropagation();
      }
    }));
    this._register(addDisposableListener(this._dropdownContainer, EventType.KEY_DOWN, (e) => {
      if (!this.action.enabled) {
        return;
      }
      const event = new StandardKeyboardEvent(e);
      if (event.equals(15 /* LeftArrow */)) {
        this._primaryAction.element.tabIndex = 0;
        this._dropdown.setFocusable(false);
        this._primaryAction.element?.focus();
        event.stopPropagation();
      }
    }));
    this.updateEnabled();
  }
  focus(fromRight) {
    if (fromRight) {
      this._dropdown.focus();
    } else {
      this._primaryAction.element.tabIndex = 0;
      this._primaryAction.element.focus();
    }
  }
  blur() {
    this._primaryAction.element.tabIndex = -1;
    this._dropdown.blur();
    this._container.blur();
  }
  setFocusable(focusable) {
    if (focusable) {
      this._primaryAction.element.tabIndex = 0;
    } else {
      this._primaryAction.element.tabIndex = -1;
      this._dropdown.setFocusable(false);
    }
  }
  updateEnabled() {
    const disabled = !this.action.enabled;
    this.element?.classList.toggle("disabled", disabled);
  }
  update(dropdownAction, dropdownMenuActions, dropdownIcon) {
    this._dropdown.dispose();
    this._dropdown = new DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
      menuAsChild: this._options?.menuAsChild ?? true,
      classNames: ["codicon", dropdownIcon || "codicon-chevron-down"],
      menuClassName: this._options?.menuClassName,
      closeAnimation: this._options?.closeAnimation,
      getAnchor: this._options?.getAnchor,
      actionRunner: this._options?.actionRunner,
      hoverDelegate: this._options?.hoverDelegate,
      keybindingProvider: this._options?.getKeyBinding
    });
    if (this._dropdownContainer) {
      this._dropdown.render(this._dropdownContainer);
    }
  }
  showDropdown() {
    this._dropdown.show();
  }
  dispose() {
    this._primaryAction.dispose();
    this._dropdown.dispose();
    super.dispose();
  }
};

DropdownWithPrimaryActionViewItem = __decorateClass([
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, IAccessibilityService)
], DropdownWithPrimaryActionViewItem);
export { DropdownWithPrimaryActionViewItem };
