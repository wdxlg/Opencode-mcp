// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/dropdown/dropdownActionViewItem.ts
import { ActionViewItem, BaseActionViewItem } from "./module-0476.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append, h } from "./module-0075.mjs";
import { DropdownMenu } from "./module-0501.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";


// src/vs/base/browser/ui/dropdown/dropdownActionViewItem.ts
var DropdownMenuActionViewItem = class extends BaseActionViewItem {
  constructor(action, menuActionsOrProvider, contextMenuProvider, options3 = /* @__PURE__ */ Object.create(null)) {
    super(null, action, options3);
    this.actionItem = null;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.menuActionsOrProvider = menuActionsOrProvider;
    this.contextMenuProvider = contextMenuProvider;
    this.options = options3;
    if (this.options.actionRunner) {
      this.actionRunner = this.options.actionRunner;
    }
  }
  get onDidChangeVisibility() {
    return this._onDidChangeVisibility.event;
  }
  render(container2) {
    this.actionItem = container2;
    const labelRenderer = (el) => {
      this.element = append(el, $("a.action-label"));
      this.setAriaLabelAttributes(this.element);
      return this.renderLabel(this.element);
    };
    const isActionsArray = Array.isArray(this.menuActionsOrProvider);
    const options3 = {
      contextMenuProvider: this.contextMenuProvider,
      labelRenderer,
      isEnabled: () => this.action.enabled,
      menuAsChild: this.options.menuAsChild,
      actions: isActionsArray ? this.menuActionsOrProvider : void 0,
      actionProvider: isActionsArray ? void 0 : this.menuActionsOrProvider,
      menuClassName: this.options.menuClassName,
      closeAnimation: this.options.closeAnimation,
      getAnchor: this.options.getAnchor,
      skipTelemetry: this.options.skipTelemetry
    };
    this.dropdownMenu = this._register(new DropdownMenu(container2, options3));
    this._register(this.dropdownMenu.onDidChangeVisibility((visible) => {
      this.element?.setAttribute("aria-expanded", `${visible}`);
      this._onDidChangeVisibility.fire(visible);
    }));
    this.dropdownMenu.menuOptions = {
      actionViewItemProvider: this.options.actionViewItemProvider,
      actionRunner: this.actionRunner,
      getKeyBinding: this.options.keybindingProvider,
      context: this._context
    };
    if (this.options.anchorAlignmentProvider) {
      const that = this;
      this.dropdownMenu.menuOptions = {
        ...this.dropdownMenu.menuOptions,
        get anchorAlignment() {
          return that.options.anchorAlignmentProvider();
        }
      };
    }
    this.updateTooltip();
    this.updateEnabled();
  }
  renderLabel(element) {
    let classNames2 = [];
    if (typeof this.options.classNames === "string") {
      classNames2 = this.options.classNames.split(/\s+/g).filter((s) => !!s);
    } else if (this.options.classNames) {
      classNames2 = this.options.classNames;
    }
    if (!classNames2.find((c) => c === "icon")) {
      classNames2.push("codicon");
    }
    element.classList.add(...classNames2);
    if (this._action.label) {
      this._register(getBaseLayerHoverDelegate().setupManagedHover(this.options.hoverDelegate ?? getDefaultHoverDelegate("mouse"), element, this._action.label));
    }
    return null;
  }
  setAriaLabelAttributes(element) {
    element.setAttribute("role", "button");
    element.setAttribute("aria-haspopup", "true");
    element.setAttribute("aria-expanded", "false");
    element.ariaLabel = this._action.label || "";
  }
  getTooltip() {
    let title = null;
    if (this.action.tooltip) {
      title = this.action.tooltip;
    } else if (this.action.label) {
      title = this.action.label;
    }
    return title ?? void 0;
  }
  setActionContext(newContext) {
    super.setActionContext(newContext);
    if (this.dropdownMenu) {
      if (this.dropdownMenu.menuOptions) {
        this.dropdownMenu.menuOptions.context = newContext;
      } else {
        this.dropdownMenu.menuOptions = { context: newContext };
      }
    }
  }
  show() {
    this.dropdownMenu?.show();
  }
  updateEnabled() {
    const disabled = !this.action.enabled;
    this.actionItem?.classList.toggle("disabled", disabled);
    this.element?.classList.toggle("disabled", disabled);
    this.element?.setAttribute("aria-disabled", String(disabled));
  }
};

var ActionWithDropdownActionViewItem = class extends ActionViewItem {
  constructor(context2, action, options3, contextMenuProvider) {
    super(context2, action, options3);
    this.contextMenuProvider = contextMenuProvider;
  }
  render(container2) {
    super.render(container2);
    if (this.element) {
      this.element.classList.add("action-dropdown-item");
      const menuActionsProvider = {
        getActions: () => {
          const actionsProvider = this.options.menuActionsOrProvider;
          return Array.isArray(actionsProvider) ? actionsProvider : actionsProvider.getActions();
        }
      };
      const menuActionClassNames = this.options.menuActionClassNames || [];
      const separator2 = h("div.action-dropdown-item-separator", [h("div", {})]).root;
      separator2.classList.toggle("prominent", menuActionClassNames.includes("prominent"));
      append(this.element, separator2);
      this.dropdownMenuActionViewItem = this._register(new DropdownMenuActionViewItem(this._register(new Action("dropdownAction", localize(8, null), void 0, this.action.enabled)), menuActionsProvider, this.contextMenuProvider, {
        classNames: ["dropdown", ...ThemeIcon.asClassNameArray(Codicon.dropDownButton), ...menuActionClassNames],
        hoverDelegate: this.options.hoverDelegate,
        keybindingProvider: this.options.keybindingProvider
      }));
      this.dropdownMenuActionViewItem.render(this.element);
      this._register(addDisposableListener(this.element, EventType.KEY_DOWN, (e4) => {
        if (menuActionsProvider.getActions().length === 0) {
          return;
        }
        const event = new StandardKeyboardEvent(e4);
        let handled = false;
        if (this.dropdownMenuActionViewItem?.isFocused() && event.equals(15 /* LeftArrow */)) {
          handled = true;
          this.dropdownMenuActionViewItem?.blur();
          this.focus();
        } else if (this.isFocused() && event.equals(17 /* RightArrow */)) {
          handled = true;
          this.blur();
          this.dropdownMenuActionViewItem?.focus();
        }
        if (handled) {
          event.preventDefault();
          event.stopPropagation();
        }
      }));
    }
  }
  blur() {
    super.blur();
    this.dropdownMenuActionViewItem?.blur();
  }
  setFocusable(focusable) {
    super.setFocusable(focusable);
    this.dropdownMenuActionViewItem?.setFocusable(focusable);
  }
  updateEnabled() {
    super.updateEnabled();
    if (this.dropdownMenuActionViewItem) {
      this.dropdownMenuActionViewItem.action.enabled = this.action.enabled;
    }
  }
};
export { DropdownMenuActionViewItem, ActionWithDropdownActionViewItem };
