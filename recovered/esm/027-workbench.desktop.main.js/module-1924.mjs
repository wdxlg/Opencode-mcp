// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView.ts
import { MenuEntryActionViewItem, SubmenuEntryActionViewItem } from "./module-0516.mjs";
import { EventHelper, EventType, addDisposableListener, reset } from "./module-0075.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { EventType2 } from "./module-0251.mjs";
import { isUndefinedOrNull } from "./module-0010.mjs";
import { MenuItemAction } from "./module-0092.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView.ts
var CodiconActionViewItem = class extends MenuEntryActionViewItem {
  updateLabel() {
    if (this.options.label && this.label) {
      reset(this.label, ...renderLabelWithIcons(this._commandAction.label ?? ""));
    }
  }
};

var ActionViewWithLabel = class extends MenuEntryActionViewItem {
  render(container3) {
    super.render(container3);
    container3.classList.add("notebook-action-view-item");
    this._actionLabel = document.createElement("a");
    container3.appendChild(this._actionLabel);
    this.updateLabel();
  }
  updateLabel() {
    if (this._actionLabel) {
      this._actionLabel.classList.add("notebook-label");
      this._actionLabel.innerText = this._action.label;
    }
  }
};

var UnifiedSubmenuActionView = class extends SubmenuEntryActionViewItem {
  constructor(action, options3, _renderLabel, subActionProvider, subActionViewItemProvider, _keybindingService, _contextMenuService, _themeService, _hoverService) {
    super(action, { ...options3, hoverDelegate: options3?.hoverDelegate ?? getDefaultHoverDelegate("element") }, _keybindingService, _contextMenuService, _themeService);
    this._renderLabel = _renderLabel;
    this.subActionProvider = subActionProvider;
    this.subActionViewItemProvider = subActionViewItemProvider;
    this._hoverService = _hoverService;
  }
  render(container3) {
    super.render(container3);
    container3.classList.add("notebook-action-view-item");
    container3.classList.add("notebook-action-view-item-unified");
    this._actionLabel = document.createElement("a");
    container3.appendChild(this._actionLabel);
    this._hover = this._register(this._hoverService.setupManagedHover(this.options.hoverDelegate ?? getDefaultHoverDelegate("element"), this._actionLabel, ""));
    this.updateLabel();
    for (const event of [EventType.CLICK, EventType.MOUSE_DOWN, EventType2.Tap]) {
      this._register(addDisposableListener(container3, event, (e) => this.onClick(e, true)));
    }
  }
  onClick(event, preserveFocus = false) {
    EventHelper.stop(event, true);
    const context2 = isUndefinedOrNull(this._context) ? this.options?.useEventAsContext ? event : { preserveFocus } : this._context;
    this.actionRunner.run(this._primaryAction ?? this._action, context2);
  }
  updateLabel() {
    const actions = this.subActionProvider.getActions();
    if (this._actionLabel) {
      const primaryAction = actions[0];
      this._primaryAction = primaryAction;
      if (primaryAction && primaryAction instanceof MenuItemAction) {
        const element = this.element;
        if (element && primaryAction.item.icon && ThemeIcon.isThemeIcon(primaryAction.item.icon)) {
          const iconClasses = ThemeIcon.asClassNameArray(primaryAction.item.icon);
          element.classList.forEach((cl) => {
            if (cl.startsWith("codicon-")) {
              element.classList.remove(cl);
            }
          });
          element.classList.add(...iconClasses);
        }
        if (this._renderLabel) {
          this._actionLabel.classList.add("notebook-label");
          this._actionLabel.innerText = this._action.label;
          this._hover?.update(primaryAction.tooltip.length ? primaryAction.tooltip : primaryAction.label);
        }
      } else {
        if (this._renderLabel) {
          this._actionLabel.classList.add("notebook-label");
          this._actionLabel.innerText = this._action.label;
          this._hover?.update(this._action.tooltip.length ? this._action.tooltip : this._action.label);
        }
      }
    }
  }
};

UnifiedSubmenuActionView = __decorateClass([
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IHoverService)
], UnifiedSubmenuActionView);
export { CodiconActionViewItem, ActionViewWithLabel, UnifiedSubmenuActionView };
