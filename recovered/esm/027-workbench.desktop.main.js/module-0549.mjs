// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/toggle/toggle.ts
import { BaseActionViewItem } from "./module-0476.mjs";
import { Widget } from "./module-0252.mjs";
import { Emitter } from "./module-0017.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { $, EventType, addDisposableGenericMouseDownListener, addDisposableListener, isActiveElement, isHTMLElement } from "./module-0075.mjs";
import { getCodiconAriaLabel, stripIcons } from "./module-0461.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/base/browser/ui/toggle/toggle.ts
var unthemedToggleStyles = {
  inputActiveOptionBorder: "#007ACC00",
  inputActiveOptionForeground: "#FFFFFF",
  inputActiveOptionBackground: "#0E639C50"
};

var ToggleActionViewItem = class extends BaseActionViewItem {
  constructor(context2, action, options3) {
    super(context2, action, options3);
    const title = this.options.keybinding ? `${this._action.label} (${this.options.keybinding})` : this._action.label;
    this.toggle = this._register(new Toggle({
      actionClassName: this._action.class,
      isChecked: !!this._action.checked,
      title,
      notFocusable: true,
      inputActiveOptionBackground: options3.toggleStyles?.inputActiveOptionBackground,
      inputActiveOptionBorder: options3.toggleStyles?.inputActiveOptionBorder,
      inputActiveOptionForeground: options3.toggleStyles?.inputActiveOptionForeground
    }));
    this._register(this.toggle.onChange(() => {
      this._action.checked = !!this.toggle && this.toggle.checked;
    }));
  }
  render(container3) {
    this.element = container3;
    this.element.appendChild(this.toggle.domNode);
    this.updateChecked();
    this.updateEnabled();
  }
  updateEnabled() {
    if (this.toggle) {
      if (this.isEnabled()) {
        this.toggle.enable();
        this.element?.classList.remove("disabled");
      } else {
        this.toggle.disable();
        this.element?.classList.add("disabled");
      }
    }
  }
  updateChecked() {
    this.toggle.checked = !!this._action.checked;
  }
  updateLabel() {
    const title = this.options.keybinding ? `${this._action.label} (${this.options.keybinding})` : this._action.label;
    this.toggle.setTitle(title);
  }
  focus() {
    this.toggle.domNode.tabIndex = 0;
    this.toggle.focus();
  }
  blur() {
    this.toggle.domNode.tabIndex = -1;
    this.toggle.domNode.blur();
  }
  setFocusable(focusable) {
    this.toggle.domNode.tabIndex = focusable ? 0 : -1;
  }
};

var Toggle = class extends Widget {
  constructor(opts) {
    super();
    this._onChange = this._register(new Emitter());
    this._onKeyDown = this._register(new Emitter());
    this._opts = opts;
    this._title = this._opts.title;
    this._checked = this._opts.isChecked;
    const classes2 = ["monaco-custom-toggle"];
    if (this._opts.icon) {
      this._icon = this._opts.icon;
      classes2.push(...ThemeIcon.asClassNameArray(this._icon));
    }
    if (this._opts.actionClassName) {
      classes2.push(...this._opts.actionClassName.split(" "));
    }
    if (this._checked) {
      classes2.push("checked");
    }
    this.domNode = document.createElement("div");
    this._register(getBaseLayerHoverDelegate().setupDelayedHover(this.domNode, () => ({
      content: !isMarkdownString(this._title) && !isHTMLElement(this._title) ? stripIcons(this._title) : this._title,
      style: 1 /* Pointer */
    }), this._opts.hoverLifecycleOptions));
    this.domNode.classList.add(...classes2);
    if (!this._opts.notFocusable) {
      this.domNode.tabIndex = 0;
    }
    this.domNode.setAttribute("role", "checkbox");
    this.domNode.setAttribute("aria-checked", String(this._checked));
    this.setTitle(this._opts.title);
    this.applyStyles();
    this.onclick(this.domNode, (ev) => {
      if (this.enabled) {
        this.checked = !this._checked;
        this._onChange.fire(false);
        ev.preventDefault();
        ev.stopPropagation();
      }
    });
    this._register(this.ignoreGesture(this.domNode));
    this.onkeydown(this.domNode, (keyboardEvent) => {
      if (!this.enabled) {
        return;
      }
      if (keyboardEvent.keyCode === 10 /* Space */ || keyboardEvent.keyCode === 3 /* Enter */) {
        this.checked = !this._checked;
        this._onChange.fire(true);
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        return;
      }
      this._onKeyDown.fire(keyboardEvent);
    });
  }
  get onChange() {
    return this._onChange.event;
  }
  get onKeyDown() {
    return this._onKeyDown.event;
  }
  get enabled() {
    return this.domNode.getAttribute("aria-disabled") !== "true";
  }
  focus() {
    this.domNode.focus();
  }
  get checked() {
    return this._checked;
  }
  set checked(newIsChecked) {
    this._checked = newIsChecked;
    this.domNode.setAttribute("aria-checked", String(this._checked));
    this.domNode.classList.toggle("checked", this._checked);
    this.applyStyles();
  }
  setIcon(icon2) {
    if (this._icon) {
      this.domNode.classList.remove(...ThemeIcon.asClassNameArray(this._icon));
    }
    this._icon = icon2;
    if (this._icon) {
      this.domNode.classList.add(...ThemeIcon.asClassNameArray(this._icon));
    }
  }
  width() {
    return 2 + 2 + 2 + 16;
  }
  applyStyles() {
    if (this.domNode) {
      this.domNode.style.borderColor = this._checked && this._opts.inputActiveOptionBorder || "";
      this.domNode.style.color = this._checked && this._opts.inputActiveOptionForeground || "inherit";
      this.domNode.style.backgroundColor = this._checked && this._opts.inputActiveOptionBackground || "";
    }
  }
  enable() {
    this.domNode.setAttribute("aria-disabled", String(false));
    this.domNode.classList.remove("disabled");
    if (!this._opts.notFocusable) {
      this.domNode.tabIndex = 0;
    }
  }
  disable() {
    this.domNode.setAttribute("aria-disabled", String(true));
    this.domNode.classList.add("disabled");
    if (!this._opts.notFocusable) {
      this.domNode.tabIndex = -1;
    }
  }
  setTitle(newTitle) {
    this._title = newTitle;
    const ariaLabel = typeof newTitle === "string" ? newTitle : isMarkdownString(newTitle) ? newTitle.value : newTitle.textContent;
    this.domNode.setAttribute("aria-label", getCodiconAriaLabel(ariaLabel));
  }
  set visible(visible) {
    this.domNode.style.display = visible ? "" : "none";
  }
  get visible() {
    return this.domNode.style.display !== "none";
  }
};

var BaseCheckbox = class extends Widget {
  constructor(checkbox, domNode, styles) {
    super();
    this.checkbox = checkbox;
    this.domNode = domNode;
    this.styles = styles;
    this._onChange = this._register(new Emitter());
    this.onChange = this._onChange.event;
    this.applyStyles();
  }
  static {
    this.CLASS_NAME = "monaco-checkbox";
  }
  get enabled() {
    return this.checkbox.enabled;
  }
  focus() {
    this.domNode.focus();
  }
  hasFocus() {
    return isActiveElement(this.domNode);
  }
  enable() {
    this.checkbox.enable();
    this.applyStyles(true);
  }
  disable() {
    this.checkbox.disable();
    this.applyStyles(false);
  }
  setTitle(newTitle) {
    this.checkbox.setTitle(newTitle);
  }
  applyStyles(enabled = this.enabled) {
    this.domNode.style.color = (enabled ? this.styles.checkboxForeground : this.styles.checkboxDisabledForeground) || "";
    this.domNode.style.backgroundColor = (enabled ? this.styles.checkboxBackground : this.styles.checkboxDisabledBackground) || "";
    this.domNode.style.borderColor = (enabled ? this.styles.checkboxBorder : this.styles.checkboxDisabledBackground) || "";
    const size3 = this.styles.size || 18;
    this.domNode.style.width = this.domNode.style.height = this.domNode.style.fontSize = `${size3}px`;
    this.domNode.style.fontSize = `${size3 - 2}px`;
  }
};

var Checkbox = class extends BaseCheckbox {
  constructor(title, isChecked, styles) {
    const toggle = new Toggle({ title, isChecked, icon: Codicon.check, actionClassName: BaseCheckbox.CLASS_NAME, hoverLifecycleOptions: styles.hoverLifecycleOptions, ...unthemedToggleStyles });
    super(toggle, toggle.domNode, styles);
    this._register(toggle);
    this._register(this.checkbox.onChange((keyboard) => {
      this.applyStyles();
      this._onChange.fire(keyboard);
    }));
  }
  get checked() {
    return this.checkbox.checked;
  }
  set checked(newIsChecked) {
    this.checkbox.checked = newIsChecked;
    this.applyStyles();
  }
  applyStyles(enabled) {
    if (this.checkbox.checked) {
      this.checkbox.setIcon(Codicon.check);
    } else {
      this.checkbox.setIcon(void 0);
    }
    super.applyStyles(enabled);
  }
};

var TriStateCheckbox = class extends BaseCheckbox {
  constructor(title, _state, styles) {
    let icon2;
    switch (_state) {
      case true:
        icon2 = Codicon.check;
        break;
      case "mixed":
        icon2 = Codicon.dash;
        break;
      case false:
        icon2 = void 0;
        break;
    }
    const checkbox = new Toggle({
      title,
      isChecked: _state === true,
      icon: icon2,
      actionClassName: Checkbox.CLASS_NAME,
      hoverLifecycleOptions: styles.hoverLifecycleOptions,
      ...unthemedToggleStyles
    });
    super(
      checkbox,
      checkbox.domNode,
      styles
    );
    this._state = _state;
    this._register(checkbox);
    this._register(this.checkbox.onChange((keyboard) => {
      this._state = this.checkbox.checked;
      this.applyStyles();
      this._onChange.fire(keyboard);
    }));
  }
  get checked() {
    return this._state;
  }
  set checked(newState) {
    if (this._state !== newState) {
      this._state = newState;
      this.checkbox.checked = newState === true;
      this.applyStyles();
    }
  }
  applyStyles(enabled) {
    switch (this._state) {
      case true:
        this.checkbox.setIcon(Codicon.check);
        break;
      case "mixed":
        this.checkbox.setIcon(Codicon.dash);
        break;
      case false:
        this.checkbox.setIcon(void 0);
        break;
    }
    super.applyStyles(enabled);
  }
};

var CheckboxActionViewItem = class extends BaseActionViewItem {
  constructor(context2, action, options3) {
    super(context2, action, options3);
    this.toggle = this._register(new Checkbox(this._action.label, !!this._action.checked, options3.checkboxStyles));
    this._register(this.toggle.onChange(() => this.onChange()));
  }
  render(container3) {
    this.element = container3;
    this.element.classList.add("checkbox-action-item");
    this.element.appendChild(this.toggle.domNode);
    if (this.options.label && this._action.label) {
      const label3 = this.element.appendChild($("span.checkbox-label", void 0, this._action.label));
      this._register(addDisposableGenericMouseDownListener(label3, (e) => {
        e.preventDefault();
        if (this.isEnabled()) {
          this.focus();
        }
      }));
      this._register(addDisposableListener(label3, EventType.CLICK, (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.isEnabled()) {
          this.toggle.checked = !this.toggle.checked;
          this.onChange();
        }
      }));
    }
    this.updateEnabled();
    this.updateClass();
    this.updateChecked();
    this.updateTooltip();
  }
  onChange() {
    this._action.checked = !!this.toggle && this.toggle.checked;
    this.actionRunner.run(this._action, this._context);
  }
  updateEnabled() {
    if (this.isEnabled()) {
      this.toggle.enable();
    } else {
      this.toggle.disable();
    }
    if (this.action.enabled) {
      this.element?.classList.remove("disabled");
    } else {
      this.element?.classList.add("disabled");
    }
  }
  updateChecked() {
    this.toggle.checked = !!this._action.checked;
  }
  updateClass() {
    if (this.cssClass) {
      this.toggle.domNode.classList.remove(...this.cssClass.split(" "));
    }
    this.cssClass = this.getClass();
    if (this.cssClass) {
      this.toggle.domNode.classList.add(...this.cssClass.split(" "));
    }
  }
  focus() {
    this.toggle.domNode.tabIndex = 0;
    this.toggle.focus();
  }
  blur() {
    this.toggle.domNode.tabIndex = -1;
    this.toggle.domNode.blur();
  }
  setFocusable(focusable) {
    this.toggle.domNode.tabIndex = focusable ? 0 : -1;
  }
};

function createToggleActionViewItemProvider(toggleStyles) {
  return (action, options3) => {
    if (action.checked !== void 0) {
      return new ToggleActionViewItem(null, action, { ...options3, toggleStyles });
    }
    return void 0;
  };
}
export { createToggleActionViewItemProvider, unthemedToggleStyles, ToggleActionViewItem, Toggle, BaseCheckbox, Checkbox, TriStateCheckbox, CheckboxActionViewItem };
