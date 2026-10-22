// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/patternInputWidget.ts
import { Widget } from "./module-0252.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { ContextScopedHistoryInputBox } from "./module-0603.mjs";
import { showHistoryKeybindingHint } from "./module-0604.mjs";
import { trackFocus } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Toggle } from "./module-0549.mjs";
import { Codicon } from "./module-0085.mjs";
import { defaultToggleStyles } from "./module-0513.mjs";


// src/vs/workbench/contrib/search/browser/patternInputWidget.ts
var PatternInputWidget = class extends Widget {
  constructor(parent, contextViewProvider, options3, contextKeyService, configurationService, keybindingService) {
    super();
    this.contextViewProvider = contextViewProvider;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this._onSubmit = this._register(new Emitter());
    this.onSubmit = this._onSubmit.event;
    this._onCancel = this._register(new Emitter());
    this.onCancel = this._onCancel.event;
    options3 = {
      ...{
        ariaLabel: localize(18970, null)
      },
      ...options3
    };
    this.width = options3.width ?? 100;
    this.render(options3);
    parent.appendChild(this.domNode);
  }
  static {
    this.OPTION_CHANGE = "optionChange";
  }
  dispose() {
    super.dispose();
    this.inputFocusTracker?.dispose();
  }
  setWidth(newWidth) {
    this.width = newWidth;
    this.contextViewProvider.layout();
    this.setInputWidth();
  }
  getValue() {
    return this.inputBox.value;
  }
  setValue(value2) {
    if (this.inputBox.value !== value2) {
      this.inputBox.value = value2;
    }
  }
  select() {
    this.inputBox.select();
  }
  focus() {
    this.inputBox.focus();
  }
  inputHasFocus() {
    return this.inputBox.hasFocus();
  }
  setInputWidth() {
    this.inputBox.width = this.width - this.getSubcontrolsWidth() - 2;
  }
  getSubcontrolsWidth() {
    return 0;
  }
  getHistory() {
    return this.inputBox.getHistory();
  }
  clearHistory() {
    this.inputBox.clearHistory();
  }
  prependHistory(history) {
    this.inputBox.prependHistory(history);
  }
  clear() {
    this.setValue("");
  }
  onSearchSubmit() {
    this.inputBox.addToHistory();
  }
  showNextTerm() {
    this.inputBox.showNextValue();
  }
  showPreviousTerm() {
    this.inputBox.showPreviousValue();
  }
  render(options3) {
    this.domNode = document.createElement("div");
    this.domNode.classList.add("monaco-findInput");
    const history = options3.history || [];
    this.inputBox = this._register(new ContextScopedHistoryInputBox(this.domNode, this.contextViewProvider, {
      placeholder: options3.placeholder,
      showPlaceholderOnFocus: options3.showPlaceholderOnFocus,
      tooltip: options3.tooltip,
      ariaLabel: options3.ariaLabel,
      validationOptions: {
        validation: void 0
      },
      history: new Set(history),
      showHistoryHint: () => showHistoryKeybindingHint(this.keybindingService),
      inputBoxStyles: options3.inputBoxStyles
    }, this.contextKeyService));
    this._register(this.inputBox.onDidChange(() => this._onSubmit.fire(true)));
    this.inputFocusTracker = trackFocus(this.inputBox.inputElement);
    this.onkeyup(this.inputBox.inputElement, (keyboardEvent) => this.onInputKeyUp(keyboardEvent));
    const controls = document.createElement("div");
    controls.className = "controls";
    this.renderSubcontrols(controls);
    this.domNode.appendChild(controls);
    this.setInputWidth();
  }
  renderSubcontrols(_controlsDiv) {
  }
  onInputKeyUp(keyboardEvent) {
    switch (keyboardEvent.keyCode) {
      case 3 /* Enter */:
        this.onSearchSubmit();
        this._onSubmit.fire(false);
        return;
      case 9 /* Escape */:
        this._onCancel.fire();
        return;
    }
  }
};

PatternInputWidget = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IKeybindingService)
], PatternInputWidget);

var IncludePatternInputWidget = class extends PatternInputWidget {
  constructor(parent, contextViewProvider, options3, contextKeyService, configurationService, keybindingService) {
    super(parent, contextViewProvider, options3, contextKeyService, configurationService, keybindingService);
    this._onChangeSearchInEditorsBoxEmitter = this._register(new Emitter());
    this.onChangeSearchInEditorsBox = this._onChangeSearchInEditorsBoxEmitter.event;
    this._onChangeSearchInChangedFilesBoxEmitter = this._register(new Emitter());
    this.onChangeSearchInChangedFilesBox = this._onChangeSearchInChangedFilesBoxEmitter.event;
  }
  dispose() {
    super.dispose();
    this.useSearchInEditorsBox.dispose();
    this.useSearchInChangedFilesBox.dispose();
  }
  onlySearchInOpenEditors() {
    return this.useSearchInEditorsBox.checked;
  }
  setOnlySearchInOpenEditors(value2) {
    this.useSearchInEditorsBox.checked = value2;
    this._onChangeSearchInEditorsBoxEmitter.fire();
  }
  onlySearchInChangedFiles() {
    return this.useSearchInChangedFilesBox.checked;
  }
  setOnlySearchInChangedFiles(value2) {
    this.useSearchInChangedFilesBox.checked = value2;
    this._onChangeSearchInChangedFilesBoxEmitter.fire();
  }
  setOnlySearchInChangedFilesEnabled(enabled) {
    if (enabled) {
      this.useSearchInChangedFilesBox.enable();
    } else {
      this.useSearchInChangedFilesBox.checked = false;
      this.useSearchInChangedFilesBox.disable();
    }
  }
  getSubcontrolsWidth() {
    return super.getSubcontrolsWidth() + this.useSearchInEditorsBox.width() + this.useSearchInChangedFilesBox.width();
  }
  renderSubcontrols(controlsDiv) {
    this.useSearchInChangedFilesBox = this._register(new Toggle({
      icon: Codicon.editCode,
      title: localize(18971, null),
      isChecked: false,
      ...defaultToggleStyles
    }));
    this.useSearchInChangedFilesBox.disable();
    this._register(this.useSearchInChangedFilesBox.onChange((viaKeyboard) => {
      if (this.useSearchInChangedFilesBox.checked) {
        this.useSearchInEditorsBox.checked = false;
      }
      this._onChangeSearchInChangedFilesBoxEmitter.fire();
      if (!viaKeyboard) {
        this.inputBox.focus();
      }
    }));
    this.useSearchInEditorsBox = this._register(new Toggle({
      icon: Codicon.book,
      title: localize(18972, null),
      isChecked: false,
      ...defaultToggleStyles
    }));
    this._register(this.useSearchInEditorsBox.onChange((viaKeyboard) => {
      if (this.useSearchInEditorsBox.checked) {
        this.useSearchInChangedFilesBox.checked = false;
      }
      this._onChangeSearchInEditorsBoxEmitter.fire();
      if (!viaKeyboard) {
        this.inputBox.focus();
      }
    }));
    controlsDiv.appendChild(this.useSearchInChangedFilesBox.domNode);
    controlsDiv.appendChild(this.useSearchInEditorsBox.domNode);
    super.renderSubcontrols(controlsDiv);
  }
};

IncludePatternInputWidget = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IKeybindingService)
], IncludePatternInputWidget);

var ExcludePatternInputWidget = class extends PatternInputWidget {
  constructor(parent, contextViewProvider, options3, contextKeyService, configurationService, keybindingService) {
    super(parent, contextViewProvider, options3, contextKeyService, configurationService, keybindingService);
    this._onChangeIgnoreBoxEmitter = this._register(new Emitter());
    this.onChangeIgnoreBox = this._onChangeIgnoreBoxEmitter.event;
  }
  dispose() {
    super.dispose();
    this.useExcludesAndIgnoreFilesBox.dispose();
  }
  useExcludesAndIgnoreFiles() {
    return this.useExcludesAndIgnoreFilesBox.checked;
  }
  setUseExcludesAndIgnoreFiles(value2) {
    this.useExcludesAndIgnoreFilesBox.checked = value2;
    this._onChangeIgnoreBoxEmitter.fire();
  }
  getSubcontrolsWidth() {
    return super.getSubcontrolsWidth() + this.useExcludesAndIgnoreFilesBox.width();
  }
  renderSubcontrols(controlsDiv) {
    this.useExcludesAndIgnoreFilesBox = this._register(new Toggle({
      icon: Codicon.exclude,
      actionClassName: "useExcludesAndIgnoreFiles",
      title: localize(18973, null),
      isChecked: true,
      ...defaultToggleStyles
    }));
    this._register(this.useExcludesAndIgnoreFilesBox.onChange((viaKeyboard) => {
      this._onChangeIgnoreBoxEmitter.fire();
      if (!viaKeyboard) {
        this.inputBox.focus();
      }
    }));
    controlsDiv.appendChild(this.useExcludesAndIgnoreFilesBox.domNode);
    super.renderSubcontrols(controlsDiv);
  }
};

ExcludePatternInputWidget = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IKeybindingService)
], ExcludePatternInputWidget);
export { PatternInputWidget, IncludePatternInputWidget, ExcludePatternInputWidget };
