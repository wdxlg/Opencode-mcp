// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/quickInputBox.ts
import { $, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { FindInput } from "./module-0601.mjs";
import { createToggleActionViewItemProvider } from "./module-0549.mjs";
import { severity_default } from "./module-0266.mjs";


// src/vs/platform/quickinput/browser/quickInputBox.ts
var $17 = $;

var QuickInputBox = class extends Disposable {
  constructor(parent, inputBoxStyles, toggleStyles) {
    super();
    this.parent = parent;
    this._listFocusMode = false;
    this.onDidChange = (handler) => {
      return this.findInput.onDidChange(handler);
    };
    this.container = append(this.parent, $17(".quick-input-box"));
    this.findInput = this._register(new FindInput(
      this.container,
      void 0,
      {
        label: "",
        inputBoxStyles,
        toggleStyles,
        actionViewItemProvider: createToggleActionViewItemProvider(toggleStyles),
        hideHoverOnValueChange: true
      }
    ));
  }
  get onKeyDown() {
    return this.findInput.onKeyDown;
  }
  get onMouseDown() {
    return this.findInput.onMouseDown;
  }
  get value() {
    return this.findInput.getValue();
  }
  set value(value2) {
    this.findInput.setValue(value2);
  }
  select(range2 = null) {
    this.findInput.inputBox.select(range2);
  }
  getSelection() {
    return this.findInput.inputBox.getSelection();
  }
  isSelectionAtEnd() {
    return this.findInput.inputBox.isSelectionAtEnd();
  }
  setPlaceholder(placeholder) {
    this.findInput.inputBox.setPlaceHolder(placeholder);
  }
  get placeholder() {
    return this.findInput.inputBox.inputElement.getAttribute("placeholder") || "";
  }
  set placeholder(placeholder) {
    this.findInput.inputBox.setPlaceHolder(placeholder);
  }
  get password() {
    return this.findInput.inputBox.inputElement.type === "password";
  }
  set password(password) {
    this.findInput.inputBox.inputElement.type = password ? "password" : "text";
  }
  set enabled(enabled) {
    this.findInput.inputBox.inputElement.toggleAttribute("readonly", !enabled);
  }
  set toggles(toggles) {
    this.findInput.setAdditionalToggles(toggles);
  }
  set actions(actions) {
    this.setActions(actions);
  }
  setActions(actions, actionViewItemProvider) {
    this.findInput.setActions(actions, actionViewItemProvider);
  }
  get ariaLabel() {
    return this.findInput.inputBox.inputElement.getAttribute("aria-label") || "";
  }
  set ariaLabel(ariaLabel) {
    this.findInput.inputBox.inputElement.setAttribute("aria-label", ariaLabel);
  }
  hasFocus() {
    return this.findInput.inputBox.hasFocus();
  }
  setAttribute(name, value2) {
    this.findInput.inputBox.inputElement.setAttribute(name, value2);
  }
  removeAttribute(name) {
    this.findInput.inputBox.inputElement.removeAttribute(name);
  }
  /**
   * Controls the ARIA popup mode for screen readers.
   * When enabled (hasActiveDescendant=true), indicates a list popup is active.
   * When disabled, removes ARIA attributes to allow normal text input behavior.
   * Only updates attributes when the state actually changes to avoid
   * unnecessary screen reader re-announcements.
   */
  setListFocusMode(hasActiveDescendant) {
    if (this._listFocusMode === hasActiveDescendant) {
      return;
    }
    this._listFocusMode = hasActiveDescendant;
    const input = this.findInput.inputBox.inputElement;
    if (hasActiveDescendant) {
      input.setAttribute("aria-haspopup", "listbox");
      input.setAttribute("aria-autocomplete", "list");
    } else {
      input.removeAttribute("aria-haspopup");
      input.removeAttribute("aria-autocomplete");
    }
  }
  showDecoration(decoration3) {
    if (decoration3 === severity_default.Ignore) {
      this.findInput.clearMessage();
    } else {
      this.findInput.showMessage({ type: decoration3 === severity_default.Info ? 1 /* INFO */ : decoration3 === severity_default.Warning ? 2 /* WARNING */ : 3 /* ERROR */, content: "" });
    }
  }
  stylesForType(decoration3) {
    return this.findInput.inputBox.stylesForType(decoration3 === severity_default.Info ? 1 /* INFO */ : decoration3 === severity_default.Warning ? 2 /* WARNING */ : 3 /* ERROR */);
  }
  setFocus() {
    this.findInput.focus();
  }
  layout() {
    this.findInput.inputBox.layout();
  }
  setHeight(height) {
    this.findInput.inputBox.element.style.height = height === void 0 ? "" : `${height}px`;
  }
};
export { $17, QuickInputBox };
