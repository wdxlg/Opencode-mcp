// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/actions/browser/buttonbar.ts
import { ButtonBar, ButtonWithDropdown } from "./module-0546.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ActionRunner, SubmenuAction } from "./module-0082.mjs";
import { createInstantHoverDelegate } from "./module-0448.mjs";
import { $ } from "./module-0075.mjs";
import { createPixelSpinner } from "./module-2010.mjs";
import { stripIcons } from "./module-0461.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { IMenuService, MenuItemAction } from "./module-0092.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { getActionBarActions } from "./module-0516.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/platform/actions/browser/buttonbar.ts
var WorkbenchButtonBar = class extends ButtonBar {
  constructor(container3, _options, _contextMenuService, _keybindingService, telemetryService, _hoverService) {
    super(container3);
    this._options = _options;
    this._contextMenuService = _contextMenuService;
    this._keybindingService = _keybindingService;
    this._hoverService = _hoverService;
    this._store = new DisposableStore();
    this._updateStore = new DisposableStore();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._actionRunner = this._store.add(new ActionRunner());
    if (_options?.telemetrySource) {
      this._actionRunner.onDidRun((e) => {
        telemetryService.publicLog2(
          "workbenchActionExecuted",
          { id: e.action.id, from: _options.telemetrySource }
        );
      }, void 0, this._store);
    }
  }
  get onWillRun() {
    return this._actionRunner.onWillRun;
  }
  get onDidRun() {
    return this._actionRunner.onDidRun;
  }
  dispose() {
    this._onDidChange.dispose();
    this._updateStore.dispose();
    this._store.dispose();
    super.dispose();
  }
  update(actions, secondary) {
    const configProvider = this._options?.buttonConfigProvider ?? (() => ({ showLabel: true }));
    this._updateStore.clear();
    this.clear();
    const hoverDelegate = this._updateStore.add(createInstantHoverDelegate());
    const actionCount = this._options?.renderSecondaryActions === false ? Math.min(actions.length, 1) : actions.length;
    for (let i2 = 0; i2 < actionCount; i2++) {
      const secondary2 = i2 > 0;
      const actionOrSubmenu = actions[i2];
      let action;
      let btn;
      let tooltip;
      if (actionOrSubmenu instanceof SubmenuAction && actionOrSubmenu.actions.length > 1) {
        const [first2, ...rest] = actionOrSubmenu.actions;
        action = first2;
        tooltip = action.tooltip || action.label;
        tooltip = this._keybindingService.appendKeybinding(tooltip, action.id);
        btn = this.addButtonWithDropdown({
          addPrimaryActionToDropdown: false,
          secondary: configProvider(action, i2)?.isSecondary ?? secondary2,
          actionRunner: this._actionRunner,
          actions: rest,
          contextMenuProvider: this._contextMenuService,
          ariaLabel: tooltip,
          supportIcons: true,
          small: this._options?.small
        });
      } else {
        action = actionOrSubmenu instanceof SubmenuAction && actionOrSubmenu.actions.length === 1 ? actionOrSubmenu.actions[0] : actionOrSubmenu;
        tooltip = action.tooltip || action.label;
        tooltip = this._keybindingService.appendKeybinding(tooltip, action.id);
        btn = this.addButton({
          secondary: configProvider(action, i2)?.isSecondary ?? secondary2,
          ariaLabel: tooltip,
          supportIcons: true,
          small: this._options?.small
        });
      }
      btn.enabled = action.enabled;
      btn.checked = action.checked ?? false;
      btn.element.classList.add("default-colors");
      const config = configProvider(action, i2);
      const showLabel = config?.showLabel ?? true;
      const showIcon = config?.showIcon;
      const customClass = config?.customClass;
      const customLabel = config?.customLabel;
      const customLabelObs = config?.customLabelObs;
      if (customClass) {
        btn.element.classList.add(customClass);
      }
      const renderActionIcon = () => {
        if (!action.class) {
          return void 0;
        }
        const element = $("span");
        element.classList.add(...action.class.split(" "));
        return element;
      };
      const showSpinner = config?.showSpinner;
      const leading = showSpinner ? this._updateStore.add(createPixelSpinner()).element : showIcon && showLabel ? renderActionIcon() : void 0;
      if (leading) {
        leading.classList.add("monaco-button-leading-icon");
        if (!showLabel) {
          leading.classList.add("monaco-button-leading-icon-only");
        }
      }
      const applyLeading = () => {
        if (leading) {
          (btn instanceof ButtonWithDropdown ? btn.primaryButton.element : btn.element).prepend(leading);
        }
      };
      const applyLabel = (labelValue) => {
        if (showLabel) {
          btn.label = labelValue;
        }
        const labelStringValue = stripIcons(renderAsPlaintext(labelValue));
        const ariaLabelWithKeybinding = this._keybindingService.appendKeybinding(labelStringValue, action.id);
        btn.setTitle(ariaLabelWithKeybinding);
        btn.setAriaLabel(ariaLabelWithKeybinding);
        applyLeading();
      };
      if (showLabel) {
        btn.label = customLabel ?? action.label;
      } else {
        btn.element.classList.add("monaco-text-button");
      }
      applyLeading();
      if (showIcon && !showLabel && !showSpinner) {
        if (action instanceof MenuItemAction && ThemeIcon.isThemeIcon(action.item.icon)) {
          btn.icon = action.item.icon;
        } else if (action.class) {
          btn.element.classList.add(...action.class.split(" "));
        }
      }
      if (customLabelObs) {
        this._updateStore.add(autorun((reader) => {
          const v2 = customLabelObs.read(reader);
          applyLabel(v2 ?? customLabel ?? action.label);
        }));
      }
      this._updateStore.add(this._hoverService.setupManagedHover(hoverDelegate, btn.element, tooltip));
      this._updateStore.add(btn.onDidClick(async () => {
        if (this._options?.disableWhileRunning) {
          btn.enabled = false;
          try {
            await this._actionRunner.run(action);
          } finally {
            btn.enabled = action.enabled;
          }
        } else {
          this._actionRunner.run(action);
        }
      }));
    }
    if (this._options?.renderSecondaryActions !== false && secondary.length > 0) {
      const btn = this.addButton({
        secondary: true,
        ariaLabel: localize(1836, null),
        small: this._options?.small
      });
      btn.icon = Codicon.dropDownButton;
      btn.element.classList.add("default-colors", "monaco-text-button");
      btn.enabled = true;
      this._updateStore.add(this._hoverService.setupManagedHover(hoverDelegate, btn.element, localize(1836, null)));
      this._updateStore.add(btn.onDidClick(async () => {
        this._contextMenuService.showContextMenu({
          getAnchor: () => btn.element,
          getActions: () => secondary,
          actionRunner: this._actionRunner,
          onHide: () => btn.element.setAttribute("aria-expanded", "false")
        });
        btn.element.setAttribute("aria-expanded", "true");
      }));
    }
    this._onDidChange.fire(this);
  }
};

WorkbenchButtonBar = __decorateClass([
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IHoverService)
], WorkbenchButtonBar);

var MenuWorkbenchButtonBar = class extends WorkbenchButtonBar {
  constructor(container3, menuId, options3, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService, hoverService) {
    super(container3, options3, contextMenuService, keybindingService, telemetryService, hoverService);
    const menu = menuService.createMenu(menuId, contextKeyService);
    this._store.add(menu);
    const update = () => {
      this.clear();
      const actions = getActionBarActions(
        menu.getActions(options3?.menuOptions),
        options3?.toolbarOptions?.primaryGroup
      );
      super.update(actions.primary, actions.secondary);
    };
    this._store.add(menu.onDidChange(update));
    update();
  }
  dispose() {
    super.dispose();
  }
  update(_actions) {
    throw new Error("Use Menu or WorkbenchButtonBar");
  }
};

MenuWorkbenchButtonBar = __decorateClass([
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IHoverService)
], MenuWorkbenchButtonBar);
export { WorkbenchButtonBar, MenuWorkbenchButtonBar };
