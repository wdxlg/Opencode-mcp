// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/find/browser/findOptionsWidget.ts
import { Widget } from "./module-0252.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { inputActiveOptionBackground, inputActiveOptionBorder, inputActiveOptionForeground } from "./module-0233.mjs";
import { CaseSensitiveToggle, RegexToggle, WholeWordsToggle } from "./module-0596.mjs";
import { FIND_IDS } from "./module-0595.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";


// src/vs/editor/contrib/find/browser/findOptionsWidget.ts
var FindOptionsWidget = class _FindOptionsWidget extends Widget {
  constructor(editor, state, keybindingService) {
    super();
    this._hideSoon = this._register(new RunOnceScheduler(() => this._hide(), 2e3));
    this._isVisible = false;
    this._editor = editor;
    this._state = state;
    this._keybindingService = keybindingService;
    this._domNode = document.createElement("div");
    this._domNode.className = "findOptionsWidget";
    this._domNode.style.display = "none";
    this._domNode.style.top = "10px";
    this._domNode.style.zIndex = "12";
    this._domNode.setAttribute("role", "presentation");
    this._domNode.setAttribute("aria-hidden", "true");
    const toggleStyles = {
      inputActiveOptionBorder: asCssVariable(inputActiveOptionBorder),
      inputActiveOptionForeground: asCssVariable(inputActiveOptionForeground),
      inputActiveOptionBackground: asCssVariable(inputActiveOptionBackground)
    };
    const hoverLifecycleOptions2 = { groupId: "find-options-widget" };
    this.caseSensitive = this._register(new CaseSensitiveToggle({
      appendTitle: this._keybindingLabelFor(FIND_IDS.ToggleCaseSensitiveCommand),
      isChecked: this._state.matchCase,
      hoverLifecycleOptions: hoverLifecycleOptions2,
      ...toggleStyles
    }));
    this._domNode.appendChild(this.caseSensitive.domNode);
    this._register(this.caseSensitive.onChange(() => {
      this._state.change({
        matchCase: this.caseSensitive.checked
      }, false);
    }));
    this.wholeWords = this._register(new WholeWordsToggle({
      appendTitle: this._keybindingLabelFor(FIND_IDS.ToggleWholeWordCommand),
      isChecked: this._state.wholeWord,
      hoverLifecycleOptions: hoverLifecycleOptions2,
      ...toggleStyles
    }));
    this._domNode.appendChild(this.wholeWords.domNode);
    this._register(this.wholeWords.onChange(() => {
      this._state.change({
        wholeWord: this.wholeWords.checked
      }, false);
    }));
    this.regex = this._register(new RegexToggle({
      appendTitle: this._keybindingLabelFor(FIND_IDS.ToggleRegexCommand),
      isChecked: this._state.isRegex,
      hoverLifecycleOptions: hoverLifecycleOptions2,
      ...toggleStyles
    }));
    this._domNode.appendChild(this.regex.domNode);
    this._register(this.regex.onChange(() => {
      this._state.change({
        isRegex: this.regex.checked
      }, false);
    }));
    this._editor.addOverlayWidget(this);
    this._register(this._state.onFindReplaceStateChange((e4) => {
      let somethingChanged = false;
      if (e4.isRegex) {
        this.regex.checked = this._state.isRegex;
        somethingChanged = true;
      }
      if (e4.wholeWord) {
        this.wholeWords.checked = this._state.wholeWord;
        somethingChanged = true;
      }
      if (e4.matchCase) {
        this.caseSensitive.checked = this._state.matchCase;
        somethingChanged = true;
      }
      if (!this._state.isRevealed && somethingChanged) {
        this._revealTemporarily();
      }
    }));
    this._register(addDisposableListener(this._domNode, EventType.MOUSE_LEAVE, (e4) => this._onMouseLeave()));
    this._register(addDisposableListener(this._domNode, "mouseover", (e4) => this._onMouseOver()));
  }
  static {
    this.ID = "editor.contrib.findOptionsWidget";
  }
  _keybindingLabelFor(actionId) {
    return this._keybindingService.appendKeybinding("", actionId);
  }
  dispose() {
    this._editor.removeOverlayWidget(this);
    super.dispose();
  }
  // ----- IOverlayWidget API
  getId() {
    return _FindOptionsWidget.ID;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return {
      preference: 0 /* TOP_RIGHT_CORNER */
    };
  }
  highlightFindOptions() {
    this._revealTemporarily();
  }
  _revealTemporarily() {
    this._show();
    this._hideSoon.schedule();
  }
  _onMouseLeave() {
    this._hideSoon.schedule();
  }
  _onMouseOver() {
    this._hideSoon.cancel();
  }
  _show() {
    if (this._isVisible) {
      return;
    }
    this._isVisible = true;
    this._domNode.style.display = "block";
  }
  _hide() {
    if (!this._isVisible) {
      return;
    }
    this._isVisible = false;
    this._domNode.style.display = "none";
  }
};
export { FindOptionsWidget };
