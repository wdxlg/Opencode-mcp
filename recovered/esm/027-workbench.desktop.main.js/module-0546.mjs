// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/button/button.ts
import { Color } from "./module-0197.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { $, EventHelper, EventType, addDisposableListener, isActiveElement, reset, trackFocus } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { isMarkdownString, markdownStringEqual } from "./module-0462.mjs";
import { renderAsPlaintext, renderMarkdown } from "./module-0468.mjs";
import { safeSetInnerHtml } from "./module-0466.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { createInstantHoverDelegate, getDefaultHoverDelegate } from "./module-0448.mjs";
import { toAction } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/base/browser/ui/button/button.ts
var unthemedButtonStyles = {
  buttonBackground: "#0E639C",
  buttonHoverBackground: "#006BB3",
  buttonSeparator: Color.white.toString(),
  buttonForeground: Color.white.toString(),
  buttonBorder: void 0,
  buttonSecondaryBackground: void 0,
  buttonSecondaryForeground: void 0,
  buttonSecondaryHoverBackground: void 0,
  buttonSecondaryBorder: void 0
};

var buttonSanitizerConfig = Object.freeze({
  allowedTags: {
    override: ["b", "i", "u", "code", "span"]
  },
  allowedAttributes: {
    override: ["class"]
  }
});

var buttonMarkdownRenderOptions = Object.freeze({
  sanitizerConfig: {
    allowedAttributes: {
      override: ["class"]
    }
  }
});

var Button = class extends Disposable {
  constructor(container3, options3) {
    super();
    this._label = "";
    this._onDidClick = this._register(new Emitter());
    this._onDidEscape = this._register(new Emitter());
    this.options = options3;
    this._element = document.createElement("a");
    this._element.classList.add("monaco-button");
    this._element.tabIndex = 0;
    this._element.setAttribute("role", "button");
    this._element.classList.toggle("secondary", !!options3.secondary);
    this._element.classList.toggle("small", !!options3.small);
    const background = options3.secondary ? options3.buttonSecondaryBackground : options3.buttonBackground;
    const foreground2 = options3.secondary ? options3.buttonSecondaryForeground : options3.buttonForeground;
    const border = options3.secondary ? options3.buttonSecondaryBorder : options3.buttonBorder;
    this._element.style.color = foreground2 || "";
    this._element.style.backgroundColor = background || "";
    if (border) {
      this._element.style.border = `1px solid ${border}`;
    }
    if (options3.supportShortLabel) {
      this._labelShortElement = document.createElement("div");
      this._labelShortElement.classList.add("monaco-button-label-short");
      this._element.appendChild(this._labelShortElement);
      this._labelElement = document.createElement("div");
      this._labelElement.classList.add("monaco-button-label");
      this._element.appendChild(this._labelElement);
      this._element.classList.add("monaco-text-button-with-short-label");
    }
    if (typeof options3.title === "string") {
      this.setTitle(options3.title);
    }
    if (typeof options3.ariaLabel === "string") {
      this._element.setAttribute("aria-label", options3.ariaLabel);
    }
    container3.appendChild(this._element);
    this.enabled = !options3.disabled;
    this._register(Gesture.addTarget(this._element));
    [EventType.CLICK, EventType2.Tap].forEach((eventType) => {
      this._register(addDisposableListener(this._element, eventType, (e) => {
        if (!this.enabled) {
          EventHelper.stop(e);
          return;
        }
        this._onDidClick.fire(e);
      }));
    });
    this._register(addDisposableListener(this._element, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      let eventHandled = false;
      if (this.enabled && (event.equals(3 /* Enter */) || event.equals(10 /* Space */))) {
        this._onDidClick.fire(e);
        eventHandled = true;
      } else if (event.equals(9 /* Escape */)) {
        this._onDidEscape.fire(e);
        this._element.blur();
        eventHandled = true;
      }
      if (eventHandled) {
        EventHelper.stop(event, true);
      }
    }));
    this._register(addDisposableListener(this._element, EventType.MOUSE_OVER, (e) => {
      if (!this._element.classList.contains("disabled")) {
        this.updateStyles(true);
      }
    }));
    this._register(addDisposableListener(this._element, EventType.MOUSE_OUT, (e) => {
      this.updateStyles(false);
    }));
    this.focusTracker = this._register(trackFocus(this._element));
    this._register(this.focusTracker.onDidFocus(() => {
      if (this.enabled) {
        this.updateStyles(true);
      }
    }));
    this._register(this.focusTracker.onDidBlur(() => {
      if (this.enabled) {
        this.updateStyles(false);
      }
    }));
  }
  get onDidClick() {
    return this._onDidClick.event;
  }
  get onDidEscape() {
    return this._onDidEscape.event;
  }
  dispose() {
    super.dispose();
    this._element.remove();
  }
  getContentElements(content2) {
    const elements = [];
    for (let segment of renderLabelWithIcons(content2)) {
      if (typeof segment === "string") {
        segment = segment.trim();
        if (segment === "") {
          continue;
        }
        const node = document.createElement("span");
        node.textContent = segment;
        elements.push(node);
      } else {
        elements.push(segment);
      }
    }
    return elements;
  }
  updateStyles(hover) {
    let background;
    let foreground2;
    let border;
    if (this.options.secondary) {
      background = hover ? this.options.buttonSecondaryHoverBackground : this.options.buttonSecondaryBackground;
      foreground2 = this.options.buttonSecondaryForeground;
      border = this.options.buttonSecondaryBorder;
    } else {
      background = hover ? this.options.buttonHoverBackground : this.options.buttonBackground;
      foreground2 = this.options.buttonForeground;
      border = this.options.buttonBorder;
    }
    this._element.style.backgroundColor = background || "";
    this._element.style.color = foreground2 || "";
    this._element.style.border = border ? `1px solid ${border}` : "";
  }
  get element() {
    return this._element;
  }
  set label(value2) {
    if (this._label === value2) {
      return;
    }
    if (isMarkdownString(this._label) && isMarkdownString(value2) && markdownStringEqual(this._label, value2)) {
      return;
    }
    this._element.classList.add("monaco-text-button");
    const labelElement = this.options.supportShortLabel ? this._labelElement : this._element;
    if (isMarkdownString(value2)) {
      const rendered = renderMarkdown(value2, buttonMarkdownRenderOptions, document.createElement("span"));
      rendered.dispose();
      const root = rendered.element.querySelector("p")?.innerHTML;
      if (root) {
        safeSetInnerHtml(labelElement, root, buttonSanitizerConfig);
      } else {
        reset(labelElement);
      }
    } else {
      if (this.options.supportIcons) {
        reset(labelElement, ...this.getContentElements(value2));
      } else {
        labelElement.textContent = value2;
      }
    }
    let title = "";
    if (typeof this.options.title === "string") {
      title = this.options.title;
    } else if (this.options.title) {
      title = renderAsPlaintext(value2);
    }
    this.setTitle(title);
    this._setAriaLabel();
    this._label = value2;
  }
  get label() {
    return this._label;
  }
  set labelShort(value2) {
    if (!this.options.supportShortLabel || !this._labelShortElement) {
      return;
    }
    if (this.options.supportIcons) {
      reset(this._labelShortElement, ...this.getContentElements(value2));
    } else {
      this._labelShortElement.textContent = value2;
    }
  }
  _setAriaLabel() {
    if (typeof this.options.ariaLabel === "string") {
      this._element.setAttribute("aria-label", this.options.ariaLabel);
    } else if (typeof this.options.title === "string") {
      this._element.setAttribute("aria-label", this.options.title);
    }
  }
  set icon(icon2) {
    this._setAriaLabel();
    const oldIcons = Array.from(this._element.classList).filter((item) => item.startsWith("codicon-"));
    this._element.classList.remove(...oldIcons);
    this._element.classList.add(...ThemeIcon.asClassNameArray(icon2));
  }
  set enabled(value2) {
    if (value2) {
      this._element.classList.remove("disabled");
      this._element.setAttribute("aria-disabled", String(false));
      this._element.tabIndex = 0;
    } else {
      this._element.classList.add("disabled");
      this._element.setAttribute("aria-disabled", String(true));
    }
  }
  get enabled() {
    return !this._element.classList.contains("disabled");
  }
  set secondary(value2) {
    this._element.classList.toggle("secondary", value2);
    this.options.secondary = value2;
    this.updateStyles(false);
  }
  set checked(value2) {
    if (value2) {
      this._element.classList.add("checked");
      this._element.setAttribute("aria-pressed", "true");
    } else {
      this._element.classList.remove("checked");
      this._element.setAttribute("aria-pressed", "false");
    }
  }
  get checked() {
    return this._element.classList.contains("checked");
  }
  setTitle(title) {
    if (!this._hover && title !== "") {
      this._hover = this._register(getBaseLayerHoverDelegate().setupManagedHover(this.options.hoverDelegate ?? getDefaultHoverDelegate("element"), this._element, title));
    } else if (this._hover) {
      this._hover.update(title);
    }
  }
  setAriaLabel(ariaLabel) {
    this._element.setAttribute("aria-label", ariaLabel);
  }
  focus() {
    this._element.focus();
  }
  hasFocus() {
    return isActiveElement(this._element);
  }
};

var ButtonWithDropdown = class extends Disposable {
  constructor(container3, options3) {
    super();
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this.element = document.createElement("div");
    this.element.classList.add("monaco-button-dropdown");
    container3.appendChild(this.element);
    if (!options3.hoverDelegate) {
      options3 = { ...options3, hoverDelegate: this._register(createInstantHoverDelegate()) };
    }
    this.primaryButton = this._register(new Button(this.element, options3));
    this._register(this.primaryButton.onDidClick((e) => this._onDidClick.fire(e)));
    this.action = toAction({ id: "primaryAction", label: renderAsPlaintext(this.primaryButton.label), run: async () => this._onDidClick.fire(void 0) });
    this.separatorContainer = document.createElement("div");
    this.separatorContainer.classList.add("monaco-button-dropdown-separator");
    this.separator = document.createElement("div");
    this.separatorContainer.appendChild(this.separator);
    this.element.appendChild(this.separatorContainer);
    const border = options3.buttonBorder;
    if (border) {
      this.separatorContainer.style.borderTop = "1px solid " + border;
      this.separatorContainer.style.borderBottom = "1px solid " + border;
    }
    const buttonBackground2 = options3.secondary ? options3.buttonSecondaryBackground : options3.buttonBackground;
    this.separatorContainer.style.backgroundColor = buttonBackground2 ?? "";
    this.separator.style.backgroundColor = options3.buttonSeparator ?? "";
    this.dropdownButton = this._register(new Button(this.element, { ...options3, title: localize(1, null), supportIcons: true }));
    this.dropdownButton.element.setAttribute("aria-haspopup", "true");
    this.dropdownButton.element.setAttribute("aria-expanded", "false");
    this.dropdownButton.element.classList.add("monaco-dropdown-button");
    this.dropdownButton.icon = Codicon.dropDownButton;
    this._register(this.dropdownButton.onDidClick((e) => {
      const actions = Array.isArray(options3.actions) ? options3.actions : options3.actions.getActions();
      options3.contextMenuProvider.showContextMenu({
        getAnchor: () => this.dropdownButton.element,
        getActions: () => options3.addPrimaryActionToDropdown === false ? [...actions] : [this.action, ...actions],
        actionRunner: options3.actionRunner,
        onHide: () => this.dropdownButton.element.setAttribute("aria-expanded", "false"),
        layer: options3.dropdownLayer
      });
      this.dropdownButton.element.setAttribute("aria-expanded", "true");
    }));
  }
  dispose() {
    super.dispose();
    this.element.remove();
  }
  set label(value2) {
    this.primaryButton.label = value2;
    this.action.label = value2;
  }
  set icon(icon2) {
    this.primaryButton.icon = icon2;
  }
  set enabled(enabled) {
    this.primaryButton.enabled = enabled;
    this.dropdownButton.enabled = enabled;
    this.element.classList.toggle("disabled", !enabled);
  }
  get enabled() {
    return this.primaryButton.enabled;
  }
  set checked(value2) {
    this.primaryButton.checked = value2;
  }
  get checked() {
    return this.primaryButton.checked;
  }
  setTitle(title) {
    this.primaryButton.setTitle(title);
  }
  setAriaLabel(ariaLabel) {
    this.primaryButton.setAriaLabel(ariaLabel);
  }
  focus() {
    this.primaryButton.focus();
  }
  hasFocus() {
    return this.primaryButton.hasFocus() || this.dropdownButton.hasFocus();
  }
};

var ButtonWithDescription = class {
  constructor(container3, options3) {
    this.options = options3;
    this._element = document.createElement("div");
    this._element.classList.add("monaco-description-button");
    this._button = new Button(this._element, options3);
    this._descriptionElement = document.createElement("div");
    this._descriptionElement.classList.add("monaco-button-description");
    this._element.appendChild(this._descriptionElement);
    container3.appendChild(this._element);
  }
  get onDidClick() {
    return this._button.onDidClick;
  }
  get element() {
    return this._element;
  }
  set label(value2) {
    this._button.label = value2;
  }
  set icon(icon2) {
    this._button.icon = icon2;
  }
  get enabled() {
    return this._button.enabled;
  }
  set enabled(enabled) {
    this._button.enabled = enabled;
  }
  set checked(value2) {
    this._button.checked = value2;
  }
  get checked() {
    return this._button.checked;
  }
  setTitle(title) {
    this._button.setTitle(title);
  }
  setAriaLabel(ariaLabel) {
    this._button.setAriaLabel(ariaLabel);
  }
  focus() {
    this._button.focus();
  }
  hasFocus() {
    return this._button.hasFocus();
  }
  dispose() {
    this._button.dispose();
  }
  set description(value2) {
    if (this.options.supportIcons) {
      reset(this._descriptionElement, ...renderLabelWithIcons(value2));
    } else {
      this._descriptionElement.textContent = value2;
    }
  }
};

var ButtonBar = class {
  constructor(container3, options3) {
    this.container = container3;
    this.options = options3;
    this._buttons = [];
    this._buttonStore = new DisposableStore();
  }
  dispose() {
    this._buttonStore.dispose();
  }
  get buttons() {
    return this._buttons;
  }
  clear() {
    this._buttonStore.clear();
    this._buttons.length = 0;
  }
  addButton(options3) {
    const button = this._buttonStore.add(new Button(this.container, options3));
    this.pushButton(button);
    return button;
  }
  addButtonWithDescription(options3) {
    const button = this._buttonStore.add(new ButtonWithDescription(this.container, options3));
    this.pushButton(button);
    return button;
  }
  addButtonWithDropdown(options3) {
    const button = this._buttonStore.add(new ButtonWithDropdown(this.container, options3));
    this.pushButton(button);
    return button;
  }
  pushButton(button) {
    this._buttons.push(button);
    const index2 = this._buttons.length - 1;
    this._buttonStore.add(addDisposableListener(button.element, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      let eventHandled = true;
      let buttonIndexToFocus;
      if (event.equals(this.options?.alignment === 1 /* Vertical */ ? 16 /* UpArrow */ : 15 /* LeftArrow */)) {
        buttonIndexToFocus = index2 > 0 ? index2 - 1 : this._buttons.length - 1;
      } else if (event.equals(this.options?.alignment === 1 /* Vertical */ ? 18 /* DownArrow */ : 17 /* RightArrow */)) {
        buttonIndexToFocus = index2 === this._buttons.length - 1 ? 0 : index2 + 1;
      } else {
        eventHandled = false;
      }
      if (eventHandled && typeof buttonIndexToFocus === "number") {
        this._buttons[buttonIndexToFocus].focus();
        EventHelper.stop(e, true);
      }
    }));
  }
};

var ButtonWithIcon = class extends Button {
  get labelElement() {
    return this._mdlabelElement;
  }
  get iconElement() {
    return this._iconElement;
  }
  constructor(container3, options3) {
    super(container3, options3);
    if (options3.supportShortLabel) {
      throw new Error("ButtonWithIcon does not support short labels");
    }
    this._element.classList.add("monaco-icon-button");
    this._iconElement = $("");
    this._mdlabelElement = $(".monaco-button-mdlabel");
    this._element.append(this._iconElement, this._mdlabelElement);
  }
  get label() {
    return super.label;
  }
  set label(value2) {
    if (this._label === value2) {
      return;
    }
    if (isMarkdownString(this._label) && isMarkdownString(value2) && markdownStringEqual(this._label, value2)) {
      return;
    }
    this._element.classList.add("monaco-text-button");
    if (isMarkdownString(value2)) {
      const rendered = renderMarkdown(value2, buttonMarkdownRenderOptions, document.createElement("span"));
      rendered.dispose();
      const root = rendered.element.querySelector("p")?.innerHTML;
      if (root) {
        safeSetInnerHtml(this._mdlabelElement, root, buttonSanitizerConfig);
      } else {
        reset(this._mdlabelElement);
      }
    } else {
      if (this.options.supportIcons) {
        reset(this._mdlabelElement, ...this.getContentElements(value2));
      } else {
        this._mdlabelElement.textContent = value2;
      }
    }
    let title = "";
    if (typeof this.options.title === "string") {
      title = this.options.title;
    } else if (this.options.title) {
      title = renderAsPlaintext(value2);
    }
    this.setTitle(title);
    this._setAriaLabel();
    this._label = value2;
  }
  get icon() {
    return super.icon;
  }
  set icon(icon2) {
    this._iconElement.classList.value = "";
    this._iconElement.classList.add(...ThemeIcon.asClassNameArray(icon2));
    this._setAriaLabel();
  }
};
export { unthemedButtonStyles, buttonSanitizerConfig, buttonMarkdownRenderOptions, Button, ButtonWithDropdown, ButtonWithDescription, ButtonBar, ButtonWithIcon };
