// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/findinput/findInput.ts
import { localize } from "./module-0001.mjs";
import { Widget } from "./module-0252.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { HistoryInputBox } from "./module-0600.mjs";
import { CaseSensitiveToggle, RegexToggle, WholeWordsToggle, navigateToggles } from "./module-0596.mjs";
import { addDisposableListener } from "./module-0075.mjs";


// src/vs/base/browser/ui/findinput/findInput.ts
var NLS_DEFAULT_LABEL = localize(9, null);

var FindInput = class extends Widget {
  constructor(parent, contextViewProvider, options3) {
    super();
    this.fixFocusOnOptionClickEnabled = true;
    this.imeSessionInProgress = false;
    this.additionalTogglesDisposables = this._register(new MutableDisposable());
    this.additionalToggles = [];
    this._onDidOptionChange = this._register(new Emitter());
    this._onKeyDown = this._register(new Emitter());
    this._onMouseDown = this._register(new Emitter());
    this._onInput = this._register(new Emitter());
    this._onKeyUp = this._register(new Emitter());
    this._onCaseSensitiveKeyDown = this._register(new Emitter());
    this._onRegexKeyDown = this._register(new Emitter());
    this._lastHighlightFindOptions = 0;
    this.placeholder = options3.placeholder || "";
    this.validation = options3.validation;
    this.label = options3.label || NLS_DEFAULT_LABEL;
    this.showCommonFindToggles = !!options3.showCommonFindToggles;
    const appendCaseSensitiveLabel = options3.appendCaseSensitiveLabel || "";
    const appendWholeWordsLabel = options3.appendWholeWordsLabel || "";
    const appendRegexLabel = options3.appendRegexLabel || "";
    const flexibleHeight = !!options3.flexibleHeight;
    const flexibleWidth = !!options3.flexibleWidth;
    const flexibleMaxHeight = options3.flexibleMaxHeight;
    this.domNode = document.createElement("div");
    this.domNode.classList.add("monaco-findInput");
    this.inputBox = this._register(new HistoryInputBox(this.domNode, contextViewProvider, {
      placeholder: this.placeholder || "",
      ariaLabel: this.label || "",
      validationOptions: {
        validation: this.validation
      },
      showHistoryHint: options3.showHistoryHint,
      flexibleHeight,
      flexibleWidth,
      flexibleMaxHeight,
      inputBoxStyles: options3.inputBoxStyles,
      history: options3.history,
      actions: options3.actions,
      actionViewItemProvider: options3.actionViewItemProvider,
      hideHoverOnValueChange: options3.hideHoverOnValueChange
    }));
    if (this.showCommonFindToggles) {
      const hoverLifecycleOptions2 = options3?.hoverLifecycleOptions || { groupId: "find-input" };
      this.regex = this._register(new RegexToggle({
        appendTitle: appendRegexLabel,
        isChecked: false,
        hoverLifecycleOptions: hoverLifecycleOptions2,
        ...options3.toggleStyles
      }));
      this._register(this.regex.onChange((viaKeyboard) => {
        this._onDidOptionChange.fire(viaKeyboard);
        if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
          this.inputBox.focus();
        }
        this.validate();
      }));
      this._register(this.regex.onKeyDown((e4) => {
        this._onRegexKeyDown.fire(e4);
      }));
      this.wholeWords = this._register(new WholeWordsToggle({
        appendTitle: appendWholeWordsLabel,
        isChecked: false,
        hoverLifecycleOptions: hoverLifecycleOptions2,
        ...options3.toggleStyles
      }));
      this._register(this.wholeWords.onChange((viaKeyboard) => {
        this._onDidOptionChange.fire(viaKeyboard);
        if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
          this.inputBox.focus();
        }
        this.validate();
      }));
      this.caseSensitive = this._register(new CaseSensitiveToggle({
        appendTitle: appendCaseSensitiveLabel,
        isChecked: false,
        hoverLifecycleOptions: hoverLifecycleOptions2,
        ...options3.toggleStyles
      }));
      this._register(this.caseSensitive.onChange((viaKeyboard) => {
        this._onDidOptionChange.fire(viaKeyboard);
        if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
          this.inputBox.focus();
        }
        this.validate();
      }));
      this._register(this.caseSensitive.onKeyDown((e4) => {
        this._onCaseSensitiveKeyDown.fire(e4);
      }));
      this.onkeydown(this.domNode, (event) => {
        navigateToggles(event, this.domNode, () => this.getToggleDomNodes(), () => this.inputBox.focus());
      });
    }
    this.controls = document.createElement("div");
    this.controls.className = "controls";
    this.controls.style.display = this.showCommonFindToggles ? "" : "none";
    if (this.caseSensitive) {
      this.controls.append(this.caseSensitive.domNode);
    }
    if (this.wholeWords) {
      this.controls.appendChild(this.wholeWords.domNode);
    }
    if (this.regex) {
      this.controls.appendChild(this.regex.domNode);
    }
    this.setAdditionalToggles(options3?.additionalToggles);
    if (this.controls) {
      this.domNode.appendChild(this.controls);
    }
    parent?.appendChild(this.domNode);
    this._register(addDisposableListener(this.inputBox.inputElement, "compositionstart", (e4) => {
      this.imeSessionInProgress = true;
    }));
    this._register(addDisposableListener(this.inputBox.inputElement, "compositionend", (e4) => {
      this.imeSessionInProgress = false;
      this._onInput.fire();
    }));
    this.onkeydown(this.inputBox.inputElement, (e4) => this._onKeyDown.fire(e4));
    this.onkeyup(this.inputBox.inputElement, (e4) => this._onKeyUp.fire(e4));
    this.oninput(this.inputBox.inputElement, (e4) => this._onInput.fire());
    this.onmousedown(this.inputBox.inputElement, (e4) => this._onMouseDown.fire(e4));
  }
  static {
    this.OPTION_CHANGE = "optionChange";
  }
  get onDidOptionChange() {
    return this._onDidOptionChange.event;
  }
  get onKeyDown() {
    return this._onKeyDown.event;
  }
  get onMouseDown() {
    return this._onMouseDown.event;
  }
  get onInput() {
    return this._onInput.event;
  }
  get onKeyUp() {
    return this._onKeyUp.event;
  }
  get onCaseSensitiveKeyDown() {
    return this._onCaseSensitiveKeyDown.event;
  }
  get onRegexKeyDown() {
    return this._onRegexKeyDown.event;
  }
  get isImeSessionInProgress() {
    return this.imeSessionInProgress;
  }
  get onDidChange() {
    return this.inputBox.onDidChange;
  }
  layout(style) {
    this.inputBox.layout();
    this.updateInputBoxPadding(style.collapsedFindWidget);
  }
  enable() {
    this.domNode.classList.remove("disabled");
    this.inputBox.enable();
    this.regex?.enable();
    this.wholeWords?.enable();
    this.caseSensitive?.enable();
    for (const toggle of this.additionalToggles) {
      toggle.enable();
    }
  }
  disable() {
    this.domNode.classList.add("disabled");
    this.inputBox.disable();
    this.regex?.disable();
    this.wholeWords?.disable();
    this.caseSensitive?.disable();
    for (const toggle of this.additionalToggles) {
      toggle.disable();
    }
  }
  setFocusInputOnOptionClick(value2) {
    this.fixFocusOnOptionClickEnabled = value2;
  }
  setEnabled(enabled) {
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }
  setAdditionalToggles(toggles) {
    for (const currentToggle of this.additionalToggles) {
      currentToggle.domNode.remove();
    }
    this.additionalToggles = [];
    this.additionalTogglesDisposables.value = new DisposableStore();
    for (const toggle of toggles ?? []) {
      this.additionalTogglesDisposables.value.add(toggle);
      this.controls.appendChild(toggle.domNode);
      this.additionalTogglesDisposables.value.add(toggle.onChange((viaKeyboard) => {
        this._onDidOptionChange.fire(viaKeyboard);
        if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
          this.inputBox.focus();
        }
      }));
      this.additionalToggles.push(toggle);
    }
    if (this.additionalToggles.length > 0) {
      this.controls.style.display = "";
    }
    this.updateInputBoxPadding();
  }
  getToggleDomNodes() {
    const nodes = [];
    if (this.caseSensitive) {
      nodes.push(this.caseSensitive.domNode);
    }
    if (this.wholeWords) {
      nodes.push(this.wholeWords.domNode);
    }
    if (this.regex) {
      nodes.push(this.regex.domNode);
    }
    for (const toggle of this.additionalToggles) {
      nodes.push(toggle.domNode);
    }
    return nodes;
  }
  setActions(actions, actionViewItemProvider) {
    this.inputBox.setActions(actions, actionViewItemProvider);
    this.updateInputBoxPadding();
  }
  updateInputBoxPadding(controlsHidden = false) {
    const togglesWidth = controlsHidden ? 0 : (this.caseSensitive?.width() ?? 0) + (this.wholeWords?.width() ?? 0) + (this.regex?.width() ?? 0) + this.additionalToggles.reduce((r2, t2) => r2 + t2.width(), 0);
    this.inputBox.paddingRight = togglesWidth + this.inputBox.actionsWidth;
  }
  clear() {
    this.clearValidation();
    this.setValue("");
    this.focus();
  }
  getValue() {
    return this.inputBox.value;
  }
  setValue(value2) {
    if (this.inputBox.value !== value2) {
      this.inputBox.value = value2;
    }
  }
  onSearchSubmit() {
    this.inputBox.addToHistory();
  }
  select() {
    this.inputBox.select();
  }
  focus() {
    this.inputBox.focus();
  }
  getCaseSensitive() {
    return this.caseSensitive?.checked ?? false;
  }
  setCaseSensitive(value2) {
    if (this.caseSensitive) {
      this.caseSensitive.checked = value2;
    }
  }
  getWholeWords() {
    return this.wholeWords?.checked ?? false;
  }
  setWholeWords(value2) {
    if (this.wholeWords) {
      this.wholeWords.checked = value2;
    }
  }
  getRegex() {
    return this.regex?.checked ?? false;
  }
  setRegex(value2) {
    if (this.regex) {
      this.regex.checked = value2;
      this.validate();
    }
  }
  focusOnCaseSensitive() {
    this.caseSensitive?.focus();
  }
  focusOnRegex() {
    this.regex?.focus();
  }
  highlightFindOptions() {
    this.domNode.classList.remove("highlight-" + this._lastHighlightFindOptions);
    this._lastHighlightFindOptions = 1 - this._lastHighlightFindOptions;
    this.domNode.classList.add("highlight-" + this._lastHighlightFindOptions);
  }
  validate() {
    this.inputBox.validate();
  }
  showMessage(message) {
    this.inputBox.showMessage(message);
  }
  clearMessage() {
    this.inputBox.hideMessage();
  }
  clearValidation() {
    this.inputBox.hideMessage();
  }
};
export { NLS_DEFAULT_LABEL, FindInput };
