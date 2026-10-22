// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/actions/browser/actionWidgetDropdownActionViewItem.ts
import { BaseActionViewItem } from "./module-0476.mjs";
import { $, append } from "./module-0075.mjs";
import { ActionWidgetDropdown } from "./module-2058.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/platform/actions/browser/actionWidgetDropdownActionViewItem.ts
var ActionWidgetDropdownActionViewItem = class extends BaseActionViewItem {
  constructor(action, actionWidgetOptions, _actionWidgetService, _keybindingService, _contextKeyService, _telemetryService) {
    super(void 0, action);
    this.actionWidgetOptions = actionWidgetOptions;
    this._actionWidgetService = _actionWidgetService;
    this._keybindingService = _keybindingService;
    this._contextKeyService = _contextKeyService;
    this._telemetryService = _telemetryService;
    this.actionItem = null;
  }
  render(container3) {
    this.actionItem = container3;
    const labelRenderer = (el) => {
      this.element = append(el, $("a.action-label"));
      return this.renderLabel(this.element);
    };
    this.actionWidgetDropdown = this._register(new ActionWidgetDropdown(container3, { ...this.actionWidgetOptions, labelRenderer }, this._actionWidgetService, this._keybindingService, this._telemetryService));
    this._register(this.actionWidgetDropdown.onDidChangeVisibility((visible) => {
      this.element?.setAttribute("aria-expanded", `${visible}`);
    }));
    this.updateTooltip();
    this.updateEnabled();
  }
  renderLabel(element) {
    element.classList.add("codicon");
    if (this._action.label) {
      this._register(getBaseLayerHoverDelegate().setupManagedHover(this.options.hoverDelegate ?? getDefaultHoverDelegate("mouse"), element, this._action.label));
    }
    return null;
  }
  updateAriaLabel() {
    if (this.element) {
      this.setAriaLabelAttributes(this.element);
    }
  }
  setAriaLabelAttributes(element) {
    element.setAttribute("role", "button");
    element.setAttribute("aria-haspopup", "true");
    element.setAttribute("aria-expanded", "false");
    element.ariaLabel = this.getTooltip() + " - " + (element.textContent || this._action.label) || "";
  }
  getTooltip() {
    const tooltip = this.action.tooltip ?? this.action.label;
    return this._keybindingService.appendKeybinding(tooltip, this.action.id, this._contextKeyService);
  }
  show() {
    this.actionWidgetDropdown?.show();
  }
  setDropdownEnabled(enabled) {
    this.actionWidgetDropdown?.setEnabled(enabled && this.action.enabled);
  }
  updateEnabled() {
    const disabled = !this.action.enabled;
    this.actionItem?.classList.toggle("disabled", disabled);
    this.element?.classList.toggle("disabled", disabled);
    this.setDropdownEnabled(true);
  }
};

ActionWidgetDropdownActionViewItem = __decorateClass([
  __decorateParam(2, IActionWidgetService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, ITelemetryService)
], ActionWidgetDropdownActionViewItem);
export { ActionWidgetDropdownActionViewItem };
