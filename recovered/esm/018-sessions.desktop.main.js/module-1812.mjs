// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/keybindingWidgets.ts
import { SearchWidget } from "./module-1811.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, Dimension, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Widget } from "./module-0252.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { localize } from "./module-0001.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { editorWidgetBackground, editorWidgetForeground } from "./module-0229.mjs";
import { defaultInputBoxStyles, defaultKeybindingLabelStyles } from "./module-0513.mjs";
import { Promises, timeout } from "./module-0036.mjs";
import { alert } from "./module-0076.mjs";
import { KeybindingLabel } from "./module-0547.mjs";
import { OS } from "./module-0014.mjs";


// src/vs/workbench/contrib/preferences/browser/keybindingWidgets.ts
var KeybindingsSearchWidget = class extends SearchWidget {
  constructor(parent, options3, contextViewService, instantiationService, contextKeyService, keybindingService) {
    super(parent, options3, contextViewService, instantiationService, contextKeyService, keybindingService);
    this.recordDisposables = this._register(new DisposableStore());
    this._onKeybinding = this._register(new Emitter());
    this.onKeybinding = this._onKeybinding.event;
    this._onEnter = this._register(new Emitter());
    this.onEnter = this._onEnter.event;
    this._onEscape = this._register(new Emitter());
    this.onEscape = this._onEscape.event;
    this._onBlur = this._register(new Emitter());
    this.onBlur = this._onBlur.event;
    this._register(toDisposable(() => this.stopRecordingKeys()));
    this._chords = null;
    this._inputValue = "";
  }
  clear() {
    this._chords = null;
    super.clear();
  }
  startRecordingKeys() {
    this.recordDisposables.add(addDisposableListener(this.inputBox.inputElement, EventType.KEY_DOWN, (e4) => this._onKeyDown(new StandardKeyboardEvent(e4))));
    this.recordDisposables.add(addDisposableListener(this.inputBox.inputElement, EventType.BLUR, () => this._onBlur.fire()));
    this.recordDisposables.add(addDisposableListener(this.inputBox.inputElement, EventType.INPUT, () => {
      this.setInputValue(this._inputValue);
    }));
  }
  stopRecordingKeys() {
    this._chords = null;
    this.recordDisposables.clear();
  }
  setInputValue(value2) {
    this._inputValue = value2;
    this.inputBox.value = this._inputValue;
  }
  _onKeyDown(keyboardEvent) {
    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    const options3 = this.options;
    if (!options3.recordEnter && keyboardEvent.equals(3 /* Enter */)) {
      this._onEnter.fire();
      return;
    }
    if (keyboardEvent.equals(9 /* Escape */)) {
      this._onEscape.fire();
      return;
    }
    this.printKeybinding(keyboardEvent);
  }
  printKeybinding(keyboardEvent) {
    const keybinding = this.keybindingService.resolveKeyboardEvent(keyboardEvent);
    const info = `code: ${keyboardEvent.browserEvent.code}, keyCode: ${keyboardEvent.browserEvent.keyCode}, key: ${keyboardEvent.browserEvent.key} => UI: ${keybinding.getAriaLabel()}, user settings: ${keybinding.getUserSettingsLabel()}, dispatch: ${keybinding.getDispatchChords()[0]}`;
    const options3 = this.options;
    if (!this._chords) {
      this._chords = [];
    }
    const hasIncompleteChord = this._chords.length > 0 && this._chords[this._chords.length - 1].getDispatchChords()[0] === null;
    if (hasIncompleteChord) {
      this._chords[this._chords.length - 1] = keybinding;
    } else {
      if (this._chords.length === 2) {
        this._chords = [];
      }
      this._chords.push(keybinding);
    }
    const value2 = this._chords.map((keybinding2) => keybinding2.getUserSettingsLabel() || "").join(" ");
    this.setInputValue(options3.quoteRecordedKeys ? `"${value2}"` : value2);
    this.inputBox.inputElement.title = info;
    this._onKeybinding.fire(this._chords);
  }
};

KeybindingsSearchWidget = __decorateClass([
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IKeybindingService)
], KeybindingsSearchWidget);

var DefineKeybindingWidget = class extends Widget {
  constructor(parent, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this._keybindingDisposables = this._register(new DisposableStore());
    this._chords = null;
    this._isVisible = false;
    this._onHide = this._register(new Emitter());
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onShowExistingKeybindings = this._register(new Emitter());
    this.onShowExistingKeybidings = this._onShowExistingKeybindings.event;
    this._domNode = createFastDomNode(document.createElement("div"));
    this._domNode.setDisplay("none");
    this._domNode.setClassName("defineKeybindingWidget");
    this._domNode.setWidth(DefineKeybindingWidget.WIDTH);
    this._domNode.setHeight(DefineKeybindingWidget.HEIGHT);
    const message = localize(18095, null);
    append(this._domNode.domNode, $(".message", void 0, message));
    this._domNode.domNode.style.backgroundColor = asCssVariable(editorWidgetBackground);
    this._domNode.domNode.style.color = asCssVariable(editorWidgetForeground);
    this._keybindingInputWidget = this._register(this.instantiationService.createInstance(KeybindingsSearchWidget, this._domNode.domNode, { ariaLabel: message, history: /* @__PURE__ */ new Set([]), inputBoxStyles: defaultInputBoxStyles }));
    this._keybindingInputWidget.startRecordingKeys();
    this._register(this._keybindingInputWidget.onKeybinding((keybinding) => this.onKeybinding(keybinding)));
    this._register(this._keybindingInputWidget.onEnter(() => this.hide()));
    this._register(this._keybindingInputWidget.onEscape(() => this.clearOrHide()));
    this._register(this._keybindingInputWidget.onBlur(() => this.onCancel()));
    this._outputNode = append(this._domNode.domNode, $(".output"));
    this._showExistingKeybindingsNode = append(this._domNode.domNode, $(".existing"));
    if (parent) {
      append(parent, this._domNode.domNode);
    }
  }
  static {
    this.WIDTH = 400;
  }
  static {
    this.HEIGHT = 110;
  }
  get domNode() {
    return this._domNode.domNode;
  }
  define() {
    this._keybindingInputWidget.clear();
    return Promises.withAsyncBody(async (c) => {
      if (!this._isVisible) {
        this._isVisible = true;
        this._domNode.setDisplay("block");
        this._chords = null;
        this._keybindingInputWidget.setInputValue("");
        clearNode(this._outputNode);
        clearNode(this._showExistingKeybindingsNode);
        await timeout(0);
        this._keybindingInputWidget.focus();
      }
      const disposable = this._onHide.event(() => {
        c(this.getUserSettingsLabel());
        disposable.dispose();
      });
    });
  }
  layout(layout2) {
    const top2 = Math.round((layout2.height - DefineKeybindingWidget.HEIGHT) / 2);
    this._domNode.setTop(top2);
    const left = Math.round((layout2.width - DefineKeybindingWidget.WIDTH) / 2);
    this._domNode.setLeft(left);
  }
  printExisting(numberOfExisting) {
    if (numberOfExisting > 0) {
      const existingElement = $("span.existingText");
      const text2 = numberOfExisting === 1 ? localize(18096, null, numberOfExisting) : localize(18094, null, numberOfExisting);
      append(existingElement, document.createTextNode(text2));
      alert(text2);
      this._showExistingKeybindingsNode.appendChild(existingElement);
      existingElement.onmousedown = (e4) => {
        e4.preventDefault();
      };
      existingElement.onmouseup = (e4) => {
        e4.preventDefault();
      };
      existingElement.onclick = () => {
        this._onShowExistingKeybindings.fire(this.getUserSettingsLabel());
      };
    }
  }
  onKeybinding(keybinding) {
    this._keybindingDisposables.clear();
    this._chords = keybinding;
    clearNode(this._outputNode);
    clearNode(this._showExistingKeybindingsNode);
    const firstLabel = this._keybindingDisposables.add(new KeybindingLabel(this._outputNode, OS, defaultKeybindingLabelStyles));
    firstLabel.set(this._chords?.[0] ?? void 0);
    if (this._chords) {
      for (let i2 = 1; i2 < this._chords.length; i2++) {
        this._outputNode.appendChild(document.createTextNode(localize(18093, null)));
        const chordLabel = this._keybindingDisposables.add(new KeybindingLabel(this._outputNode, OS, defaultKeybindingLabelStyles));
        chordLabel.set(this._chords[i2]);
      }
    }
    const label3 = this.getUserSettingsLabel();
    if (label3) {
      this._onDidChange.fire(label3);
    }
  }
  getUserSettingsLabel() {
    let label3 = null;
    if (this._chords) {
      label3 = this._chords.map((keybinding) => keybinding.getUserSettingsLabel()).join(" ");
    }
    return label3;
  }
  onCancel() {
    this._chords = null;
    this.hide();
  }
  clearOrHide() {
    if (this._chords === null) {
      this.hide();
    } else {
      this._chords = null;
      this._keybindingInputWidget.clear();
      clearNode(this._outputNode);
      clearNode(this._showExistingKeybindingsNode);
    }
  }
  hide() {
    this._domNode.setDisplay("none");
    this._isVisible = false;
    this._onHide.fire();
  }
};

DefineKeybindingWidget = __decorateClass([
  __decorateParam(1, IInstantiationService)
], DefineKeybindingWidget);

var DefineKeybindingOverlayWidget = class extends Disposable {
  constructor(_editor, instantiationService) {
    super();
    this._editor = _editor;
    this._widget = this._register(instantiationService.createInstance(DefineKeybindingWidget, null));
    this._editor.addOverlayWidget(this);
  }
  static {
    this.ID = "editor.contrib.defineKeybindingWidget";
  }
  getId() {
    return DefineKeybindingOverlayWidget.ID;
  }
  getDomNode() {
    return this._widget.domNode;
  }
  getPosition() {
    return {
      preference: null
    };
  }
  dispose() {
    this._editor.removeOverlayWidget(this);
    super.dispose();
  }
  start() {
    if (this._editor.hasModel()) {
      this._editor.revealPositionInCenterIfOutsideViewport(this._editor.getPosition(), 0 /* Smooth */);
    }
    const layoutInfo = this._editor.getLayoutInfo();
    this._widget.layout(new Dimension(layoutInfo.width, layoutInfo.height));
    return this._widget.define();
  }
};

DefineKeybindingOverlayWidget = __decorateClass([
  __decorateParam(1, IInstantiationService)
], DefineKeybindingOverlayWidget);
export { KeybindingsSearchWidget, DefineKeybindingWidget, DefineKeybindingOverlayWidget };
