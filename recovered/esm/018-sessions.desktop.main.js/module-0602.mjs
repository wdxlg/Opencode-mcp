// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/findinput/replaceInput.ts
import { localize } from "./module-0001.mjs";
import { Toggle } from "./module-0549.mjs";
import { Codicon } from "./module-0085.mjs";
import { Widget } from "./module-0252.mjs";
import { Emitter } from "./module-0017.mjs";
import { HistoryInputBox } from "./module-0600.mjs";
import { navigateToggles } from "./module-0596.mjs";


// src/vs/base/browser/ui/findinput/replaceInput.ts
var NLS_DEFAULT_LABEL2 = localize(13, null);

var NLS_PRESERVE_CASE_LABEL = localize(14, null);

var PreserveCaseToggle = class extends Toggle {
  constructor(opts) {
    super({
      // TODO: does this need its own icon?
      icon: Codicon.preserveCase,
      title: NLS_PRESERVE_CASE_LABEL + opts.appendTitle,
      isChecked: opts.isChecked,
      hoverLifecycleOptions: opts.hoverLifecycleOptions,
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground
    });
  }
};

var ReplaceInput = class extends Widget {
  constructor(parent, contextViewProvider, _showOptionButtons, options3) {
    super();
    this._showOptionButtons = _showOptionButtons;
    this.fixFocusOnOptionClickEnabled = true;
    this.cachedOptionsWidth = 0;
    this._onDidOptionChange = this._register(new Emitter());
    this._onKeyDown = this._register(new Emitter());
    this._onMouseDown = this._register(new Emitter());
    this._onInput = this._register(new Emitter());
    this._onKeyUp = this._register(new Emitter());
    this._onPreserveCaseKeyDown = this._register(new Emitter());
    this._lastHighlightFindOptions = 0;
    this.contextViewProvider = contextViewProvider;
    this.placeholder = options3.placeholder || "";
    this.validation = options3.validation;
    this.label = options3.label || NLS_DEFAULT_LABEL2;
    const appendPreserveCaseLabel = options3.appendPreserveCaseLabel || "";
    const history = options3.history || /* @__PURE__ */ new Set([]);
    const flexibleHeight = !!options3.flexibleHeight;
    const flexibleWidth = !!options3.flexibleWidth;
    const flexibleMaxHeight = options3.flexibleMaxHeight;
    this.domNode = document.createElement("div");
    this.domNode.classList.add("monaco-findInput");
    this.inputBox = this._register(new HistoryInputBox(this.domNode, this.contextViewProvider, {
      ariaLabel: this.label || "",
      placeholder: this.placeholder || "",
      validationOptions: {
        validation: this.validation
      },
      history,
      showHistoryHint: options3.showHistoryHint,
      flexibleHeight,
      flexibleWidth,
      flexibleMaxHeight,
      inputBoxStyles: options3.inputBoxStyles
    }));
    this.preserveCase = this._register(new PreserveCaseToggle({
      appendTitle: appendPreserveCaseLabel,
      isChecked: false,
      hoverLifecycleOptions: options3.hoverLifecycleOptions,
      ...options3.toggleStyles
    }));
    this._register(this.preserveCase.onChange((viaKeyboard) => {
      this._onDidOptionChange.fire(viaKeyboard);
      if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
        this.inputBox.focus();
      }
      this.validate();
    }));
    this._register(this.preserveCase.onKeyDown((e4) => {
      this._onPreserveCaseKeyDown.fire(e4);
    }));
    if (this._showOptionButtons) {
      this.cachedOptionsWidth = this.preserveCase.width();
    } else {
      this.cachedOptionsWidth = 0;
    }
    const indexes = [this.preserveCase.domNode];
    this.onkeydown(this.domNode, (event) => {
      navigateToggles(event, this.domNode, () => indexes, () => this.inputBox.focus());
    });
    const controls = document.createElement("div");
    controls.className = "controls";
    controls.style.display = this._showOptionButtons ? "block" : "none";
    controls.appendChild(this.preserveCase.domNode);
    this.domNode.appendChild(controls);
    parent?.appendChild(this.domNode);
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
  get onPreserveCaseKeyDown() {
    return this._onPreserveCaseKeyDown.event;
  }
  enable() {
    this.domNode.classList.remove("disabled");
    this.inputBox.enable();
    this.preserveCase.enable();
  }
  disable() {
    this.domNode.classList.add("disabled");
    this.inputBox.disable();
    this.preserveCase.disable();
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
  applyStyles() {
  }
  select() {
    this.inputBox.select();
  }
  focus() {
    this.inputBox.focus();
  }
  getPreserveCase() {
    return this.preserveCase.checked;
  }
  setPreserveCase(value2) {
    this.preserveCase.checked = value2;
  }
  focusOnPreserve() {
    this.preserveCase.focus();
  }
  highlightFindOptions() {
    this.domNode.classList.remove("highlight-" + this._lastHighlightFindOptions);
    this._lastHighlightFindOptions = 1 - this._lastHighlightFindOptions;
    this.domNode.classList.add("highlight-" + this._lastHighlightFindOptions);
  }
  validate() {
    this.inputBox?.validate();
  }
  showMessage(message) {
    this.inputBox?.showMessage(message);
  }
  clearMessage() {
    this.inputBox?.hideMessage();
  }
  clearValidation() {
    this.inputBox?.hideMessage();
  }
  set width(newWidth) {
    this.inputBox.paddingRight = this.cachedOptionsWidth;
    this.domNode.style.width = newWidth + "px";
  }
};
export { NLS_DEFAULT_LABEL2, NLS_PRESERVE_CASE_LABEL, PreserveCaseToggle, ReplaceInput };
