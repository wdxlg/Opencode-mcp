// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/actionbar/actionViewItems.ts
import { Disposable } from "./module-0012.mjs";
import { Action, ActionRunner, Separator } from "./module-0082.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { isFirefox2 } from "./module-0018.mjs";
import { EventHelper, EventType, addDisposableListener } from "./module-0075.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { assertType, isUndefinedOrNull } from "./module-0010.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { localize } from "./module-0001.mjs";
import { SelectBox } from "./module-0475.mjs";


// src/vs/base/browser/ui/actionbar/actionViewItems.ts
var BaseActionViewItem = class extends Disposable {
  constructor(context2, action, options3 = {}) {
    super();
    this.options = options3;
    this._context = context2 || this;
    this._action = action;
    if (action instanceof Action) {
      this._register(action.onDidChange((event) => {
        if (!this.element) {
          return;
        }
        this.handleActionChangeEvent(event);
      }));
    }
  }
  get action() {
    return this._action;
  }
  handleActionChangeEvent(event) {
    if (event.enabled !== void 0) {
      this.updateEnabled();
    }
    if (event.checked !== void 0) {
      this.updateChecked();
    }
    if (event.class !== void 0) {
      this.updateClass();
    }
    if (event.label !== void 0) {
      this.updateLabel();
      this.updateTooltip();
    }
    if (event.tooltip !== void 0) {
      this.updateTooltip();
    }
  }
  get actionRunner() {
    if (!this._actionRunner) {
      this._actionRunner = this._register(new ActionRunner());
    }
    return this._actionRunner;
  }
  set actionRunner(actionRunner) {
    this._actionRunner = actionRunner;
  }
  isEnabled() {
    return this._action.enabled;
  }
  setActionContext(newContext) {
    this._context = newContext;
  }
  render(container3) {
    const element = this.element = container3;
    this._register(Gesture.addTarget(container3));
    const enableDragging = this.options && this.options.draggable;
    if (enableDragging) {
      container3.draggable = true;
      if (isFirefox2) {
        this._register(addDisposableListener(container3, EventType.DRAG_START, (e) => e.dataTransfer?.setData(DataTransfers.TEXT, this._action.label)));
      }
    }
    this._register(addDisposableListener(element, EventType2.Tap, (e) => this.onClick(e, true)));
    this._register(addDisposableListener(element, EventType.MOUSE_DOWN, (e) => {
      if (!enableDragging) {
        EventHelper.stop(e, true);
      }
      if (this._action.enabled && e.button === 0) {
        element.classList.add("active");
      }
    }));
    if (isMacintosh) {
      this._register(addDisposableListener(element, EventType.CONTEXT_MENU, (e) => {
        if (e.button === 0 && e.ctrlKey === true) {
          this.onClick(e);
        }
      }));
    }
    this._register(addDisposableListener(element, EventType.CLICK, (e) => {
      EventHelper.stop(e, true);
      if (!(this.options && this.options.isMenu)) {
        this.onClick(e);
      }
    }));
    this._register(addDisposableListener(element, EventType.DBLCLICK, (e) => {
      EventHelper.stop(e, true);
    }));
    [EventType.MOUSE_UP, EventType.MOUSE_OUT].forEach((event) => {
      this._register(addDisposableListener(element, event, (e) => {
        EventHelper.stop(e);
        element.classList.remove("active");
      }));
    });
  }
  onClick(event, preserveFocus = false) {
    EventHelper.stop(event, true);
    const context2 = isUndefinedOrNull(this._context) ? this.options?.useEventAsContext ? event : { preserveFocus } : this._context;
    this.actionRunner.run(this._action, context2);
  }
  // Only set the tabIndex on the element once it is about to get focused
  // That way this element wont be a tab stop when it is not needed #106441
  focus() {
    if (this.element) {
      this.element.tabIndex = 0;
      this.element.focus();
      this.element.classList.add("focused");
    }
  }
  isFocused() {
    return !!this.element?.classList.contains("focused");
  }
  blur() {
    if (this.element) {
      this.element.blur();
      this.element.tabIndex = -1;
      this.element.classList.remove("focused");
    }
  }
  setFocusable(focusable) {
    if (this.element) {
      this.element.tabIndex = focusable ? 0 : -1;
    }
  }
  get trapsArrowNavigation() {
    return false;
  }
  updateEnabled() {
  }
  updateLabel() {
  }
  getClass() {
    return this.action.class;
  }
  getTooltip() {
    return this.action.tooltip;
  }
  getHoverContents() {
    return this.getTooltip();
  }
  getHoverOptions() {
    return void 0;
  }
  updateTooltip() {
    if (!this.element) {
      return;
    }
    const title = this.getHoverContents() ?? "";
    this.updateAriaLabel();
    if (!this.customHover && title !== "") {
      const hoverDelegate = this.options.hoverDelegate ?? getDefaultHoverDelegate("element");
      this.customHover = this._store.add(getBaseLayerHoverDelegate().setupManagedHover(hoverDelegate, this.element, title, this.getHoverOptions()));
    } else if (this.customHover) {
      this.customHover.update(title, this.getHoverOptions());
    }
  }
  updateAriaLabel() {
    if (this.element) {
      const title = this.getTooltip() ?? "";
      this.element.setAttribute("aria-label", title);
    }
  }
  updateClass() {
  }
  updateChecked() {
  }
  dispose() {
    if (this.element) {
      this.element.remove();
      this.element = void 0;
    }
    this._context = void 0;
    super.dispose();
  }
};

var ActionViewItem = class extends BaseActionViewItem {
  constructor(context2, action, options3) {
    options3 = {
      ...options3,
      icon: options3.icon !== void 0 ? options3.icon : false,
      label: options3.label !== void 0 ? options3.label : true
    };
    super(context2, action, options3);
    this.options = options3;
    this.cssClass = "";
  }
  render(container3) {
    super.render(container3);
    assertType(this.element);
    const label3 = document.createElement("a");
    label3.classList.add("action-label");
    label3.setAttribute("role", this.getDefaultAriaRole());
    this.label = label3;
    this.element.appendChild(label3);
    if (this.options.label && this.options.keybinding && !this.options.keybindingNotRenderedWithLabel) {
      const kbLabel = document.createElement("span");
      kbLabel.classList.add("keybinding");
      kbLabel.textContent = this.options.keybinding;
      this.element.appendChild(kbLabel);
    }
    this.updateClass();
    this.updateLabel();
    this.updateTooltip();
    this.updateEnabled();
    this.updateChecked();
  }
  getDefaultAriaRole() {
    if (this._action.id === Separator.ID) {
      return "presentation";
    } else {
      if (this.options.isMenu) {
        return "menuitem";
      } else if (this.options.isTabList) {
        return "tab";
      } else {
        return "button";
      }
    }
  }
  // Only set the tabIndex on the element once it is about to get focused
  // That way this element wont be a tab stop when it is not needed #106441
  focus() {
    if (this.label) {
      this.label.tabIndex = 0;
      this.label.focus();
    }
  }
  isFocused() {
    return !!this.label && this.label?.tabIndex === 0;
  }
  blur() {
    if (this.label) {
      this.label.tabIndex = -1;
    }
  }
  setFocusable(focusable) {
    if (this.label) {
      this.label.tabIndex = focusable ? 0 : -1;
    }
  }
  updateLabel() {
    if (this.options.label && this.label) {
      this.label.textContent = this.action.label;
    }
  }
  getTooltip() {
    let title = null;
    if (this.action.tooltip) {
      title = this.action.tooltip;
    } else if (this.action.label) {
      title = this.action.label;
      if (this.options.keybinding) {
        title = localize(0, null, title, this.options.keybinding);
      }
    }
    return title ?? void 0;
  }
  updateClass() {
    if (this.cssClass && this.label) {
      this.label.classList.remove(...this.cssClass.split(" "));
    }
    if (this.action.id === Separator.ID && this.action.class) {
      this.label?.classList.add(this.action.class);
    } else if (this.options.icon) {
      this.cssClass = this.getClass();
      if (this.label) {
        this.label.classList.add("codicon");
        if (this.cssClass) {
          this.label.classList.add(...this.cssClass.split(" "));
        }
      }
      this.updateEnabled();
    } else {
      this.label?.classList.remove("codicon");
    }
  }
  updateEnabled() {
    if (this.action.enabled) {
      if (this.label) {
        this.label.removeAttribute("aria-disabled");
        this.label.classList.remove("disabled");
      }
      this.element?.classList.remove("disabled");
    } else {
      if (this.label) {
        this.label.setAttribute("aria-disabled", "true");
        this.label.classList.add("disabled");
      }
      this.element?.classList.add("disabled");
    }
  }
  updateAriaLabel() {
    if (this.label) {
      const title = this.getTooltip() ?? "";
      this.label.setAttribute("aria-label", title);
    }
  }
  updateChecked() {
    if (this.label) {
      if (this.action.checked !== void 0) {
        this.label.classList.toggle("checked", this.action.checked);
        if (this.options.isTabList) {
          this.label.setAttribute("aria-selected", this.action.checked ? "true" : "false");
        } else {
          this.label.setAttribute("aria-pressed", this.action.checked ? "true" : "false");
          this.label.setAttribute("role", "button");
        }
      } else {
        this.label.classList.remove("checked");
        this.label.removeAttribute(this.options.isTabList ? "aria-selected" : "aria-pressed");
        this.label.setAttribute("role", this.getDefaultAriaRole());
      }
    }
  }
};

var SelectActionViewItem = class extends BaseActionViewItem {
  constructor(ctx, action, options3, selected, contextViewProvider, styles, selectBoxOptions) {
    super(ctx, action);
    this.selectBox = new SelectBox(options3, selected, contextViewProvider, styles, selectBoxOptions);
    this.selectBox.setFocusable(false);
    this._register(this.selectBox);
    this.registerListeners();
  }
  setOptions(options3, selected) {
    this.selectBox.setOptions(options3, selected);
  }
  select(index2) {
    this.selectBox.select(index2);
  }
  registerListeners() {
    this._register(this.selectBox.onDidSelect((e) => this.runAction(e.selected, e.index)));
  }
  runAction(option2, index2) {
    this.actionRunner.run(this._action, this.getActionContext(option2, index2));
  }
  getActionContext(option2, index2) {
    return option2;
  }
  setFocusable(focusable) {
    this.selectBox.setFocusable(focusable);
  }
  focus() {
    this.selectBox?.focus();
  }
  blur() {
    this.selectBox?.blur();
  }
  render(container3) {
    this.selectBox.render(container3);
  }
};
export { BaseActionViewItem, ActionViewItem, SelectActionViewItem };
