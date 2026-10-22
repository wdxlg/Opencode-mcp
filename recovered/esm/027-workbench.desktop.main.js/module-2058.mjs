// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/actionWidget/browser/actionWidgetDropdown.ts
import { CONTEXT_VIEW_MENU_MOTION_ANCESTOR_CLASSES, CONTEXT_VIEW_MENU_MOTION_CLOSE_ANIMATION_DURATION } from "./module-0471.mjs";
import { BaseDropdown } from "./module-0501.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { getActiveElement, isHTMLElement } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/platform/actionWidget/browser/actionWidgetDropdown.ts
var ACTION_WIDGET_DROPDOWN_MOTION_CLASS = "action-widget-dropdown";

var ACTION_WIDGET_DROPDOWN_MOTION_CLOSING_CLASS = "action-widget-dropdown-closing";

var actionWidgetDropdownCloseAnimation = {
  className: ACTION_WIDGET_DROPDOWN_MOTION_CLOSING_CLASS,
  duration: CONTEXT_VIEW_MENU_MOTION_CLOSE_ANIMATION_DURATION,
  requiredAncestorClasses: CONTEXT_VIEW_MENU_MOTION_ANCESTOR_CLASSES
};

function withActionWidgetDropdownMotion(listOptions) {
  const classNames2 = listOptions?.className?.split(/\s+/).filter(Boolean) ?? [];
  if (!classNames2.includes(ACTION_WIDGET_DROPDOWN_MOTION_CLASS)) {
    classNames2.push(ACTION_WIDGET_DROPDOWN_MOTION_CLASS);
  }
  const widgetClassNames = listOptions?.widgetClassName?.split(/\s+/).filter(Boolean) ?? [];
  if (!widgetClassNames.includes(ACTION_WIDGET_DROPDOWN_MOTION_CLASS)) {
    widgetClassNames.push(ACTION_WIDGET_DROPDOWN_MOTION_CLASS);
  }
  return {
    ...listOptions,
    className: classNames2.join(" "),
    widgetClassName: widgetClassNames.join(" "),
    closeAnimation: listOptions?.closeAnimation ?? actionWidgetDropdownCloseAnimation
  };
}

var ActionWidgetDropdown = class extends BaseDropdown {
  constructor(container3, _options, actionWidgetService, keybindingService, telemetryService) {
    super(container3, _options);
    this._options = _options;
    this.actionWidgetService = actionWidgetService;
    this.keybindingService = keybindingService;
    this.telemetryService = telemetryService;
    this._enabled = true;
  }
  show() {
    if (!this._enabled) {
      return;
    }
    const actionBarActions = this._options.actionBarActions ?? this._options.actionBarActionProvider?.getActions() ?? [];
    const actions = this._options.actions ?? this._options.actionProvider?.getActions() ?? [];
    const optionBeforeOpen = actions.find((a) => a.checked);
    let selectedOption = optionBeforeOpen;
    const actionWidgetItems = [];
    const actionsByCategory = /* @__PURE__ */ new Map();
    for (const action of actions) {
      let category11 = action.category;
      if (!category11) {
        category11 = { label: "", order: Number.MIN_SAFE_INTEGER };
      }
      if (!actionsByCategory.has(category11.label)) {
        actionsByCategory.set(category11.label, []);
      }
      actionsByCategory.get(category11.label).push(action);
    }
    const sortedCategories = Array.from(actionsByCategory.entries()).sort((a, b) => {
      const aOrder = a[1][0]?.category?.order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b[1][0]?.category?.order ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
    for (let i2 = 0; i2 < sortedCategories.length; i2++) {
      const [categoryLabel, categoryActions] = sortedCategories[i2];
      const showHeader = categoryActions[0]?.category?.showHeader ?? false;
      if (showHeader && categoryLabel) {
        actionWidgetItems.push({
          kind: "header" /* Header */,
          label: categoryLabel,
          canPreview: false,
          disabled: false,
          hideIcon: false
        });
      }
      for (const action of categoryActions) {
        const isCheckable = action.checked !== void 0;
        actionWidgetItems.push({
          item: action,
          tooltip: action.tooltip,
          description: action.description,
          ariaDescription: action.ariaDescription,
          detail: action.detail,
          hover: action.hover,
          toolbarActions: action.toolbarActions,
          className: action.className,
          inlineToggle: action.inlineToggle,
          standaloneToggle: action.standaloneToggle,
          kind: "action" /* Action */,
          canPreview: false,
          group: { title: "", icon: action.icon ?? ThemeIcon.fromId(isCheckable && action.checked ? Codicon.check.id : Codicon.blank.id) },
          disabled: !action.enabled,
          hideIcon: !isCheckable && !action.icon,
          label: action.label,
          keybinding: this._options.showItemKeybindings ? action.keybinding ?? this.keybindingService.lookupKeybinding(action.id) : void 0
        });
      }
      if (i2 < sortedCategories.length - 1) {
        actionWidgetItems.push({
          label: "",
          kind: "separator" /* Separator */,
          canPreview: false,
          disabled: false,
          hideIcon: false
        });
      }
    }
    const previouslyFocusedElement = getActiveElement();
    const auxiliaryActionIds = new Set(actionBarActions.map((action) => action.id));
    const actionWidgetDelegate = {
      onSelect: (action, preview) => {
        if (!auxiliaryActionIds.has(action.id)) {
          selectedOption = action;
        }
        this.actionWidgetService.hide();
        action.run();
      },
      onHide: () => {
        this.hide();
        if (isHTMLElement(previouslyFocusedElement)) {
          previouslyFocusedElement.focus();
        }
        this._emitCloseEvent(optionBeforeOpen, selectedOption);
      }
    };
    if (actionBarActions.length) {
      if (actionWidgetItems.length) {
        actionWidgetItems.push({
          label: "",
          kind: "separator" /* Separator */,
          canPreview: false,
          disabled: false,
          hideIcon: false
        });
      }
      for (const action of actionBarActions) {
        actionWidgetItems.push({
          item: action,
          tooltip: action.tooltip,
          kind: "action" /* Action */,
          canPreview: false,
          group: { title: "", icon: ThemeIcon.fromId(Codicon.blank.id) },
          disabled: !action.enabled,
          hideIcon: false,
          label: action.label
        });
      }
    }
    const nonSeparatorItems = actionWidgetItems.filter((i2) => i2.kind === "action" /* Action */);
    const accessibilityProvider = {
      isChecked(element) {
        return element.kind === "action" /* Action */ ? element.item?.checked : void 0;
      },
      getSetSize: () => nonSeparatorItems.length,
      getPosInSet: (_element, index2) => {
        let pos = 0;
        for (let i2 = 0; i2 <= index2 && i2 < actionWidgetItems.length; i2++) {
          if (actionWidgetItems[i2].kind === "action" /* Action */) {
            pos++;
          }
        }
        return Math.max(pos, 1);
      },
      getRole: (e) => {
        switch (e.kind) {
          case "action" /* Action */:
            return e.item && (auxiliaryActionIds.has(e.item.id) || e.item.checked === void 0) ? "menuitem" : "menuitemcheckbox";
          case "separator" /* Separator */:
            return "separator";
          default:
            return "separator";
        }
      },
      getWidgetRole: () => "menu"
    };
    super.show();
    const listOptions = withActionWidgetDropdownMotion(this._options.listOptions ?? this._options.listOptionsProvider?.getListOptions());
    this.actionWidgetService.show(
      this._options.label ?? "",
      false,
      actionWidgetItems,
      actionWidgetDelegate,
      this._options.getAnchor?.() ?? this.element,
      void 0,
      [],
      accessibilityProvider,
      {
        ...listOptions,
        initialFocusItemId: this._options.getInitialFocusActionId?.() ?? listOptions.initialFocusItemId
      }
    );
  }
  hide() {
    const wasVisible = this.isVisible();
    super.hide();
    if (wasVisible) {
      this.actionWidgetService.hide(true);
    }
  }
  setEnabled(enabled) {
    this._enabled = enabled;
  }
  _emitCloseEvent(optionBeforeOpen, selectedOption) {
    const optionBefore = optionBeforeOpen;
    const optionAfter = selectedOption;
    if (this._options.reporter) {
      this.telemetryService.publicLog2(
        "actionWidgetDropdownClosed",
        {
          id: this._options.reporter.id,
          name: this._options.reporter.name,
          selectionChanged: optionBefore?.id !== optionAfter?.id,
          optionIdBefore: this._options.reporter.includeOptions ? optionBefore?.id : void 0,
          optionIdAfter: this._options.reporter.includeOptions ? optionAfter?.id : void 0,
          optionLabelBefore: this._options.reporter.includeOptions ? optionBefore?.label : void 0,
          optionLabelAfter: this._options.reporter.includeOptions ? optionAfter?.label : void 0
        }
      );
    }
  }
};

ActionWidgetDropdown = __decorateClass([
  __decorateParam(2, IActionWidgetService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, ITelemetryService)
], ActionWidgetDropdown);
export { withActionWidgetDropdownMotion, ACTION_WIDGET_DROPDOWN_MOTION_CLASS, ACTION_WIDGET_DROPDOWN_MOTION_CLOSING_CLASS, actionWidgetDropdownCloseAnimation, ActionWidgetDropdown };
